import type { CheatSection, Level } from './types'

/**
 * Mundo 1 — Vila das Variáveis: chamadas de função, let, let mut.
 * Mapas verticais de 8 linhas: céu/scenery em cima, caminho na linha 5,
 * chão + vão profundo embaixo. `starterCode` é só comentários — o jogador
 * escreve TODO o código (exceção: w1-l3, código quebrado de propósito).
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
    'x = 10;         → só funciona se for let mut',
    'Tipos: i32 (inteiro), f64 (decimal), bool (true/false)',
    'Toda linha termina com ;',
  ],
}

const world1Cheat: CheatSection[] = [COMMANDS_CHEAT, VARIABLES_CHEAT]

export const WORLD1_LEVELS: Level[] = [
  {
    id: 'w1-l1',
    world: 1,
    order: 1,
    title: 'Primeiros Passos',
    narrative: 'O vigia dormiu na torrinha. Chegue à porta da vila sem acordá-lo — escreva seu primeiro comando Rust!',
    concept: {
      title: 'Chamar uma função do jogo',
      body: 'Em Rust, para usar algo você CHAMA uma função: escreve o nome, abre parênteses, passa o que ela precisa e fecha com ponto-e-vírgula. Aqui, mover_direita é uma função que faz o boneco caminhar.',
      bullets: [
        'Função = nome(argumentos);',
        'O argumento é quantas casas andar',
        'Cada linha de comando termina com ;',
      ],
    },
    learnAfter: {
      title: 'Você escreveu sua primeira chamada de função!',
      body: 'Funções em Rust usam parênteses e vírgulas, e ; fecha cada passo do programa. O número dentro dos parênteses é o argumento — ele diz à função quanto trabalho ela deve fazer.',
      bullets: [
        'mover_direita(10); = caminhar 10 casas',
        'Parênteses () recebem o argumento',
        '; termina o comando',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Escreva um comando para caminhar até a porta.
// Formato: mover_direita(quantidade);
`,
    solution: `mover_direita(10);
`,
    // 12×8: P0, G10 na linha 5; V (vigia) na torrinha à esquerda
    map: [
      '............',
      '............',
      '.V..........',
      '.##.........',
      '.##.........',
      'P.........G.',
      '############',
      '############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Andar é chamar mover_direita com o número de casas: conte do início até o portão.',
      'São 10 casas: mover_direita(10);',
    ],
    cheatSheet: world1Cheat,
  },
  {
    id: 'w1-l2',
    world: 1,
    order: 2,
    title: 'Variável de Passos',
    narrative: 'O asfalto range: meça os passos numa variável antes de caminhar. Pegue a moeda no caminho!',
    concept: {
      title: 'Variáveis com let',
      body: 'let cria uma "caixinha" com nome dentro do programa. Você guarda um valor nela e usa o nome depois — o programa lê o valor da caixinha na hora de executar.',
      bullets: [
        'let nome = valor;',
        'Depois é só usar o nome no lugar do valor',
        'let fixa o valor; para mudar depois, use let mut (próxima fase)',
      ],
    },
    learnAfter: {
      title: 'Você criou e usou uma variável',
      body: 'Variáveis guardam números (e outros valores) dentro do programa. Declarar com let e usar o nome depois é o passo mais básico de qualquer programa Rust.',
      bullets: [
        'let passos = 8; guarda o número 8',
        'mover_direita(passos) usa o valor guardado',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 1) Crie uma variável let passos com quantas casas faltam até o portão
//     2) Passe a variável ao comando: mover_direita(passos);
`,
    solution: `let passos = 8;
mover_direita(passos);
`,
    // 12×8: P0, moeda x3, G x8 na linha 5
    map: [
      '............',
      '............',
      '............',
      '.##.........',
      '............',
      'P..o....G...',
      '############',
      '############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'let passos = ?; cria a variável; depois passe passos ao comando.',
      'Conte do início até o portão: são 8 casas.',
    ],
    cheatSheet: world1Cheat,
  },
  {
    id: 'w1-l3',
    world: 1,
    order: 3,
    title: 'Mutável como o Vento',
    narrative: 'O vento empurra — o plano mudou no meio do caminho. Mas o Rust travou o código abaixo. Conserte!',
    concept: {
      title: 'let mut: valores que mudam',
      body: 'Por padrão o Rust TRAVA o valor de uma variável depois de criada: tentar mudar dá o erro E0384. Para permitir mudanças, declare com let mut. É o Rust protegendo você contra mudanças acidentais.',
      bullets: [
        'let x = 1;   → travado (imutável)',
        'let mut x = 1; → pode mudar',
        'x = 2; só passa se for mut',
      ],
    },
    learnAfter: {
      title: 'Você domou o mut',
      body: 'mut = mutável, "que muda". Sem mut o Rust trava o valor e aponta o erro E0384 — ele prefere exigir uma decisão explícita sua antes de deixar qualquer coisa mudar.',
      bullets: [
        'let mut passos = 1; declara variável mudável',
        'passos = 7; reatribui o valor',
        'E0384 = "não pode mudar o que é fixo"',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// O Rust está travando este código (erro E0384).
// Conserte para chegar ao portão.
let passos = 1;
passos = 7;
mover_direita(passos);
`,
    solution: `let mut passos = 1;
passos = 7;
mover_direita(passos);
`,
    // 12×8: P0, moeda x4, G x7; E (engenheiro) no andaime à direita
    map: [
      '............',
      '............',
      '..........E.',
      '.........##.',
      '............',
      'P...o..G....',
      '############',
      '############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Para mudar o valor depois, crie a variável com let mut.',
      'Troque "let passos" por "let mut passos".',
    ],
    cheatSheet: world1Cheat,
  },
  {
    id: 'w1-l4',
    world: 1,
    order: 4,
    title: 'O Salto Medido',
    narrative: 'A mina tem um buraco de 2 casas. Calcule a força do pulo, chegue perto da borda e salte!',
    concept: {
      title: 'pular(força) e a física do salto',
      body: 'pular(f) deixa o boneco f casas "no ar" durante os próximos passos: ele cobre vãos de até f casas e, com f ≥ 2, ainda consegue subir 1 degrau. Comece o salto NA última casa firme — longe demais o ar acaba antes do buraco.',
      bullets: [
        'pular(2); → cobre vão de até 2 casas',
        'Força ≥ largura do buraco',
        'Pule na borda, não antes',
      ],
    },
    learnAfter: {
      title: 'Você calculou um salto',
      body: 'A força do pulo é a distância que o boneco fica no ar. Combinar a medida do obstáculo com o valor da força é pensar como programador: o número certo vem da análise do problema.',
      bullets: [
        'let pulo = 2; guarda a força',
        'pular(pulo); usa a variável na chamada',
        'Buraco de 2 → força 2, pular na borda',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 1) Crie a variável pulo com a força (casas do buraco)
//     2) Ande até a última casa firme
//     3) pular(pulo);
//     4) Siga até o portão
`,
    solution: `mover_direita(3);
let pulo = 2;
pular(pulo);
mover_direita(5);
`,
    // 12×8: P0, G x8; vão x4–x5 (2 casas, profundo)
    map: [
      '............',
      '............',
      '............',
      '............',
      '............',
      'P.......G...',
      '####  ######',
      '####  ######',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Pule DE PERTO da borda: ande até a última casa firme (x3) e então pular.',
      'O buraco tem 2 casas → a força precisa ser 2.',
    ],
    cheatSheet: world1Cheat,
  },
  {
    id: 'w1-l5',
    world: 1,
    order: 5,
    title: 'Fuga do Labirinto',
    narrative: 'Vãos, um espinho e uma moeda obrigatória. Combine tudo que aprendeu para escapar da vila!',
    concept: {
      title: 'Planejar uma sequência',
      body: 'Programar é montar a sequência certa de passos: caminhar até o obstáculo, medir, pular, repetir. Cada obstáculo tem sua medida — anote o caminho como um plano antes de escrever o código.',
      bullets: [
        'Anote: onde parar, quando pular, qual força',
        'A moeda é obrigatória: colete passando por ela',
        'Espinho: salto de 2 a partir da casa anterior',
      ],
    },
    learnAfter: {
      title: 'Você planejou uma rota inteira',
      body: 'Decompor um problema grande (chegar ao portão) em passos pequenos (andar, pular, pular) é o coração de programar. Cada obstáculo virou uma linha do seu plano.',
      bullets: [
        'Sequência: andar → salto fino → salto espinho → salto fino',
        'Variáveis guardam as medidas do caminho',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Plano do caminho (obstáculos na ordem):
// 1) Caminhe até a casa antes do 1º buraco (1 casa) e pule com força 1
// 2) Ande até a casa antes do espinho e pule com força 2
// 3) Ande até a casa antes do 2º buraco e pule com força 1
// 4) Siga até o portão — a moeda no caminho é OBRIGATÓRIA
`,
    solution: `let passos = 4;
mover_direita(passos);
pular(1);
mover_direita(2);
pular(2);
mover_direita(3);
pular(1);
mover_direita(4);
`,
    // 14×8: P0, moeda x4, espinho x7, G x13; vãos x5 e x10 (profundos)
    map: [
      '..............',
      '..............',
      'V............E',
      '##..........##',
      '..............',
      'P...o..^.....G',
      '##### #### ###',
      '##### #### ###',
    ],
    success: { type: 'reach_goal_all_coins' },
    hints: [
      'Obstáculos na ordem: vão de 1 → força 1; espinho → salto de 2; vão de 1 → força 1. Pule sempre da casa anterior.',
      'Caminhe 4 até x4 (a moeda fica no caminho); depois três saltos intercalados com trechos retos até o portão.',
    ],
    cheatSheet: world1Cheat,
  },
]
