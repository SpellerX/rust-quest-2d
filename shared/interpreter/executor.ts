import type { GameCommand, Span } from '../types'
import type { Block, Expr, FnDecl, Program, Statement } from './ast'
import { fail } from './errors'
import type { PrimitiveType } from './game-api'

interface Value {
  v: number | boolean | string
  t: PrimitiveType
}

/** Sinal de controle que atravessa blocos (return chega na fn, break no laço). */
type Signal =
  | { type: 'normal' }
  | { type: 'break' }
  | { type: 'continue' }
  | { type: 'return'; value?: Value }

interface ExecLimits {
  evalSteps: number
}

const NORMAL: Signal = { type: 'normal' }

// Limites de segurança — estourar qualquer um vira E0900 em vez de travar a aba.
const MAX_COMMANDS = 500
const MAX_STEPS_PER_MOVE = 100
const MAX_EVAL_STEPS = 50_000
const MAX_CALL_DEPTH = 64

interface ExecState {
  scopes: Map<string, Value>[]
  fns: Map<string, FnDecl>
  limits: ExecLimits
  commands: GameCommand[]
  callDepth: number
}

function tick(state: ExecState, span: Span, what: string) {
  state.limits.evalSteps++
  if (state.limits.evalSteps > MAX_EVAL_STEPS) {
    fail('E0900', span, what)
  }
}

function lookup(state: ExecState, name: string, span: Span): Value {
  for (let i = state.scopes.length - 1; i >= 0; i--) {
    const val = state.scopes[i]!.get(name)
    if (val) return val
  }
  fail('E0412', span, `\`${name}\``)
}

function evalExpr(expr: Expr, state: ExecState): Value {
  tick(state, expr.span, 'programa grande demais')
  switch (expr.kind) {
    case 'Literal':
      return { v: expr.value, t: expr.litType }

    case 'Ident':
      return lookup(state, expr.name, expr.span)

    case 'Unary': {
      if (expr.op === '&') {
        // Empréstimo: na execução é o mesmo valor (posse só muda no checker).
        return evalExpr(expr.operand, state)
      }
      const operand = evalExpr(expr.operand, state)
      if (expr.op === '!') return { v: !(operand.v as boolean), t: 'bool' }
      return { v: -(operand.v as number), t: operand.t }
    }

    case 'Binary': {
      const { span, op } = expr
      const left = evalExpr(expr.left, state)
      // Curto-circuito: o lado direito só roda se precisar.
      if (op === '&&') return { v: (left.v as boolean) && (evalExpr(expr.right, state).v as boolean), t: 'bool' }
      if (op === '||') return { v: (left.v as boolean) || (evalExpr(expr.right, state).v as boolean), t: 'bool' }
      const right = evalExpr(expr.right, state)
      const a = left.v as number
      const b = right.v as number

      if ((op === '/' || op === '%') && b === 0) {
        fail('E0201', span)
      }

      switch (op) {
        case '+': return { v: a + b, t: left.t }
        case '-': return { v: a - b, t: left.t }
        case '*': return { v: a * b, t: left.t }
        case '/':
          // Divisão inteira trunca em direção ao zero (igual ao Rust).
          return { v: left.t === 'i32' ? Math.trunc(a / b) : a / b, t: left.t }
        case '%': return { v: left.t === 'i32' ? Math.trunc(a % b) : a % b, t: left.t }
        case '==': return { v: left.v === right.v, t: 'bool' }
        case '!=': return { v: left.v !== right.v, t: 'bool' }
        case '<': return { v: a < b, t: 'bool' }
        case '>': return { v: a > b, t: 'bool' }
        case '<=': return { v: a <= b, t: 'bool' }
        case '>=': return { v: a >= b, t: 'bool' }
      }
      // Operador sempre coberto acima; linha defensiva inalcançável.
      fail('E0001', span, op)
    }

    case 'Call': {
      const fn = state.fns.get(expr.callee)
      if (fn) {
        const result = callUserFn(expr.callee, expr.args, expr.span, state)
        if (!result) {
          fail('E0003', expr.span, `A função \`${expr.callee}\` não retorna valor — use-a sozinha na linha, como um comando.`)
        }
        return result
      }
      // O checker já barra isso; defensivo aqui.
      fail('E0003', expr.span, 'Os comandos do jogo não retornam valor. Use-os sozinhos na linha, sem guardar em variáveis.')
    }
  }
}

function numArg(args: Value[], index: number, fallback: number): number {
  return args[index] ? (args[index]!.v as number) : fallback
}

function callUserFn(name: string, argExprs: Expr[], span: Span, state: ExecState): Value | undefined {
  const fn = state.fns.get(name)
  if (!fn) fail('E0425', span, `\`${name}\``)

  state.callDepth++
  if (state.callDepth > MAX_CALL_DEPTH) {
    state.callDepth--
    fail('E0900', span, 'chamadas demais (recursão infinita?)')
  }

  const args = argExprs.map(a => evalExpr(a, state))
  state.scopes.push(new Map())
  fn.params.forEach((p, i) => {
    state.scopes[state.scopes.length - 1]!.set(p.name, args[i]!)
  })

  let result: Value | undefined
  let signal: Signal = NORMAL
  for (const stmt of fn.body.stmts) {
    signal = execStmt(stmt, state)
    if (signal.type !== 'normal') break
  }
  if (signal.type === 'return') {
    result = signal.value
  }
  else if (signal.type === 'normal' && fn.body.tail) {
    result = evalExpr(fn.body.tail, state)
  }

  state.scopes.pop()
  state.callDepth--

  if (fn.retType && !result) {
    fail('E0308', span, `A função \`${name}\` deveria retornar um valor, mas o corpo não retornou nada.`)
  }
  return result
}

function execBlock(block: Block, state: ExecState, pre?: () => void): Signal {
  state.scopes.push(new Map())
  pre?.()
  let signal: Signal = NORMAL
  for (const stmt of block.stmts) {
    signal = execStmt(stmt, state)
    if (signal.type !== 'normal') break
  }
  // Tail de bloco comum: valor descartado (só a fn usa tail como retorno),
  // mas a expressão roda — pode conter chamadas com efeito.
  if (signal.type === 'normal' && block.tail) evalExpr(block.tail, state)
  state.scopes.pop()
  return signal
}

function execStmt(stmt: Statement, state: ExecState): Signal {
  tick(state, stmt.span, 'programa grande demais')
  switch (stmt.kind) {
    case 'LetDecl':
      state.scopes[state.scopes.length - 1]!.set(stmt.name, evalExpr(stmt.value, state))
      return NORMAL

    case 'Assign': {
      const value = evalExpr(stmt.value, state)
      for (let i = state.scopes.length - 1; i >= 0; i--) {
        if (state.scopes[i]!.has(stmt.name)) {
          state.scopes[i]!.set(stmt.name, value)
          return NORMAL
        }
      }
      fail('E0412', stmt.span, `\`${stmt.name}\``)
    }

    case 'ExprStmt': {
      if (stmt.expr.kind !== 'Call') fail('E0003', stmt.span)
      const call = stmt.expr
      if (state.fns.has(call.callee)) {
        callUserFn(call.callee, call.args, call.span, state)
        return NORMAL
      }
      const args = call.args.map(a => evalExpr(a, state))

      switch (call.callee) {
        case 'mover_direita':
        case 'mover_esquerda': {
          const steps = numArg(args, 0, 0)
          if (Math.abs(steps) > MAX_STEPS_PER_MOVE) {
            fail('E0900', call.span, 'passos')
          }
          pushCommand(state, {
            type: 'move',
            direction: call.callee === 'mover_direita' ? 'right' : 'left',
            steps,
            src: call.span,
          })
          break
        }
        case 'pular': {
          const force = numArg(args, 0, 1)
          if (force > MAX_STEPS_PER_MOVE) fail('E0900', call.span, 'força')
          pushCommand(state, { type: 'jump', force, src: call.span })
          break
        }
        case 'esperar': {
          const seconds = numArg(args, 0, 0)
          const durationMs = Math.min(10_000, Math.max(0, Math.round(seconds * 1000)))
          pushCommand(state, { type: 'wait', durationMs, src: call.span })
          break
        }
        case 'falar': {
          pushCommand(state, {
            type: 'speak',
            text: String(args[0]?.v ?? ''),
            src: call.span,
          })
          break
        }
        default:
          fail('E0425', call.span, `\`${call.callee}\``)
      }
      return NORMAL
    }

    case 'If': {
      const cond = evalExpr(stmt.cond, state)
      if (cond.v as boolean) return execBlock(stmt.then, state)
      if (stmt.otherwise) {
        if (stmt.otherwise.kind === 'Block') return execBlock(stmt.otherwise, state)
        return execStmt(stmt.otherwise, state)
      }
      return NORMAL
    }

    case 'While': {
      while (evalExpr(stmt.cond, state).v as boolean) {
        tick(state, stmt.span, 'laço while demais')
        const signal = execBlock(stmt.body, state)
        if (signal.type === 'break') break
        if (signal.type === 'return') return signal
      }
      return NORMAL
    }

    case 'Loop': {
      while (true) {
        tick(state, stmt.span, 'laço loop demais')
        const signal = execBlock(stmt.body, state)
        if (signal.type === 'break') break
        if (signal.type === 'return') return signal
      }
      return NORMAL
    }

    case 'For': {
      const from = evalExpr(stmt.from, state).v as number
      const to = evalExpr(stmt.to, state).v as number
      // Igual ao Rust: 5..0 é um intervalo vazio (só cresce).
      for (let i = from; i < to; i++) {
        tick(state, stmt.span, 'laço for demais')
        const signal = execBlock(stmt.body, state, () => {
          state.scopes[state.scopes.length - 1]!.set(stmt.varName, { v: i, t: 'i32' })
        })
        if (signal.type === 'break') break
        if (signal.type === 'return') return signal
      }
      return NORMAL
    }

    case 'Break':
      return { type: 'break' }

    case 'Continue':
      return { type: 'continue' }

    case 'Return':
      return { type: 'return', value: stmt.value ? evalExpr(stmt.value, state) : undefined }

    case 'FnDecl':
      // Coletados no início da execução; não devem chegar aqui.
      fail('E0428', stmt.span, `\`${stmt.name}\``)
  }
}

function pushCommand(state: ExecState, cmd: GameCommand): void {
  if (state.commands.length >= MAX_COMMANDS) fail('E0900', cmd.src, 'comandos demais')
  state.commands.push(cmd)
}

export function run(program: Program): GameCommand[] {
  const state: ExecState = {
    scopes: [new Map()],
    fns: new Map(),
    limits: { evalSteps: 0 },
    commands: [],
    callDepth: 0,
  }

  for (const stmt of program.body) {
    if (stmt.kind === 'FnDecl') {
      state.fns.set(stmt.name, stmt)
    }
  }

  for (const stmt of program.body) {
    if (stmt.kind === 'FnDecl') continue
    execStmt(stmt, state)
  }

  return state.commands
}
