import type { Span } from '../types'
import type { BinaryOp, Block, Expr, FnDecl, If, Program, Statement } from './ast'
import { fail } from './errors'
import { tokenize } from './lexer'
import type { PrimitiveType } from './game-api'
import type { Token } from './tokens'

const COMPARISON_OPS = new Set(['==', '!=', '<', '>', '<=', '>='])
const PRIMITIVE_TYPES = new Set<PrimitiveType>(['i32', 'f64', 'bool', 'String'])

/** Palavras-chave que iniciam um statement (usado para detectar tail de bloco). */
const STMT_KEYWORDS = new Set(['let', 'if', 'while', 'loop', 'for', 'return', 'break', 'continue'])

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

  private expectKeyword(value: string): Token {
    if (!this.isKeyword(value)) {
      fail('E0002', this.peek().span, value)
    }
    return this.next()
  }

  parseProgram(): Program {
    const body: Statement[] = []
    while (this.peek().type !== 'eof') {
      if (this.isKeyword('fn')) {
        body.push(this.parseFn())
        continue
      }
      body.push(this.parseStatement())
    }
    return { kind: 'Program', body }
  }

  /** Início de um statement simples (sem `fn`, que é item de topo). */
  private startsStatement(): boolean {
    const tok = this.peek()
    if (tok.type === 'keyword' && STMT_KEYWORDS.has(tok.value)) return true
    // Atribuição: ident seguido de `=` simples.
    return tok.type === 'ident' && this.isOp('=', 1)
  }

  private parseStatement(): Statement {
    if (this.isKeyword('let')) return this.parseLet()
    if (this.isKeyword('if')) return this.parseIf()
    if (this.isKeyword('while')) return this.parseWhile()
    if (this.isKeyword('loop')) return this.parseLoop()
    if (this.isKeyword('for')) return this.parseFor()
    if (this.isKeyword('return')) return this.parseReturn()
    if (this.isKeyword('break')) {
      const tok = this.next()
      this.expectPunct(';')
      return { kind: 'Break', span: tok.span }
    }
    if (this.isKeyword('continue')) {
      const tok = this.next()
      this.expectPunct(';')
      return { kind: 'Continue', span: tok.span }
    }

    // Atribuição: `nome = expr;` (só se for um `=` simples, não `==`)
    if (this.peek().type === 'ident' && this.isOp('=', 1)) return this.parseAssign()

    return this.parseExprStmt()
  }

  private parseType(): PrimitiveType {
    const tok = this.peek()
    if (tok.type !== 'keyword' || !PRIMITIVE_TYPES.has(tok.value as PrimitiveType)) {
      fail('E0002', tok.span, 'i32, f64, bool ou String')
    }
    this.next()
    return tok.value as PrimitiveType
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
      typeAnn = this.parseType()
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

  private parseReturn(): Statement {
    const tok = this.next() // return
    if (this.isPunct(';')) {
      this.next()
      return { kind: 'Return', span: tok.span }
    }
    const value = this.parseExpr()
    this.expectPunct(';')
    return { kind: 'Return', value, span: tok.span }
  }

  /**
   * Bloco `{ ... }` com escopo próprio. A última expressão SEM `;` é a
   * "tail" (return implícito do Rust).
   */
  private parseBlock(): Block {
    const open = this.expectPunct('{')
    const stmts: Statement[] = []
    let tail: Expr | undefined

    while (!this.isPunct('}')) {
      if (this.peek().type === 'eof') {
        fail('E0002', this.peek().span, '}')
      }
      if (this.startsStatement()) {
        stmts.push(this.parseStatement())
        continue
      }
      // Expressão: com `;` vira statement, sem `;` antes de `}` é a tail.
      const expr = this.parseExpr()
      if (this.isPunct(';')) {
        this.next()
        stmts.push({ kind: 'ExprStmt', expr, span: expr.span })
      }
      else if (this.isPunct('}')) {
        tail = expr
      }
      else {
        fail('E0002', this.peek().span, ';')
      }
    }
    const close = this.next() // }
    return { kind: 'Block', stmts, tail, span: { ...open.span, end: close.span.end } }
  }

  private parseIf(): If {
    const tok = this.next() // if
    const cond = this.parseExpr()
    const then = this.parseBlock()
    let otherwise: Block | If | undefined
    if (this.isKeyword('else')) {
      this.next()
      otherwise = this.isKeyword('if') ? this.parseIf() : this.parseBlock()
    }
    return { kind: 'If', cond, then, otherwise, span: tok.span }
  }

  private parseWhile(): Statement {
    const tok = this.next() // while
    const cond = this.parseExpr()
    const body = this.parseBlock()
    return { kind: 'While', cond, body, span: tok.span }
  }

  private parseLoop(): Statement {
    const tok = this.next() // loop
    const body = this.parseBlock()
    return { kind: 'Loop', body, span: tok.span }
  }

  private parseFor(): Statement {
    const tok = this.next() // for
    const varTok = this.peek()
    if (varTok.type !== 'ident') fail('E0002', varTok.span, 'variável')
    this.next()
    this.expectKeyword('in')
    const from = this.parseAdd()
    this.expectOp('..')
    const to = this.parseAdd()
    const body = this.parseBlock()
    return { kind: 'For', varName: varTok.value, from, to, body, span: tok.span }
  }

  private parseFn(): FnDecl {
    const tok = this.next() // fn
    const nameTok = this.peek()
    if (nameTok.type !== 'ident') fail('E0002', nameTok.span, 'nome da função')
    this.next()

    this.expectPunct('(')
    const params = []
    if (!this.isPunct(')')) {
      while (true) {
        const pTok = this.peek()
        if (pTok.type !== 'ident') fail('E0002', pTok.span, 'parâmetro')
        this.next()
        this.expectPunct(':')
        const type = this.parseType()
        params.push({ name: pTok.value, type, span: pTok.span })
        if (this.isPunct(',')) {
          this.next()
          continue
        }
        break
      }
    }
    this.expectPunct(')')

    let retType: PrimitiveType | undefined
    if (this.isOp('->')) {
      this.next()
      retType = this.parseType()
    }

    const body = this.parseBlock()
    return { kind: 'FnDecl', name: nameTok.value, params, retType, body, span: tok.span }
  }

  private parseExpr(): Expr {
    return this.parseOr()
  }

  private parseOr(): Expr {
    let left = this.parseAnd()
    while (this.isOp('||')) {
      const op = this.next()
      const right = this.parseAnd()
      left = { kind: 'Binary', op: '||', left, right, span: op.span }
    }
    return left
  }

  private parseAnd(): Expr {
    let left = this.parseComparison()
    while (this.isOp('&&')) {
      const op = this.next()
      const right = this.parseComparison()
      left = { kind: 'Binary', op: '&&', left, right, span: op.span }
    }
    return left
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
    if (this.isOp('!')) {
      const op = this.next()
      const operand = this.parseUnary()
      return { kind: 'Unary', op: '!', operand, span: op.span }
    }
    if (this.isPunct('&')) {
      const op = this.next()
      const operand = this.parseUnary()
      return { kind: 'Unary', op: '&', operand, span: op.span }
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
    if (tok.type === 'string') {
      this.next()
      return { kind: 'Literal', value: tok.value, litType: 'String', span: tok.span }
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
