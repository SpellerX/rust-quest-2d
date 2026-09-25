import type { Span } from '../types'
import type { BinaryOp, Expr, Program, Statement } from './ast'
import { fail } from './errors'
import { tokenize } from './lexer'
import type { PrimitiveType } from './game-api'
import type { Token } from './tokens'

const COMPARISON_OPS = new Set(['==', '!=', '<', '>', '<=', '>='])
const PRIMITIVE_TYPES = new Set<PrimitiveType>(['i32', 'f64', 'bool'])

class Parser {
  private pos = 0

  constructor(private readonly tokens: Token[]) {}

  private peek(offset = 0): Token {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)]!
  }

  private next(): Token {
    const tok = this.peek()
    if (tok.type !== 'eof') this.pos++
    return tok
  }

  private isPunct(value: string, offset = 0): boolean {
    const tok = this.peek(offset)
    return tok.type === 'punct' && tok.value === value
  }

  private isOp(value: string, offset = 0): boolean {
    const tok = this.peek(offset)
    return tok.type === 'op' && tok.value === value
  }

  private isKeyword(value: string, offset = 0): boolean {
    const tok = this.peek(offset)
    return tok.type === 'keyword' && tok.value === value
  }

  private expectPunct(value: string): Token {
    if (!this.isPunct(value)) {
      fail('E0002', this.peek().span, value)
    }
    return this.next()
  }

  private expectOp(value: string): Token {
    if (!this.isOp(value)) {
      fail('E0002', this.peek().span, value)
    }
    return this.next()
  }

  parseProgram(): Program {
    const body: Statement[] = []
    while (this.peek().type !== 'eof') {
      body.push(this.parseStatement())
    }
    return { kind: 'Program', body }
  }

  private parseStatement(): Statement {
    if (this.isKeyword('let')) return this.parseLet()

    // Atribuição: `nome = expr;` (só se for um `=` simples, não `==`)
    if (this.peek().type === 'ident' && this.isOp('=', 1)) return this.parseAssign()

    return this.parseExprStmt()
  }

  private parseLet(): Statement {
    const letTok = this.next() // let
    const mut = this.isKeyword('mut')
    if (mut) this.next()

    const nameTok = this.peek()
    if (nameTok.type !== 'ident') {
      fail('E0002', nameTok.span, 'variável')
    }
    this.next()

    let typeAnn: PrimitiveType | undefined
    if (this.isPunct(':')) {
      this.next()
      const typeTok = this.peek()
      if (typeTok.type !== 'keyword' || !PRIMITIVE_TYPES.has(typeTok.value as PrimitiveType)) {
        fail('E0002', typeTok.span, 'i32, f64 ou bool')
      }
      typeAnn = typeTok.value as PrimitiveType
      this.next()
    }

    this.expectOp('=')
    if (this.isPunct(';')) fail('E0002', this.peek().span, 'expressão')
    const value = this.parseExpr()
    this.expectPunct(';')

    return {
      kind: 'LetDecl',
      mut,
      name: nameTok.value,
      typeAnn,
      value,
      span: { ...letTok.span, end: value.span.end },
    }
  }

  private parseAssign(): Statement {
    const nameTok = this.next() // ident
    this.next() // '='
    if (this.isPunct(';')) fail('E0002', this.peek().span, 'expressão')
    const value = this.parseExpr()
    this.expectPunct(';')
    return { kind: 'Assign', name: nameTok.value, value, span: nameTok.span }
  }

  private parseExprStmt(): Statement {
    const expr = this.parseExpr()
    this.expectPunct(';')
    return { kind: 'ExprStmt', expr, span: expr.span }
  }

  private parseExpr(): Expr {
    return this.parseComparison()
  }

  private parseComparison(): Expr {
    const left = this.parseAdd()
    const tok = this.peek()
    if (tok.type === 'op' && COMPARISON_OPS.has(tok.value)) {
      this.next()
      const right = this.parseAdd()
      return { kind: 'Binary', op: tok.value as BinaryOp, left, right, span: tok.span }
    }
    return left
  }

  private parseAdd(): Expr {
    let left = this.parseMul()
    while (this.peek().type === 'op' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.next()
      const right = this.parseMul()
      left = { kind: 'Binary', op: op.value as BinaryOp, left, right, span: op.span }
    }
    return left
  }

  private parseMul(): Expr {
    let left = this.parseUnary()
    while (
      this.peek().type === 'op'
      && (this.peek().value === '*' || this.peek().value === '/' || this.peek().value === '%')
    ) {
      const op = this.next()
      const right = this.parseUnary()
      left = { kind: 'Binary', op: op.value as BinaryOp, left, right, span: op.span }
    }
    return left
  }

  private parseUnary(): Expr {
    if (this.isOp('-')) {
      const op = this.next()
      const operand = this.parseUnary()
      return { kind: 'Unary', op: '-', operand, span: op.span }
    }
    return this.parsePrimary()
  }

  private parsePrimary(): Expr {
    const tok = this.peek()

    if (tok.type === 'int') {
      this.next()
      return { kind: 'Literal', value: Number(tok.value), litType: 'i32', span: tok.span }
    }
    if (tok.type === 'float') {
      this.next()
      return { kind: 'Literal', value: Number(tok.value), litType: 'f64', span: tok.span }
    }
    if (tok.type === 'keyword' && (tok.value === 'true' || tok.value === 'false')) {
      this.next()
      return { kind: 'Literal', value: tok.value === 'true', litType: 'bool', span: tok.span }
    }

    if (tok.type === 'ident') {
      this.next()
      if (this.isPunct('(')) {
        this.next()
        const args: Expr[] = []
        if (!this.isPunct(')')) {
          while (true) {
            args.push(this.parseExpr())
            if (this.isPunct(',')) {
              this.next()
              continue
            }
            break
          }
        }
        const close = this.expectPunct(')')
        return {
          kind: 'Call',
          callee: tok.value,
          args,
          span: { ...tok.span, end: close.span.end },
        }
      }
      return { kind: 'Ident', name: tok.value, span: tok.span }
    }

    if (tok.type === 'punct' && tok.value === '(') {
      this.next()
      const inner = this.parseExpr()
      this.expectPunct(')')
      return inner
    }

    if (tok.type === 'eof') {
      fail('E0001', tok.span, 'fim do código inesperado')
    }
    fail('E0001', tok.span, `“${tok.value}”`)
  }
}

export function parse(source: string): Program {
  return new Parser(tokenize(source)).parseProgram()
}
