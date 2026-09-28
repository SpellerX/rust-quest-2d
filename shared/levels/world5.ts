import type { CheatSection, Level } from './types'

/**
 * Mundo 5 — Oficina das Funções: `fn` (Livro Cap. 3 + Statements and
 * Expressions + Cap. 12 decomposição). Mesmo formato de mapa dos Mundos 1–2
 * (vertical, 8+ linhas). Starter só comentários — o jogador escreve todo o
 * código. Para alterar equilíbrio, edite aqui e commite —
 * tests/world5.test.ts garante que a solução continua vencendo o mapa.
 */

const COMMANDS_CHEAT: CheatSection = {
  title: 'Comandos do jogo',
  lines: [
    'mover_direita(n);  → anda n casas pra direita',
    'mover_esquerda(n); → anda n casas pra esquerda',
    'pular(n);          → salta: cobre n casas de vão e sobe 1 degrau com n ≥ 2',
    'esperar(s);        → espera s segundos',
  ],
}

const FUNCTIONS_CHEAT: CheatSection = {
  title: 'Funções (fn)',
  lines: [
    'fn ir() { mover_direita(3); }        → cria a fn (corpo entre { })',
    'ir();                                → chama: executa o corpo inteiro',
    'fn caminhar(n: i32) { ... }          → parâmetro tipado: n: i32',
    'caminhar(4);                         → chama passando o argumento 4',
    'fn dobro(x: i32) -> i32 { x * 2 }    → devolve um inteiro',
    'Última expressão SEM ; = return implícito (o ; mata o retorno)',
    'fn sem -> não retorna valor (não dá pra guardar em let)',
  ],
}

const world5Cheat: CheatSection[] = [COMMANDS_CHEAT, FUNCTIONS_CHEAT]

export const WORLD5_LEVELS: Level[] = [
  {
    id: 'w5-l1',
    world: 5,
    order: 1,
    title: 'A Chave da Oficina',
    narrative: 'O mestre da oficina só anda por rotina: crie uma fn e chame-a três vezes para atravessar a sala.',
    concept: {
      title: 'fn: crie sua própria função',
      body: 'Em Rust você cria funções com fn. Uma fn sem retorno e sem parâmetro é uma "receita" de comandos: você escreve o corpo uma vez e executa quantas vezes quiser chamando o nome com parênteses e ponto-e-vírgula.',
      bullets: [
        'fn ir() { comandos; } → define a função',
        'ir(); → executa o corpo inteiro de novo',
        'Chamar várias vezes = repetir o plano sem repetir o código',
      ],
    },
    learnAfter: {
      title: 'Você criou e chamou uma fn',
      body: 'fn guarda um bloco de comandos dentro de um nome. Cada chamada ir(); roda o corpo do começo ao fim — escrever uma vez e repetir é a primeira grande economia de código que existe.',
      bullets: [
        'Definição é uma vez; chamadas, quantas precisar',
        'Toda chamada termina com ;',
        'O corpo roda inteiro a cada chamada',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 1) Crie a função: fn ir() { mover_direita(3); }
//     2) Chame ir(); três vezes para somar as 9 casas até o portão.
`,
    solution: `fn ir() {
  mover_direita(3);
}
ir();
ir();
ir();
`,
    // 12×8: P0, G x9; mestre V e aprendiz E em plataformas
    map: [
      '............',
      '............',
      '.V.........E',
      '.##.......##',
      '............',
      'P........G..',
      '############',
      '############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Uma fn sem parâmetro é chamada só com o nome: ir(); — e cada chamada vale por mover_direita(3);',
      'São 9 casas até o portão: se cada chamada anda 3, chame ir(); três vezes.',
    ],
    cheatSheet: world5Cheat,
  },
  {
    id: 'w5-l2',
    world: 5,
    order: 2,
    title: 'Parâmetro de Passos',
    narrative: 'As engrenagens exigem passo configurável: ensine a função a receber quantas casas andar.',
    concept: {
      title: 'fn com parâmetro',
      body: 'Um parâmetro é uma caixinha que a função recebe de quem chama. Em fn caminhar(n: i32), o nome n vale o número passado em caminhar(4) — o mesmo corpo serve para qualquer distância.',
      bullets: [
        'fn caminhar(n: i32) { mover_direita(n); } define o modelo',
        'caminhar(4); → nesta chamada n vale 4',
        'i32 diz que o parâmetro só aceita inteiro',
      ],
    },
    learnAfter: {
      title: 'Você parametrizou uma função',
      body: 'Com parâmetro a função vira um modelo: o corpo fica igual e cada chamada injeta seu próprio valor. É assim que código reutilizável nasce — uma definição, distâncias infinitas.',
      bullets: [
        'nome: tipo na definição, valor na chamada',
        'Uma fn, muitas distâncias',
        'O corpo usa o nome, não o número fixo',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 1) Escreva a função: fn caminhar(n: i32) { mover_direita(n); }
//     2) Chame caminhar(4); três vezes — são 12 casas até o portão.
`,
    solution: `fn caminhar(n: i32) {
  mover_direita(n);
}
caminhar(4);
caminhar(4);
caminhar(4);
`,
    // 13×8: P0, moeda x4, G x12
    map: [
      '.............',
      '.............',
      '.V...........',
      '.##..........',
      '.............',
      'P...o.......G',
      '#############',
      '#############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'O parâmetro fica entre parênteses com tipo: n: i32 — e dentro do corpo use o nome n.',
      'caminhar(4); anda 4 casas; o portão está 12 casas à direita → três chamadas.',
    ],
    cheatSheet: world5Cheat,
  },
  {
    id: 'w5-l3',
    world: 5,
    order: 3,
    title: 'Andar e Saltar Juntos',
    narrative: 'A oficina tem dois pedais: um anda, outro salta. Pareie os dois num só botão e cruze os vãos.',
    concept: {
      title: 'fn com dois parâmetros',
      body: 'fn trecho(n: i32, f: i32) recebe dois valores separados por vírgula: um para andar e outro para a força do salto. Na chamada trecho(2, 2) o primeiro argumento vira n e o segundo vira f — a ordem importa.',
      bullets: [
        'Dois parâmetros: nome: tipo, nome: tipo',
        'trecho(2, 2); → n = 2 e f = 2',
        'O corpo executa mover_direita e pular juntos',
      ],
    },
    learnAfter: {
      title: 'Você combinou andar e saltar numa fn',
      body: 'Funções podem orquestrar vários comandos recebendo vários parâmetros: cada chamada configura o trecho inteiro. O corpo escreve-se uma vez; só os números mudam de uma chamada para a outra.',
      bullets: [
        'Vírgula separa os parâmetros',
        'Argumentos entram na mesma ordem dos parâmetros',
        'Uma chamada = um trecho completo do mapa',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 1) fn trecho(n: i32, f: i32) { mover_direita(n); pular(f); }
//     2) O pular(f) arma o salto ANTES do movimento que cruza o vão.
//     3) Três chamadas: (2, 2) → (5, 2) → (5, 2)
`,
    solution: `fn trecho(n: i32, f: i32) {
  mover_direita(n);
  pular(f);
}
trecho(2, 2);
trecho(5, 2);
trecho(5, 2);
`,
    // 13×8: P0, G x12; vãos x3–x4 e x8–x9 (profundos)
    map: [
      '.............',
      '.............',
      '.V.........E.',
      '.##........##',
      '.............',
      'P...........G',
      '###  ###  ###',
      '###  ###  ###',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'trecho(n, f) anda n casas e depois arma pular(f) — use-o para ir de borda a borda.',
      'São 3 trechos: até a 1ª borda (2 casas), cruzar o 1º vão e parar na 2ª borda (5), cruzar o 2º vão até o portão (5).',
    ],
    cheatSheet: world5Cheat,
  },
  {
    id: 'w5-l4',
    world: 5,
    order: 4,
    title: 'A Função que Devolve',
    narrative: 'A máquina de força precisa do DOBRO da carga: faça a fn calcular o número e devolvê-lo a quem chamou.',
    concept: {
      title: 'fn com retorno: -> i32',
      body: 'Quando a última expressão do corpo fica SEM ponto-e-vírgula, ela vira o valor de retorno. Em fn dobro(x: i32) -> i32 { x * 2 } a conta x * 2 é devolvida a quem chamou — e o resultado pode ser usado direto dentro de outro argumento.',
      bullets: [
        '-> i32 diz: esta fn devolve um inteiro',
        'Última expressão SEM ; = return implícito',
        'mover_direita(dobro(3)); → passa o resultado adiante',
      ],
    },
    learnAfter: {
      title: 'Você captou o retorno (e o truque do ;)',
      body: 'A última expressão sem ; É o retorno do Rust — se você puser ; ela vira statement, a fn não devolve nada e o compilador reclama. Com o valor em mãos, dá para guardá-lo numa variável ou soltá-lo dentro de outra chamada.',
      bullets: [
        '{ x * 2 } → devolve o dobro',
        '{ x * 2; } → armadilha: não retorna (erro E0308)',
        'dobro(3) pode morar dentro de mover_direita(...)',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 1) fn dobro(x: i32) -> i32 { ... } → devolva x * 2 SEM ; no fim
//     2) mover_direita(dobro(3)); → 6 casas até a borda do vão
//     3) pular(2); e cruze com mover_direita(dobro(2));
//     4) Mais 2 casas até o portão
`,
    solution: `fn dobro(x: i32) -> i32 {
  x * 2
}
mover_direita(dobro(3));
pular(2);
mover_direita(dobro(2));
mover_direita(2);
`,
    // 13×8: P0, G x12; vão x7–x8 (2 casas, profundo)
    map: [
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      'P...........G',
      '#######  ####',
      '#######  ####',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'fn dobro(x: i32) -> i32 { x * 2 } — a última expressão fica SEM ; e é o valor que volta.',
      'dobro(3) vale 6 (até a borda) e dobro(2) vale 4 (o cruzamento depois de pular(2)).',
    ],
    cheatSheet: world5Cheat,
  },
  {
    id: 'w5-l5',
    world: 5,
    order: 5,
    title: 'A Engrenagem Mestra',
    narrative: 'A porta final só abre com peças encaixadas: uma fn que chama outra e leva o valor que ela devolveu.',
    concept: {
      title: 'Composição: fn chamando fn',
      body: 'Programas grandes são montados de funções pequenas: uma pode chamar outra e usar o valor que ela devolve. Aqui avanco chama andar, que consome o dobro devolvido por dobro — três peças que juntas atravessam a oficina.',
      bullets: [
        'fn avanco(n: i32) { andar(dobro(n)); }',
        'O valor de dobro(n) flui direto para andar',
        'Cada fn faz uma coisa; juntas, o caminho todo',
      ],
    },
    learnAfter: {
      title: 'Você compôs funções',
      body: 'Compor é construir com peças: cada fn resolve uma parte e se encaixa nas outras pelos valores que troca. É exatamente assim que projetos reais de Rust se organizam — funções pequenas, claras e reutilizáveis.',
      bullets: [
        'dobro devolve → andar consome → avanco coordena',
        'Peças pequenas viram programas grandes',
        'Saltos e espinho seguem no plano entre as chamadas',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Monte a engrenagem com 3 fns:
// 1) fn dobro(x: i32) -> i32 { ... }  → devolve o dobro (SEM ;)
// 2) fn andar(n: i32) { ... }         → anda n casas
// 3) fn avanco(n: i32) { ... }        → chama andar(dobro(n));
// Depois: avanco(2); três vezes, com pular(2); antes dos dois obstáculos.
`,
    solution: `fn dobro(x: i32) -> i32 {
  x * 2
}
fn andar(n: i32) {
  mover_direita(n);
}
fn avanco(n: i32) {
  andar(dobro(n));
}
avanco(2);
pular(2);
avanco(2);
pular(2);
avanco(2);
`,
    // 13×8: P0, espinho x9, G x12; vão x5–x6 (profundo)
    map: [
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      'P........^..G',
      '#####  ######',
      '#####  ######',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Três peças: dobro devolve o valor, andar vira movimento e avanco chama as duas com andar(dobro(n));',
      'avanco(2) anda 4 casas; repita com pular(2); antes do vão e antes do espinho (pule da casa anterior).',
    ],
    cheatSheet: world5Cheat,
  },
]

/** Rótulos curtos por nível — cards de progresso / mapas de conceito. */
export const WORLD5_CONCEPTS: Record<string, string> = {
  'w5-l1': 'fn sem parâmetros',
  'w5-l2': 'fn com parâmetro',
  'w5-l3': 'fn com 2 parâmetros',
  'w5-l4': 'retorno -> i32',
  'w5-l5': 'composição de fns',
}
