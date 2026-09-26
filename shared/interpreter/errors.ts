import type { ErrorStage, GameError, Span } from '../types'

/** Erro controlado do pipeline — carrega o GameError pronto para a UI. */
export class GameException extends Error {
  constructor(public readonly gameError: GameError) {
    super(gameError.message)
    this.name = 'GameException'
  }
}

interface FriendlySpec {
  stage: ErrorStage
  /** Mensagem técnica (dev/debug). */
  message: (ctx?: string) => string
  /** Mensagem amigável PT-BR exibida na UI. */
  friendly: (ctx?: string) => string
  hint?: (ctx?: string) => string
}

/**
 * Tabela de erros do interpretador.
 * Códigos imitam a numeração real do Rust de propósito (familiaridade futura);
 * E0001–E0004 e E0900/E0901 são códigos próprios do jogo.
 * Mantém docs/erros.md em sincronia.
 */
const ERROR_TABLE: Record<string, FriendlySpec> = {
  E0001: {
    stage: 'lex',
    message: ctx => `Token inesperado: ${ctx}`,
    friendly: () => 'A sintaxe ficou confusa aqui. Confira se falta algo como ;, ) ou =.',
  },
  E0002: {
    stage: 'parse',
    message: ctx => `Esperado: ${ctx}`,
    friendly: (ctx) => {
      if (ctx === ';') return 'Faltou um ; no fim da linha.'
      if (ctx === ')') return 'Faltou fechar o parênteses: acrescente ).'
      if (ctx === '(') return 'Depois do nome do comando vem um parênteses: (.'
      if (ctx === '=') return 'Falta o sinal = para dar um valor à variável.'
      if (ctx === 'expressão') return 'Falta um valor depois do =.'
      if (ctx === ',') return 'Separe os argumentos com vírgula (,).'
      if (ctx === 'variável') return 'Depois de let vem o nome da variável (letras, sem espaço).'
      if (ctx === '{') return 'Faltou abrir a chave { do bloco.'
      if (ctx === '}') return 'Faltou fechar a chave } do bloco.'
      if (ctx === '->') return 'Para a função retornar um valor, use: -> tipo (ex.: -> i32).'
      if (ctx === 'in') return 'Depois da variável do for vem in: for i in 0..5 { ... }'
      if (ctx === '..') return 'O laço for usa um intervalo com dois pontos: 0..5 (sem o =).'
      if (ctx === ':') return 'Faltou os dois-pontos : entre nome e tipo (ex.: x: i32).'
      if (ctx?.startsWith('i32, f64')) return 'Tipo inválido. Use i32, f64, bool ou String.'
      if (ctx === 'nome da função') return 'Depois de fn vem o nome da função.'
      if (ctx === 'parâmetro') return 'Parâmetros têm a forma nome: tipo (ex.: n: i32).'
      return `Faltou algo aqui: ${ctx}.`
    },
  },
  E0003: {
    stage: 'check',
    message: ctx => ctx || 'Expressão solta que não faz nada',
    friendly: ctx => ctx || 'Esse valor não faz nada sozinho. Guarde-o numa variável com let ou use dentro de um comando do jogo.',
  },
  E0004: {
    stage: 'check',
    message: ctx => `\`${ctx}\` fora de um laço`,
    friendly: ctx => `\`${ctx}\` só pode ser usado dentro de loop, while ou for — aqui não existe laço para sair.`,
    hint: () => 'Coloque o código dentro de um laço (loop, while ou for).',
  },
  E0412: {
    stage: 'check',
    message: ctx => `Variável não declarada: ${ctx}`,
    friendly: ctx => `A variável ${ctx} não existe. Você criou ela com let?`,
    hint: () => 'Declare antes de usar: let nome = valor;',
  },
  E0382: {
    stage: 'check',
    message: ctx => `Valor movido e usado de novo: ${ctx}`,
    friendly: ctx => `${ctx} foi movida: ao passar um texto por valor, a posse transfere e a variável original fica indisponível.`,
    hint: () => 'Passe uma referência em vez do valor: &variavel (empréstimo).',
  },
  E0384: {
    stage: 'check',
    message: ctx => `Atribuição a variável imutável: ${ctx}`,
    friendly: ctx => `Não dá pra mudar ${ctx} porque ela foi criada com let. Use let mut para permitir mudanças.`,
    hint: ctx => `Troque para: let mut ${ctx} = ...`,
  },
  E0308: {
    stage: 'check',
    message: ctx => `Tipos incompatíveis: ${ctx}`,
    friendly: ctx => ctx || 'Tipos incompatíveis: confira se os números são todos inteiros (i32) ou todos decimais (f64).',
    hint: () => 'Em Rust não há conversão automática: 2 (i32) e 2.0 (f64) são tipos diferentes.',
  },
  E0425: {
    stage: 'check',
    message: ctx => `Função desconhecida: ${ctx}`,
    friendly: ctx => `${ctx} não existe: não é um comando do jogo nem uma fn que você definiu.`,
  },
  E0428: {
    stage: 'check',
    message: ctx => `Definição duplicada: ${ctx}`,
    friendly: ctx => `${ctx} já existe. Escolha outro nome para a sua fn — não dá para definir duas vezes.`,
  },
  E0572: {
    stage: 'check',
    message: () => 'return fora de função',
    friendly: () => 'return só existe dentro de uma fn. No programa principal, os comandos já rodam na ordem escrita.',
  },
  E0061: {
    stage: 'check',
    message: ctx => `Número de argumentos errado: ${ctx}`,
    friendly: ctx => ctx || 'Número de argumentos errado.',
    hint: () => 'Confira no painel de dicas quantos argumentos o comando aceita.',
  },
  E0901: {
    stage: 'check',
    message: ctx => `Função fora do allowlist do nível: ${ctx}`,
    friendly: () => 'Esse comando não está liberado neste nível. Use os comandos do painel de dicas.',
  },
  E0201: {
    stage: 'exec',
    message: () => 'Divisão por zero',
    friendly: () => 'Divisão por zero! O programa parou aqui — nenhum número pode ser dividido por 0.',
    hint: () => 'Confira o denominador da sua conta.',
  },
  E0900: {
    stage: 'exec',
    message: ctx => `Limite excedido: ${ctx}`,
    friendly: () => 'Seu código gerou comandos demais para o nível. Revise os números — passos e força devem ficar entre 1 e 100.',
  },
}

export function makeError(code: string, span: Span, ctx?: string): GameError {
  const spec = ERROR_TABLE[code] ?? ERROR_TABLE.E0001!
  return {
    code,
    stage: spec.stage,
    message: spec.message(ctx),
    friendly: spec.friendly(ctx),
    line: span.line,
    col: span.col,
    hint: spec.hint?.(ctx),
  }
}

export function fail(code: string, span: Span, ctx?: string): never {
  throw new GameException(makeError(code, span, ctx))
}
