import type { PrimitiveType } from './game-api'
import type { Span } from '../types'

export interface LetDecl {
  kind: 'LetDecl'
  mut: boolean
  name: string
  typeAnn?: PrimitiveType
  value: Expr
  span: Span
}

export interface Assign {
  kind: 'Assign'
  name: string
  value: Expr
  span: Span
}

export interface ExprStmt {
  kind: 'ExprStmt'
  expr: Expr
  span: Span
}

export type BinaryOp =
  | '+' | '-' | '*' | '/' | '%'
  | '==' | '!=' | '<' | '>' | '<=' | '>='
  | '&&' | '||'

export interface Binary {
  kind: 'Binary'
  op: BinaryOp
  left: Expr
  right: Expr
  span: Span
}

export interface Unary {
  kind: 'Unary'
  op: '-' | '!' | '&'
  operand: Expr
  span: Span
}

export interface Literal {
  kind: 'Literal'
  value: number | boolean | string
  litType: PrimitiveType
  span: Span
}

export interface Ident {
  kind: 'Ident'
  name: string
  span: Span
}

export interface Call {
  kind: 'Call'
  callee: string
  args: Expr[]
  span: Span
}

export type Expr = Binary | Unary | Literal | Ident | Call

/**
 * Bloco `{ ... }` com escopo próprio. `tail` é a expressão final SEM `;`
 * (o "return implícito" do Rust — lição clássica do `;` que vira `()`).
 */
export interface Block {
  kind: 'Block'
  stmts: Statement[]
  tail?: Expr
  span: Span
}

export interface If {
  kind: 'If'
  cond: Expr
  then: Block
  /** `else { ... }` ou encadeamento `else if ...`. */
  otherwise?: Block | If
  span: Span
}

export interface While {
  kind: 'While'
  cond: Expr
  body: Block
  span: Span
}

export interface Loop {
  kind: 'Loop'
  body: Block
  span: Span
}

export interface For {
  kind: 'For'
  varName: string
  from: Expr
  to: Expr
  body: Block
  span: Span
}

export interface Break {
  kind: 'Break'
  span: Span
}

export interface Continue {
  kind: 'Continue'
  span: Span
}

export interface Return {
  kind: 'Return'
  value?: Expr
  span: Span
}

export interface Param {
  name: string
  type: PrimitiveType
  span: Span
}

export interface FnDecl {
  kind: 'FnDecl'
  name: string
  params: Param[]
  /** Ausente = função sem retorno de valor (void). */
  retType?: PrimitiveType
  body: Block
  span: Span
}

export type Statement =
  | LetDecl | Assign | ExprStmt
  | If | While | Loop | For
  | Break | Continue | Return | FnDecl

export interface Program {
  kind: 'Program'
  body: Statement[]
}
