import type { Block, Expr, FnDecl, Program, Statement } from './ast'
import type { Span } from '../types'
import { fail } from './errors'
import { GAME_API, type PrimitiveType } from './game-api'

interface SymbolInfo {
  type: PrimitiveType
  mut: boolean
  /** Só tipos não-Copy (String) são movidos; uso após move = E0382. */
  moved: boolean
}

interface FnInfo {
  params: { name: string; type: PrimitiveType }[]
  retType?: PrimitiveType
  span: Span
}

export interface CheckOptions {
  allowedFunctions: string[]
}

interface Ctx {
  /** Pilha de escopos de blocos — o último é o escopo atual. */
  scopes: Map<string, SymbolInfo>[]
  fns: Map<string, FnInfo>
  opts: CheckOptions
  loopDepth: number
  /** Pilha de tipos de retorno (uma entrada por `fn` em análise). */
  retStack: (PrimitiveType | undefined)[]
}

const ARITH_OPS = new Set(['+', '-', '*', '/', '%'])
const CMP_STRICT_OPS = new Set(['==', '!='])

function typeName(t: PrimitiveType): string {
  if (t === 'i32') return 'um número inteiro (i32)'
  if (t === 'f64') return 'um número decimal (f64)'
  if (t === 'bool') return 'um valor true/false (bool)'
  return 'um texto (String)'
}

function declare(ctx: Ctx, name: string, info: SymbolInfo): void {
  ctx.scopes[ctx.scopes.length - 1]!.set(name, info)
}

function lookup(ctx: Ctx, name: string): SymbolInfo | undefined {
  for (let i = ctx.scopes.length - 1; i >= 0; i--) {
    const sym = ctx.scopes[i]!.get(name)
    if (sym) return sym
  }
  return undefined
}

/**
 * Valida um argumento e aplica a regra de posse: passar um identificador
 * `String` por valor MOVE a propriedade; `&x` empresta (não move).
 */
function checkArg(arg: Expr, paramType: PrimitiveType, ctx: Ctx): PrimitiveType {
  const t = infer(arg, ctx)
  if (arg.kind === 'Ident' && paramType === 'String' && t === 'String') {
    const sym = lookup(ctx, arg.name)!
    sym.moved = true
  }
  return t
}

function argCountMessage(fnName: string, given: number, expected: number): string {
  return `A função \`${fnName}\` espera ${expected} argumento${expected === 1 ? '' : 's'}, mas você passou ${given}.`
}

function checkArgs(
  fnName: string,
  args: Expr[],
  params: { name: string; type: PrimitiveType }[],
  span: Span,
  ctx: Ctx,
): void {
  if (args.length !== params.length) {
    fail('E0061', span, argCountMessage(fnName, args.length, params.length))
  }
  for (let i = 0; i < args.length; i++) {
    const param = params[i]!
    const t = checkArg(args[i]!, param.type, ctx)
    if (t !== param.type) {
      fail(
        'E0308',
        args[i]!.span,
        `A função \`${fnName}\` espera ${typeName(param.type)} para \`${param.name}\`, mas recebeu ${typeName(t)}.`,
      )
    }
  }
}

/** Checa chamada da API de jogo; retorna sempre void (só valida). */
function checkGameCall(
  expr: Expr & { kind: 'Call' },
  ctx: Ctx,
): void {
  const spec = GAME_API[expr.callee as keyof typeof GAME_API]
  if (!spec) fail('E0425', expr.span, `\`${expr.callee}\``)
  if (!ctx.opts.allowedFunctions.includes(expr.callee)) {
    fail('E0901', expr.span, `\`${expr.callee}\``)
  }

  const params = spec.params
  const required = params.filter(p => !p.optional).length
  if (expr.args.length < required || expr.args.length > params.length) {
    const expected = required === params.length
      ? `${required} argumento${required === 1 ? '' : 's'}`
      : `de ${required} a ${params.length} argumentos`
    fail(
      'E0061',
      expr.span,
      `O comando \`${expr.callee}\` espera ${expected}, mas você passou ${expr.args.length}.`,
    )
  }

  for (let i = 0; i < expr.args.length; i++) {
    const arg = expr.args[i]!
    const param = params[i]!
    const t = checkArg(arg, param.type, ctx)
    if (t !== param.type) {
      fail(
        'E0308',
        arg.span,
        `O comando \`${expr.callee}\` espera ${typeName(param.type)} para \`${param.name}\`, mas recebeu ${typeName(t)}.`,
      )
    }
  }
}

/** Infere o tipo de uma expressão, validando chamadas aninhadas no caminho. */
function infer(expr: Expr, ctx: Ctx): PrimitiveType {
  switch (expr.kind) {
    case 'Literal':
      return expr.litType

    case 'Ident': {
      const sym = lookup(ctx, expr.name)
      if (!sym) fail('E0412', expr.span, `\`${expr.name}\``)
      if (sym.moved) fail('E0382', expr.span, `\`${expr.name}\``)
      return sym.type
    }

    case 'Unary': {
      if (expr.op === '&') {
        // Empréstimo: valida o uso sem marcar move.
        return infer(expr.operand, ctx)
      }
      const t = infer(expr.operand, ctx)
      if (expr.op === '!') {
        if (t !== 'bool') {
          fail('E0308', expr.span, `O operador ! só funciona com true/false, mas aqui é ${typeName(t)}.`)
        }
        return 'bool'
      }
      if (t === 'bool' || t === 'String') {
        fail('E0308', expr.span, 'Não dá para usar o sinal - com true/false ou texto.')
      }
      return t
    }

    case 'Binary': {
      const lt = infer(expr.left, ctx)
      const rt = infer(expr.right, ctx)
      if (lt !== rt) {
        fail(
          'E0308',
          expr.span,
          `Os dois lados do operador \`${expr.op}\` precisam ser do mesmo tipo: à esquerda é ${typeName(lt)}, à direita é ${typeName(rt)}.`,
        )
      }
      if (expr.op === '&&' || expr.op === '||') {
        if (lt !== 'bool') {
          fail('E0308', expr.span, `Os operadores ${expr.op} ligam condições true/false, masreceberam ${typeName(lt)}.`)
        }
        return 'bool'
      }
      if (ARITH_OPS.has(expr.op)) {
        if (lt !== 'i32' && lt !== 'f64') {
          fail('E0308', expr.span, 'Não dá para fazer conta com true/false ou texto — use números.')
        }
        return lt
      }
      if (lt === 'String' && !CMP_STRICT_OPS.has(expr.op)) {
        fail('E0308', expr.span, 'Textos só podem ser comparados com == ou !=.')
      }
      return 'bool'
    }

    case 'Call': {
      const fn = ctx.fns.get(expr.callee)
      if (fn) {
        checkArgs(expr.callee, expr.args, fn.params, expr.span, ctx)
        if (!fn.retType) {
          fail('E0003', expr.span, `A função \`${expr.callee}\` não retorna valor — use-a sozinha na linha, como um comando.`)
        }
        return fn.retType
      }
      checkGameCall(expr, ctx)
      // Comandos de jogo não retornam valor utilizável.
      fail('E0003', expr.span, 'Os comandos do jogo não retornam valor. Use-os sozinhos na linha, sem guardar em variáveis.')
    }
  }
}

function checkCond(cond: Expr, ctx: Ctx, keyword: string): void {
  const t = infer(cond, ctx)
  if (t !== 'bool') {
    fail('E0308', cond.span, `A condição do ${keyword} precisa ser um valor true/false (bool), mas é ${typeName(t)}.`)
  }
}

function checkBlock(block: Block, ctx: Ctx, pre?: () => void): void {
  ctx.scopes.push(new Map())
  pre?.()
  for (const stmt of block.stmts) checkStatement(stmt, ctx)
  if (block.tail) infer(block.tail, ctx)
  ctx.scopes.pop()
}

function checkStatement(stmt: Statement, ctx: Ctx): void {
  switch (stmt.kind) {
    case 'LetDecl': {
      const vt = infer(stmt.value, ctx)
      if (stmt.typeAnn && stmt.typeAnn !== vt) {
        fail(
          'E0308',
          stmt.value.span,
          `Você declarou \`${stmt.name}\` como ${stmt.typeAnn}, mas o valor é ${typeName(vt)}.`,
        )
      }
      // `let b = a;` com String move a posse de `a` para `b`.
      if (vt === 'String' && stmt.value.kind === 'Ident') {
        lookup(ctx, stmt.value.name)!.moved = true
      }
      declare(ctx, stmt.name, { type: stmt.typeAnn ?? vt, mut: stmt.mut, moved: false })
      return
    }

    case 'Assign': {
      const sym = lookup(ctx, stmt.name)
      if (!sym) fail('E0412', stmt.span, `\`${stmt.name}\``)
      if (!sym.mut) fail('E0384', stmt.span, `\`${stmt.name}\``)
      const vt = infer(stmt.value, ctx)
      if (vt !== sym.type) {
        fail(
          'E0308',
          stmt.value.span,
          `Você está guardando ${typeName(vt)} em \`${stmt.name}\`, que é ${typeName(sym.type)}.`,
        )
      }
      if (vt === 'String' && stmt.value.kind === 'Ident') {
        lookup(ctx, stmt.value.name)!.moved = true
      }
      // Reatribuição dá um valor novo: desfaz um move anterior do alvo.
      sym.moved = false
      return
    }

    case 'ExprStmt': {
      if (stmt.expr.kind !== 'Call') {
        fail('E0003', stmt.span)
      }
      const fn = ctx.fns.get(stmt.expr.callee)
      if (fn) {
        checkArgs(stmt.expr.callee, stmt.expr.args, fn.params, stmt.expr.span, ctx)
        return
      }
      checkGameCall(stmt.expr, ctx)
      return
    }

    case 'If':
      checkCond(stmt.cond, ctx, 'if')
      checkBlock(stmt.then, ctx)
      if (stmt.otherwise) {
        if (stmt.otherwise.kind === 'Block') checkBlock(stmt.otherwise, ctx)
        else checkStatement(stmt.otherwise, ctx)
      }
      return

    case 'While':
      checkCond(stmt.cond, ctx, 'while')
      ctx.loopDepth++
      checkBlock(stmt.body, ctx)
      ctx.loopDepth--
      return

    case 'Loop':
      ctx.loopDepth++
      checkBlock(stmt.body, ctx)
      ctx.loopDepth--
      return

    case 'For': {
      const ft = infer(stmt.from, ctx)
      const tt = infer(stmt.to, ctx)
      if (ft !== 'i32' || tt !== 'i32') {
        fail('E0308', stmt.span, 'O laço for precisa de números inteiros (i32) nos dois lados de ..')
      }
      ctx.loopDepth++
      checkBlock(stmt.body, ctx, () => {
        declare(ctx, stmt.varName, { type: 'i32', mut: false, moved: false })
      })
      ctx.loopDepth--
      return
    }

    case 'Break':
    case 'Continue':
      if (ctx.loopDepth === 0) {
        fail('E0004', stmt.span, stmt.kind === 'Break' ? 'break' : 'continue')
      }
      return

    case 'Return': {
      if (ctx.retStack.length === 0) {
        fail('E0572', stmt.span)
      }
      const retType = ctx.retStack[ctx.retStack.length - 1]
      if (!stmt.value) {
        if (retType) {
          fail('E0308', stmt.span, `Esta função deveria retornar ${typeName(retType)}.`)
        }
        return
      }
      const vt = infer(stmt.value, ctx)
      if (!retType) {
        fail('E0308', stmt.value.span, 'Esta função não tem -> retorno, mas você usou return com valor.')
      }
      if (vt !== retType) {
        fail('E0308', stmt.value.span, `A função deveria retornar ${typeName(retType)}, mas return traz ${typeName(vt)}.`)
      }
      return
    }

    case 'FnDecl':
      // Só no topo do arquivo (o parser já restringe; defensivo).
      fail('E0428', stmt.span, `\`${stmt.name}\``)
  }
}

function checkFnBody(fn: FnDecl, ctx: Ctx): void {
  if (fn.retType && !fn.body.tail && !endsWithReturn(fn.body)) {
    fail(
      'E0308',
      fn.span,
      `A função \`${fn.name}\` deveria retornar ${typeName(fn.retType)}, mas o corpo não retorna nada.`,
    )
  }
  ctx.retStack.push(fn.retType)
  ctx.scopes.push(new Map())
  for (const p of fn.params) {
    declare(ctx, p.name, { type: p.type, mut: false, moved: false })
  }
  for (const stmt of fn.body.stmts) checkStatement(stmt, ctx)
  if (fn.body.tail) {
    const tt = infer(fn.body.tail, ctx)
    if (fn.retType && tt !== fn.retType) {
      fail(
        'E0308',
        fn.body.tail.span,
        `A função \`${fn.name}\` deveria retornar ${typeName(fn.retType)}, mas o corpo retorna ${typeName(tt)}.`,
      )
    }
  }
  ctx.scopes.pop()
  ctx.retStack.pop()
}

function endsWithReturn(block: Block): boolean {
  const last = block.stmts[block.stmts.length - 1]
  if (!last) return false
  if (last.kind === 'Return') return true
  // if/else em que ambos os ramos retornam.
  if (last.kind === 'If' && last.otherwise) {
    const thenReturns = last.then.tail === undefined && endsWithReturn(last.then)
    const elseReturns = last.otherwise.kind === 'Block'
      ? (last.otherwise.tail === undefined && endsWithReturn(last.otherwise))
      : endsWithIfReturn(last.otherwise)
    return thenReturns && elseReturns
  }
  return false
}

function endsWithIfReturn(stmt: Statement): boolean {
  if (stmt.kind !== 'If') return false
  if (stmt.then.tail) return false // tail não é return explícito
  const thenOk = endsWithReturn(stmt.then)
  if (!stmt.otherwise) return false
  const elseOk = stmt.otherwise.kind === 'Block' ? endsWithReturn(stmt.otherwise) : endsWithIfReturn(stmt.otherwise)
  return thenOk && elseOk
}

export function check(program: Program, opts: CheckOptions): void {
  const ctx: Ctx = {
    scopes: [new Map()],
    fns: new Map(),
    opts,
    loopDepth: 0,
    retStack: [],
  }

  // Passo 1: coleta as `fn` do topo (permite mútua recursão).
  for (const stmt of program.body) {
    if (stmt.kind !== 'FnDecl') continue
    if (ctx.fns.has(stmt.name) || stmt.name in GAME_API) {
      fail('E0428', stmt.span, `\`${stmt.name}\``)
    }
    ctx.fns.set(stmt.name, {
      params: stmt.params.map(p => ({ name: p.name, type: p.type })),
      retType: stmt.retType,
      span: stmt.span,
    })
  }

  // Passo 2: checa o corpo de cada função (dentro do escopo global).
  for (const stmt of program.body) {
    if (stmt.kind === 'FnDecl') checkFnBody(stmt, ctx)
  }

  // Passo 3: statements principais.
  for (const stmt of program.body) {
    if (stmt.kind === 'FnDecl') continue
    checkStatement(stmt, ctx)
  }
}
