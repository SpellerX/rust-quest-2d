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

export type BinaryOp = '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '>' | '<=' | '>='

export interface Binary {
  kind: 'Binary'
  op: BinaryOp
  left: Expr
  right: Expr
  span: Span
}

export interface Unary {
  kind: 'Unary'
  op: '-'
  operand: Expr
  span: Span
}

export interface Literal {
  kind: 'Literal'
  value: number | boolean
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

export type Statement = LetDecl | Assign | ExprStmt

export interface Program {
  kind: 'Program'
  body: Statement[]
}
