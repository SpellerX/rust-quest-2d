import type { Expr, Program, Statement } from './ast'
import { fail } from './errors'
import { GAME_API, type PrimitiveType } from './game-api'

interface SymbolInfo {
  type: PrimitiveType
  mut: boolean
}

export interface CheckOptions {
  allowedFunctions: string[]
}

const ARITH_OPS = new Set(['+', '-', '*', '/', '%'])

function typeName(t: PrimitiveType): string {
  if (t === 'i32') return 'um número inteiro (i32)'
  if (t === 'f64') return 'um número decimal (f64)'
  return 'um valor true/false (bool)'
}

/** Checa chamada de função de jogo; retorna sempre void (só valida). */
function checkCall(
  expr: Expr & { kind: 'Call' },
  symbols: Map<string, SymbolInfo>,
  opts: CheckOptions,
): void {
  const spec = GAME_API[expr.callee as keyof typeof GAME_API]
  if (!spec) fail('E0425', expr.span, `\`${expr.callee}\``)
  if (!opts.allowedFunctions.includes(expr.callee)) {
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
    const t = infer(arg, symbols, { allowedFunctions: opts.allowedFunctions })
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
function infer(expr: Expr, symbols: Map<string, SymbolInfo>, opts: CheckOptions): PrimitiveType {
  switch (expr.kind) {
    case 'Literal':
      return expr.litType

    case 'Ident': {
      const sym = symbols.get(expr.name)
      if (!sym) fail('E0412', expr.span, `\`${expr.name}\``)
      return sym.type
    }

    case 'Unary': {
      const t = infer(expr.operand, symbols, opts)
      if (t === 'bool') fail('E0308', expr.span, 'Não dá para usar o sinal - com true/false.')
      return t
    }

    case 'Binary': {
      const lt = infer(expr.left, symbols, opts)
      const rt = infer(expr.right, symbols, opts)
      if (lt !== rt) {
        fail(
          'E0308',
          expr.span,
          `Os dois lados do operador \`${expr.op}\` precisam ser do mesmo tipo: à esquerda é ${typeName(lt)}, à direita é ${typeName(rt)}.`,
        )
      }
      if (ARITH_OPS.has(expr.op)) {
        if (lt === 'bool') {
          fail('E0308', expr.span, 'Não dá para fazer conta com true/false — use números.')
        }
        return lt
      }
      return 'bool'
    }

    case 'Call':
      checkCall(expr, symbols, opts)
      // Comandos do jogo não retornam valor utilizável.
      fail('E0003', expr.span, 'Os comandos do jogo não retornam valor. Use-os sozinhos na linha, sem guardar em variáveis.')
  }
}

function checkStatement(
  stmt: Statement,
  symbols: Map<string, SymbolInfo>,
  opts: CheckOptions,
): void {
  switch (stmt.kind) {
    case 'LetDecl': {
      const vt = infer(stmt.value, symbols, opts)
      if (stmt.typeAnn && stmt.typeAnn !== vt) {
        fail(
          'E0308',
          stmt.value.span,
          `Você declarou \`${stmt.name}\` como ${stmt.typeAnn}, mas o valor é ${typeName(vt)}.`,
        )
      }
      symbols.set(stmt.name, { type: stmt.typeAnn ?? vt, mut: stmt.mut })
      return
    }

    case 'Assign': {
      const sym = symbols.get(stmt.name)
      if (!sym) fail('E0412', stmt.span, `\`${stmt.name}\``)
      if (!sym.mut) fail('E0384', stmt.span, `\`${stmt.name}\``)
      const vt = infer(stmt.value, symbols, opts)
      if (vt !== sym.type) {
        fail(
          'E0308',
          stmt.value.span,
          `Você está guardando ${typeName(vt)} em \`${stmt.name}\`, que é ${typeName(sym.type)}.`,
        )
      }
      return
    }

    case 'ExprStmt': {
      if (stmt.expr.kind !== 'Call') {
        fail('E0003', stmt.span)
      }
      checkCall(stmt.expr, symbols, opts)
      return
    }
  }
}

export function check(program: Program, opts: CheckOptions): void {
  const symbols = new Map<string, SymbolInfo>()
  for (const stmt of program.body) {
    checkStatement(stmt, symbols, opts)
  }
}
