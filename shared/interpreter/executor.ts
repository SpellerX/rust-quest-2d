import type { GameCommand, Span } from '../types'
import type { Expr, Program } from './ast'
import { fail } from './errors'
import type { PrimitiveType } from './game-api'

interface Value {
  v: number | boolean
  t: PrimitiveType
}

interface ExecLimits {
  evalSteps: number
}

// Limites de segurança — os contadores já existem para quando loops/if
// entrarem pós-MVP: basta estourar E0900 em vez de travar a aba.
const MAX_COMMANDS = 500
const MAX_STEPS_PER_MOVE = 100
const MAX_EVAL_STEPS = 50_000

function tick(limits: ExecLimits) {
  limits.evalSteps++
  if (limits.evalSteps > MAX_EVAL_STEPS) {
    fail('E0900', { line: 1, col: 1, start: 0, end: 0 }, 'programa grande demais')
  }
}

function evalExpr(
  expr: Expr,
  env: Map<string, Value>,
  limits: ExecLimits,
): Value {
  tick(limits)
  switch (expr.kind) {
    case 'Literal':
      return { v: expr.value, t: expr.litType }

    case 'Ident': {
      const val = env.get(expr.name)
      if (!val) fail('E0412', expr.span, `\`${expr.name}\``)
      return val
    }

    case 'Unary': {
      const operand = evalExpr(expr.operand, env, limits)
      return { v: -(operand.v as number), t: operand.t }
    }

    case 'Binary': {
      const { span, op } = expr
      const left = evalExpr(expr.left, env, limits)
      const right = evalExpr(expr.right, env, limits)
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

    case 'Call':
      fail('E0003', expr.span, 'Os comandos do jogo não retornam valor. Use-os sozinhos na linha, sem guardar em variáveis.')
  }
}

function numArg(args: Value[], index: number, fallback: number): number {
  return args[index] ? (args[index]!.v as number) : fallback
}

export function run(program: Program): GameCommand[] {
  const env = new Map<string, Value>()
  const commands: GameCommand[] = []
  const limits: ExecLimits = { evalSteps: 0 }

  const push = (cmd: GameCommand, span: Span) => {
    if (commands.length >= MAX_COMMANDS) fail('E0900', span, 'comandos demais')
    commands.push({ ...cmd, src: span })
  }

  for (const stmt of program.body) {
    switch (stmt.kind) {
      case 'LetDecl':
        env.set(stmt.name, evalExpr(stmt.value, env, limits))
        break

      case 'Assign':
        env.set(stmt.name, evalExpr(stmt.value, env, limits))
        break

      case 'ExprStmt': {
        const call = stmt.expr
        if (call.kind !== 'Call') fail('E0003', stmt.span)
        const args = call.args.map(a => evalExpr(a, env, limits))

        switch (call.callee) {
          case 'mover_direita':
          case 'mover_esquerda': {
            const steps = numArg(args, 0, 0)
            if (Math.abs(steps) > MAX_STEPS_PER_MOVE) {
              fail('E0900', call.span, 'passos')
            }
            push(
              {
                type: 'move',
                direction: call.callee === 'mover_direita' ? 'right' : 'left',
                steps,
                src: call.span,
              },
              call.span,
            )
            break
          }
          case 'pular': {
            const force = numArg(args, 0, 1)
            if (force > MAX_STEPS_PER_MOVE) fail('E0900', call.span, 'força')
            push({ type: 'jump', force, src: call.span }, call.span)
            break
          }
          case 'esperar': {
            const seconds = numArg(args, 0, 0)
            const durationMs = Math.min(10_000, Math.max(0, Math.round(seconds * 1000)))
            push({ type: 'wait', durationMs, src: call.span }, call.span)
            break
          }
          default:
            fail('E0425', call.span, `\`${call.callee}\``)
        }
        break
      }
    }
  }

  return commands
}
