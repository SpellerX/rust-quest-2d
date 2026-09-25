import type { CheatSection, Level } from './types'

/**
 * Mundo 2 — Penhasco dos Operadores: expressões aritméticas nos argumentos.
 * Mesmo formato de mapa do Mundo 1 (vertical, 8+ linhas). Starter só
 * comentários — o jogador escreve todo o código.
 * Para alterar equilíbrio, edite aqui e commite — tests/levels.test.ts
 * garante que a solução continua vencendo o mapa.
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

const VARIABLES_CHEAT: CheatSection = {
  title: 'Variáveis',
  lines: [
    'let x = 5;      → cria uma caixinha com valor fixo',
    'let mut x = 5;  → cria uma caixinha que pode mudar',
    'Toda linha termina com ;',
  ],
}

const OPERATORS_CHEAT: CheatSection = {
  title: 'Operadores',
  lines: [
    '+  soma        2 + 1 vale 3',
    '-  subtrai     6 - 4 vale 2',
    '*  multiplica  2 * 3 vale 6',
    '/  divide      8 / 2 vale 4 (inteiro / inteiro = inteiro)',
    '%  resto       7 % 2 vale 1',
    'Conta primeiro * e /, depois + e - (use parênteses pra agrupar)',
    'Números com ponto são decimais: 2.5 é f64',
  ],
}

const world2Cheat: CheatSection[] = [COMMANDS_CHEAT, VARIABLES_CHEAT, OPERATORS_CHEAT]

export const WORLD2_LEVELS: Level[] = [
  {
    id: 'w2-l1',
    world: 2,
    order: 1,
    title: 'Força Dobrada',
    narrative: 'O engenheiro do portal calcula a energia do salto com uma conta. Monte a expressão e atravesse o abismo!',
    concept: {
      title: 'Expressões: contas dentro do código',
      body: 'Em Rust você pode escrever uma conta direto no código: 2 + 1 é uma expressão que o computador calcula antes de usar o resultado. Guarde o resultado numa variável e passe-a ao salto.',
      bullets: [
        'let forca = 2 + 1; → calcula 3 e guarda',
        'A expressão é avaliada ANTES de virar força',
        'Soma de inteiros devolve inteiro (i32)',
      ],
    },
    learnAfter: {
      title: 'Você usou uma expressão aritmética',
      body: 'Expressões combinam valores com operadores (+ - * /) e o resultado é um novo valor. O mesmo vale dentro de uma variável ou direto no argumento da função.',
      bullets: [
        '2 + 1 vale 3',
        'O valor pronto é o que o pular recebeu',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Você precisa de força 3 para cobrir o abismo.
// Monte a conta com o operador + e salte da última casa firme.
`,
    solution: `mover_direita(3);
let forca = 2 + 1;
pular(forca);
mover_direita(6);
`,
    // 12×8: P0, G x9; vão x4–x6 (3 casas, profundo)
    map: [
      '............',
      '............',
      '.E..........',
      '.##.........',
      '............',
      'P........G..',
      '####   #####',
      '####   #####',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'A conta 2 + 1 é calculada antes de virar força: guarde o resultado em let forca.',
      'O vão tem 3 casas → força 3; pule da última casa firme (x3).',
    ],
    cheatSheet: world2Cheat,
  },
  {
    id: 'w2-l2',
    world: 2,
    order: 2,
    title: 'Divisão e Conquista',
    narrative: 'Metade do caminho é o dobro da pressa: use a divisão para descobrir os passos certos.',
    concept: {
      title: 'Divisão inteira',
      body: 'O operador / divide. Quando os dois lados são inteiros (i32), o resultado É inteiro — as casas decimais são descartadas: 7 / 2 vale 3. O Rust não arredonda sozinho.',
      bullets: [
        'let passos = 12 / 2; → guarda 6',
        'Inteiro / inteiro = inteiro',
        '7 / 2 = 3 (sem decimal)',
      ],
    },
    learnAfter: {
      title: 'Você calculou com divisão',
      body: 'Divisão de inteiros descarta a parte fracionária — é uma regra do tipo i32. Para ter decimais, use números f64 como 2.0.',
      bullets: [
        '12 / 2 = 6',
        'O resultado da conta pode ir direto para a variável',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 O G está 6 casas adiante.
// Escreva uma divisão usando o número 12 que resulte em 6.
`,
    solution: `let passos = 12 / 2;
mover_direita(passos);
`,
    // 13×8: P0, moeda x3, G x6
    map: [
      '.............',
      '.............',
      '.......V.....',
      '......###....',
      '.............',
      'P..o..G......',
      '#############',
      '#############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Divisão / entre inteiros devolve inteiro: 12 / 2 vale 6.',
      'O G está na casa 6 — a divisão precisa dar 6.',
    ],
    cheatSheet: world2Cheat,
  },
  {
    id: 'w2-l3',
    world: 2,
    order: 3,
    title: 'Energia em Dobro',
    narrative: 'As pilhas do robô são recarregadas em série: some o dobro para cruzar o vão largo.',
    concept: {
      title: 'Multiplicação e precedência',
      body: 'O operador * multiplica. Em uma conta mista, * e / vêm ANTES de + e -: 2 * 2 + 1 = 5. Use parênteses quando quiser agrupar de outro jeito.',
      bullets: [
        'let pulo = 2 * 2; → guarda 4',
        '* e / têm prioridade sobre + e -',
        'Parênteses mudam a ordem',
      ],
    },
    learnAfter: {
      title: 'Você usou multiplicação (e precedência)',
      body: 'A ordem das operações faz parte da linguagem: multiplicar antes de somar é regra, não detalhe. O valor final é o que o seu programa usou como força.',
      bullets: [
        '2 * 2 = 4 → força 4 para vão de 4 casas',
        'Prioridade: * / antes de + -',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 O vão tem 4 casas: a força precisa ser 4.
// Monte a força com multiplicação e salte da última casa firme (x2).
`,
    solution: `let pulo = 2 * 2;
mover_direita(2);
pular(pulo);
mover_direita(10);
`,
    // 13×8: P0, G x10; vão x3–x6 (4 casas, profundo)
    map: [
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      'P.........G..',
      '###    ######',
      '###    ######',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'O vão tem 4 casas → a força precisa ser 4; monte-a com *.',
      '2 * 2 dá 4 — e pule em x2, a última casa firme antes do vão.',
    ],
    cheatSheet: world2Cheat,
  },
  {
    id: 'w2-l4',
    world: 2,
    order: 4,
    title: 'Correção de Rota',
    narrative: 'Passou do ponto? A porta e a moeda estão no meio do caminho: avance, colete e volte com uma subtração.',
    concept: {
      title: 'Subtração e plano com duas fases',
      body: 'A subtração - devolve a diferença entre dois valores. Aqui o programa tem duas fases: ir até a moeda (ida) e voltar até a porta (volta) — cada fase com sua conta.',
      bullets: [
        'let volta = avanco - 4; → usa o valor de antes',
        'Variáveis podem ser usadas em outras contas',
        'Sem a moeda, chegar ao G não vale',
      ],
    },
    learnAfter: {
      title: 'Você calculou ida e volta',
      body: 'Reaproveitar uma variável (avanco) dentro de outra conta (volta = avanco - 4) é programação de verdade: valores circulam pelo programa.',
      bullets: [
        '4 * 3 = 12 (ida até a moeda)',
        '12 - 4 = 8 (volta até o G)',
        'mover_esquerda inverte o caminho',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 1) Vá até a moeda: a distância é 4 * 3 casas
//     2) Volte até o G usando uma subtração a partir do avanço
`,
    solution: `let avanco = 4 * 3;
mover_direita(avanco);
let volta = avanco - 4;
mover_esquerda(volta);
`,
    // 13×8: P0, G x4, moeda x10
    map: [
      '.............',
      '.............',
      '..V..........',
      '..##.........',
      '.............',
      'P...G......o.',
      '#############',
      '#############',
    ],
    success: { type: 'reach_goal_all_coins' },
    hints: [
      'Sem a moeda o G não vale — colete passando por ela antes de voltar.',
      'volta = avanco - 4 → 8 casas para a esquerda até o G.',
    ],
    cheatSheet: world2Cheat,
  },
  {
    id: 'w2-l5',
    world: 2,
    order: 5,
    title: 'O Grande Salto',
    narrative: 'A prova final dos Engenheiros de Código: um vão largo e uma torre para escalar, expressando tudo com contas.',
    concept: {
      title: 'Tudo junto: variáveis, contas e salto',
      body: 'Nesta torre você combina o Mundo 1 e o Mundo 2: variáveis guardam as medidas, expressões calculam as forças e cada salto resolve um trecho — buraco embaixo, depois subir dois degraus até o G.',
      bullets: [
        'forca = 1 + 1 → força 2 (vão e subidas)',
        'passos = 2 * 2 → 4 casas por trecho',
        'Subir 1 degrau pede força ≥ 2',
      ],
    },
    learnAfter: {
      title: 'Você construiu um programa completo!',
      body: 'Variáveis, expressões e chamadas de função trabalhando juntas — exatamente assim que programas reais são escritos: dados guardados, contas calculadas e ações chamadas na ordem certa.',
      bullets: [
        'Reaproveitou forca e passos em vários saltos',
        '3 saltos: vão → subir → subir',
        'Programa escrito do zero, do começo ao fim',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Plano da torre (3 saltos):
// 1) Ande até a borda do vão (x5) e cruze com força 2
// 2) Suba o 1º degrau (força 2) e ande 4 casas no patamar
// 3) Suba o 2º degrau (força 2) e avance até o G
// Monte as forças com contas ( + e * ), não com números soltos.
`,
    solution: `let forca = 1 + 1;
let passos = 2 * 2;
mover_direita(5);
pular(forca);
mover_direita(passos);
pular(forca);
mover_direita(passos);
pular(forca);
mover_direita(1);
`,
    // 16×14: torre — G embutido na coluna (linha 9), patamar (linha 10),
    // início no fim (linha 11), vão x6–x7 (profundo), degraus x10–x13
    map: [
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
      '..............##',
      '..............##',
      '..............##',
      '..............G#',
      '..............##',
      'P.........####..',
      '######  ########',
      '######  ########',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Toda subida de 1 degrau pede força 2 — e ela começa na casa anterior ao bloco.',
      '3 saltos na sequência: vão (comece em x5), subir 1 degrau (em x9), subir para o G (em x13).',
    ],
    cheatSheet: world2Cheat,
  },
]
