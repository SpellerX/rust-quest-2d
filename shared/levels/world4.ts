import type { CheatSection, Level } from './types'

/**
 * Mundo 4 — Caverna da Repetição: loop, while, for, break/continue
 * (Cap. 3 do livro; o livro prefere for). Mesmo formato de mapa dos
 * Mundos 1-2 (vertical, 8+ linhas, caminho na linha 5). Starter só
 * comentários — o jogador escreve todo o código.
 * Para alterar equilíbrio, edite aqui e commite — tests/world4.test.ts
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
    'x = x + 1;      → atualiza (só funciona com let mut)',
  ],
}

const LOOPS_CHEAT: CheatSection = {
  title: 'Laços (repetição)',
  lines: [
    'loop { }            → repete para SEMPRE (precisa de break!)',
    'while cond { }      → repete ENQUANTO a condição for true',
    'for i in 0..5 { }   → repete 5 vezes (i vale 0,1,2,3,4)',
    'break;              → sai do laço na hora',
    'continue;           → pula direto para a próxima volta',
    'O intervalo 0..5 NÃO inclui o 5',
  ],
}

const world4Cheat: CheatSection[] = [COMMANDS_CHEAT, VARIABLES_CHEAT, LOOPS_CHEAT]

/** Rótulos curtos (≤ 25 chars) dos conceitos de cada nível. */
export const WORLD4_CONCEPTS: Record<string, string> = {
  'w4-l1': 'loop, contagem e break',
  'w4-l2': 'while contador',
  'w4-l3': 'for i in 0..n',
  'w4-l4': 'break no meio do laço',
  'w4-l5': 'for + conta no laço',
}

export const WORLD4_LEVELS: Level[] = [
  {
    id: 'w4-l1',
    world: 4,
    order: 1,
    title: 'O Relógio da Caverna',
    narrative: 'Um laço loop repete para sempre — só o break detém o tempo. Conte os passos e pare exatamente na porta!',
    concept: {
      title: 'loop, contagem e break',
      body: 'loop { } repete o bloco sem parar. Para não rodar para sempre, use uma variável mutável como contador: some 1 a cada volta e pare com break quando chegar à meta. É o coração de qualquer repetição.',
      bullets: [
        'let mut n = 0; → contador que pode mudar',
        'loop { ... n = n + 1; ... } repete as voltas',
        'if n == 10 { break; } → sai do laço',
      ],
    },
    learnAfter: {
      title: 'Você domou o loop com um contador',
      body: 'Contadores controlam laços: declare com let mut, incremente a cada volta e use if + break para encerrar na hora certa. Sem break, o loop nunca termina — e o programa estoura o limite de passos.',
      bullets: [
        'mut permite fazer n = n + 1',
        'break interrompe o loop imediatamente',
        'A ordem importa: conte DEPOIS de andar',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Atravesse as 10 casas até o G usando um laço:
// 1) let mut passos = 0;
// 2) loop { ande 1 casa; passos = passos + 1; if passos >= 10 { break; } }
// O break é OBRIGATÓRIO: sem ele, o loop nunca termina.
`,
    solution: `let mut passos = 0;
loop {
    mover_direita(1);
    passos = passos + 1;
    if passos >= 10 {
        break;
    }
}
`,
    // 12×8: P0, moeda x5, G x10 na linha 5; E (engenheiro) na plataforma à direita
    map: [
      '............',
      '............',
      '..........E.',
      '..........##',
      '............',
      'P....o....G.',
      '############',
      '############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Dentro do loop: ande 1 casa e some 1 ao contador; quando passos chegar a 10, break; encerra o laço.',
      'let mut passos = 0; loop { mover_direita(1); passos = passos + 1; if passos >= 10 { break; } }',
    ],
    cheatSheet: world4Cheat,
  },
  {
    id: 'w4-l2',
    world: 4,
    order: 2,
    title: 'A Correnteza',
    narrative: 'A correnteza só empurra enquanto o contador for menor que 8. Use while para remar até a margem — moeda no caminho!',
    concept: {
      title: 'while: repita enquanto for true',
      body: 'while testa a condição ANTES de cada volta: enquanto ela for true, o bloco roda; quando vira false, o laço termina sozinho. É perfeito para "repetir até dar N passos" — o contador encerra o laço.',
      bullets: [
        'while cond { } → só repete se for true',
        'Atualize o contador DENTRO do bloco',
        'Sem atualizar, a condição nunca muda',
      ],
    },
    learnAfter: {
      title: 'Você repetiu com while',
      body: 'while combina uma condição e uma repetição: o programa fica rodando enquanto a condição valer. Cuidado com o contador — se ele nunca mudar, a condição continua true e o laço não acaba.',
      bullets: [
        'cont < 8 é true enquanto faltam passos',
        'cont = cont + 1 avança o contador',
        'Quando cont vira 8, o while para sozinho',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Dê exatamente 8 passos até o G com um laço while:
// 1) let mut cont = 0;
// 2) while cont < 8 { mover_direita(1); cont = cont + 1; }
// A condição do while precisa ser true/false — use a comparação cont < 8.
`,
    solution: `let mut cont = 0;
while cont < 8 {
    mover_direita(1);
    cont = cont + 1;
}
`,
    // 12×8: P0, moeda x4, G x8 na linha 5; V (vigia) na plataforma à esquerda
    map: [
      '............',
      '............',
      '.V..........',
      '.##.........',
      '............',
      'P...o...G...',
      '############',
      '############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'O while repete enquanto cont < 8 for true: dentro dele, ande 1 casa e some 1 ao contador.',
      'São 8 casas até o G: while cont < 8 { mover_direita(1); cont = cont + 1; }',
    ],
    cheatSheet: world4Cheat,
  },
  {
    id: 'w4-l3',
    world: 4,
    order: 3,
    title: 'O Trio de Vãos',
    narrative: 'Três buracos idênticos esperam na trilha. Em vez de copiar o mesmo código três vezes, deixe o for repetir o salto!',
    concept: {
      title: 'for i in 0..n: repetição com contador',
      body: 'for i in 0..n repete o bloco n vezes com i valendo 0, 1, 2... n-1 (o fim NÃO entra). O livro de Rust prefere for para repetições com número definido de voltas — ele cuida do contador para você.',
      bullets: [
        'for i in 0..3 { } → 3 voltas (i = 0,1,2)',
        'O fim do intervalo (3) nunca é alcançado',
        'Cada volta repete exatamente o mesmo bloco',
      ],
    },
    learnAfter: {
      title: 'Você repetiu com for',
      body: 'for percorre um intervalo 0..n e executa o corpo uma vez para cada valor. É a forma preferida do Rust para repetição com contagem conhecida — menos erros que um contador manual.',
      bullets: [
        '0..3 gera 0, 1 e 2 (três voltas)',
        'O mesmo bloco roda em cada volta',
        'Um for substitui três trechos copiados',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Três vãos de 1 casa, espaçados igualmente. Repita com for:
// 1) Ande 3 casas até a borda do 1º vão (x3)
// 2) Monte o esqueleto: for i in 0..3 { ... }
// 3) Dentro do laço: pular(1) na borda + mover_direita(4) até a próxima borda
// O i não precisa ser usado — o laço já conta as voltas.
`,
    solution: `mover_direita(3);
for i in 0..3 {
    pular(1);
    mover_direita(4);
}
`,
    // 16×8: P0, moedas x6 e x10, G x14 na linha 5; vãos x4, x8, x12 (profundos)
    map: [
      '................',
      '................',
      '..............V.',
      '..............#.',
      '................',
      'P.....o...o...G.',
      '#### ### ### ###',
      '#### ### ### ###',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Primeiro ande 3 casas até a borda (x3). Depois o mesmo bloco 3 vezes: pular(1) na borda e mover_direita(4) até a próxima borda.',
      'mover_direita(3); for i in 0..3 { pular(1); mover_direita(4); } — o último movimento termina no G.',
    ],
    cheatSheet: world4Cheat,
  },
  {
    id: 'w4-l4',
    world: 4,
    order: 4,
    title: 'Pare Antes do Espinho',
    narrative: 'O loop da caverna não para sozinho: ele caminharia direto para o espinho. Conte até 4, dê break NA BORDA e então salte!',
    concept: {
      title: 'break: saia do laço na hora certa',
      body: 'Um loop infinito só termina com break. Aqui a parada é POSICIONAL: pare quando o contador mostrar que você está na última casa firme antes do espinho. O break corta o laço e o programa segue adiante.',
      bullets: [
        'break; → sai do loop imediatamente',
        'O if decide EM QUAL VOLTA dar break',
        'Sem break, o laço seguiria até o espinho',
      ],
    },
    learnAfter: {
      title: 'Você controlou um loop com break',
      body: 'break é a alavanca do laço: ele interrompe a repetição e o fluxo continua depois do bloco. Combinado com contador e if, transforma um loop infinito em exatamente N voltas — no ponto exato que você escolheu.',
      bullets: [
        'if passo >= 4 { break; } para na casa certa',
        'Depois do break, o resto do programa roda',
        'O espinho ensina POR QUE parar importa',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Ande até a última casa firme ANTES do espinho (^) e pare o laço:
// 1) let mut passo = 0;
// 2) loop { mover_direita(1); passo = passo + 1; if passo >= 4 { break; } }
// 3) Depois do laço: pular(2); passa por cima do espinho
// 4) Continue até o G
// Sem o break, o loop caminharia em cima do espinho.
`,
    solution: `let mut passo = 0;
loop {
    mover_direita(1);
    passo = passo + 1;
    if passo >= 4 {
        break;
    }
}
pular(2);
mover_direita(8);
`,
    // 14×8: P0, espinho x5, G x12 na linha 5; V (vigia) na plataforma ao centro
    map: [
      '..............',
      '..............',
      '........V.....',
      '........##....',
      '..............',
      'P....^......G.',
      '##############',
      '##############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'O espinho está em x5: a última casa firme é x4, então o laço precisa dar 4 passos e dar break.',
      'Depois do break: pular(2); voa sobre o espinho; então mover_direita(8); leva até o G.',
    ],
    cheatSheet: world4Cheat,
  },
  {
    id: 'w4-l5',
    world: 4,
    order: 5,
    title: 'A Prova Final da Caverna',
    narrative: 'Espinho, vão estreito e vão largo em sequência — e moedas flutuando sobre os abismos! Use for + uma conta dentro do laço e reúna TODAS as moedas.',
    concept: {
      title: 'Laço + conta + variável juntos',
      body: 'Nesta prova o for executa o trecho que se repete, a conta dentro do laço calcula a força de cada volta e pular usa esse valor. Repetição, cálculo e ação trabalhando juntos, como em um programa de verdade.',
      bullets: [
        'for i in 0..3 → três voltas numeradas',
        'let forca = 2 + i / 2; → calcula a força da volta',
        'pular(forca); → usa o valor calculado',
      ],
    },
    learnAfter: {
      title: 'Você venceu a caverna com um programa completo!',
      body: 'Laços repetem e contas preparam os dados dentro da própria repetição — cada volta gera um valor diferente que vira a ação certa, sem copiar e colar três trechos parecidos.',
      bullets: [
        'i / 2 dá 0, 0 e 1 (divisão inteira)',
        'Então as forças são 2, 2 e 3 — uma pra cada obstáculo',
        'Moedas sobre o vão: só voando na altura certa',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Plano final — 3 obstáculos com o MESMO esqueleto dentro do for:
// 1) mover_direita(3); → até a borda do espinho (x3)
// 2) for i in 0..3 { ... }
// 3) Dentro: let forca = 2 + i / 2;  → as forças ficam 2, 2 e 3
//    (i / 2 vale 0, 0 e 1 — divisão inteira trunca a fração)
//    Depois: pular(forca); e mover_direita(5); até a próxima borda
// 4) Depois do laço: mover_direita(2); até o G
// As moedas sobre os abismos: só quem voa com a força exata as coleta!
`,
    solution: `mover_direita(3);
for i in 0..3 {
    let forca = 2 + i / 2;
    pular(forca);
    mover_direita(5);
}
mover_direita(2);
`,
    // 22×8: P0, espinho x4, moedas x7/x10/x16, G x20; vãos x9–x10 e x14–x16
    map: [
      '......................',
      '......................',
      '.V....................',
      '.##...................',
      '......................',
      'P...^..o..o.....o...G.',
      '#########  ###   #####',
      '#########  ###   #####',
    ],
    success: { type: 'reach_goal_all_coins' },
    hints: [
      'Meça as forças: espinho e vão estreito pedem 2, o vão largo pede 3. A conta 2 + i / 2 gera exatamente 2, 2 e 3.',
      'Esqueleto: mover_direita(3); for i in 0..3 { let forca = 2 + i / 2; pular(forca); mover_direita(5); } e no fim mover_direita(2);.',
    ],
    cheatSheet: world4Cheat,
  },
]
