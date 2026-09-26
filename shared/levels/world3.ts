import type { CheatSection, Level } from './types'

/**
 * Mundo 3 — Floresta das Decisões: booleans, comparações, if/else,
 * else if, && || ! (Cap. 3 do livro). Mesmo formato de mapa dos Mundos 1-2
 * (vertical, 8+ linhas, caminho na linha 5). Starter só comentários —
 * o jogador escreve todo o código.
 * Para alterar equilíbrio, edite aqui e commite — tests/world3.test.ts
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

const IF_CHEAT: CheatSection = {
  title: 'Decisões if / else',
  lines: [
    'if cond { }              → executa SÓ se a condição for true',
    'if cond { } else { }     → senão, executa o else',
    'if ... else if ... else  → encadeia vários caminhos',
    'A condição precisa ser true/false (bool)',
    'Blocos usam { } e cada linha termina com ;',
  ],
}

const LOGIC_CHEAT: CheatSection = {
  title: 'Comparações e lógica',
  lines: [
    '== igual          != diferente',
    '< menor           > maior',
    '<= menor ou igual >= maior ou igual',
    '&& E lógico (as DUAS precisam ser true)',
    '|| OU lógico (basta UM ser true)',
    '! inverte: !true vira false',
  ],
}

const world3BaseCheat: CheatSection[] = [COMMANDS_CHEAT, IF_CHEAT]
const world3LogicCheat: CheatSection[] = [COMMANDS_CHEAT, IF_CHEAT, LOGIC_CHEAT]

/** Rótulos curtos (≤ 25 chars) dos conceitos de cada nível. */
export const WORLD3_CONCEPTS: Record<string, string> = {
  'w3-l1': 'if e else',
  'w3-l2': 'if com comparação',
  'w3-l3': 'comparações com &&',
  'w3-l4': '! e else if',
  'w3-l5': 'decisão escolhe o pulo',
}

export const WORLD3_LEVELS: Level[] = [
  {
    id: 'w3-l1',
    world: 3,
    order: 1,
    title: 'A Chave da Porta',
    narrative: 'A porta da floresta só abre para quem tem a chave. Decida o caminho com um if — e escreva também o ramo do else!',
    concept: {
      title: 'if e else: decidir o caminho',
      body: 'Em Rust, if testa uma condição true/false e executa o bloco { } só quando ela for true. O else pega o caminho alternativo quando a condição falha. O programa escolhe UM dos dois ramos — bifurcação na trilha.',
      bullets: [
        'if condicao { acao; } → roda só se for true',
        'else { outra; } → roda quando o if não vale',
        'A condição precisa ser bool (true ou false)',
      ],
    },
    learnAfter: {
      title: 'Você tomou uma decisão com if',
      body: 'if e else são a base de todo programa que reage ao mundo: o computador testa uma condição e escolhe qual bloco executar. Sempre que o código pergunta "será que...", a resposta vira um if.',
      bullets: [
        'let tem_chave = true; cria um bool',
        'if tem_chave { ... } roda porque é true',
        'else cobre o caminho em que a chave falta',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 A porta (G) está logo adiante. A condição já está pronta:
// 1) Dentro do if { }, escreva o caminho COMPLETO até o G
// 2) Dentro do else { }, escreva o caminho ERRADO (sem chave, não vence)
// Lembre: cada linha termina com ; e os blocos usam { }
`,
    solution: `let tem_chave = true;
if tem_chave {
    mover_direita(11);
} else {
    mover_direita(3);
}
`,
    // 13×8: P0, moeda x6, G x11 na linha 5; V (vigia) na torre à esquerda
    map: [
      '.............',
      '.............',
      '.V...........',
      '.##..........',
      '.............',
      'P.....o....G.',
      '#############',
      '#############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'tem_chave é true, então o caminho COMPLETO até o G deve ficar dentro do bloco do if.',
      'Dentro do if: mover_direita(11);. No else, um trecho curto como mover_direita(3); não vence.',
    ],
    cheatSheet: world3BaseCheat,
  },
  {
    id: 'w3-l2',
    world: 3,
    order: 2,
    title: 'Energia Restante',
    narrative: 'O espelho da floresta só revela a trilha quando a energia calculada for positiva. Calcule, compare e atravesse pegando a moeda!',
    concept: {
      title: 'if com comparação',
      body: 'Uma condição pode ser uma COMPARAÇÃO: dois valores com um operador (>, <, >=, ==...) viram true ou false. Aqui a energia é calculada com uma conta e depois testada com > — o if decide a partir do resultado.',
      bullets: [
        'let energia = 1 + 2; → calcula 3',
        'energia > 0 → a comparação vira bool',
        'O if recebe o resultado da comparação',
      ],
    },
    learnAfter: {
      title: 'Você comparou valores dentro do if',
      body: 'Comparações transformam números em decisões: > >= < <= == != devolvem true ou false, e é esse bool que o if entende. Programar é isso — medir o estado do mundo e reagir a ele.',
      bullets: [
        '1 + 2 dá 3, e 3 > 0 é true',
        'O bloco do if só roda quando a comparação vale',
        'else guarda o caminho para quando ela falha',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 O G está 9 casas adiante, com uma moeda no caminho.
// 1) Crie a variável energia com a conta 1 + 2
// 2) Teste: if energia > 0 { ... } else { ... }
// 3) No if, caminhe até o G; no else, escreva um caminho que NÃO vence
`,
    solution: `let energia = 1 + 2;
if energia > 0 {
    mover_direita(9);
} else {
    mover_direita(3);
}
`,
    // 12×8: P0, moeda x5, G x9 na linha 5; E (engenheiro) na plataforma à direita
    map: [
      '............',
      '............',
      '........E...',
      '........##..',
      '............',
      'P....o...G..',
      '############',
      '############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'A conta vale 3, e 3 > 0 é true — o caminho até o G fica no bloco do if.',
      'Monte: let energia = 1 + 2; if energia > 0 { mover_direita(9); } else { mover_direita(3); }',
    ],
    cheatSheet: world3BaseCheat,
  },
  {
    id: 'w3-l3',
    world: 3,
    order: 3,
    title: 'A Ponte da Faixa',
    narrative: 'A ponte só abaixa se a largura medida estiver entre 2 e 3. Ligue as duas comparações com && e salte na hora certa!',
    concept: {
      title: 'Comparações duplas com &&',
      body: 'Quando a resposta precisa cumprir DUAS condições ao mesmo tempo, ligue as comparações com && (E lógico): o resultado só é true se as duas partes forem true. É como dizer "largura ≥ 2 E largura ≤ 3".',
      bullets: [
        'a >= b && c <= d → true só se AMBAS valem',
        '&& junta duas comparações numa condição só',
        'Comparam primeiro, depois o && combina os bools',
      ],
    },
    learnAfter: {
      title: 'Você combinou comparações com &&',
      body: '&& exige que as duas metades sejam verdadeiras — é a ferramenta certa para faixas e intervalos ("entre 2 e 3"). O || faria o contrário: bastaria uma metade ser true.',
      bullets: [
        '>= é maior ou igual, <= é menor ou igual',
        '2 >= 2 && 2 <= 3 → true && true → true',
        'O if escolhe o pulo pela largura medida',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 A largura do vão é 2. Monte a faixa com && :
//     if largura >= 2 && largura <= 3 { ... } else { ... }
// 1) Ande até a última casa firme antes do vão
// 2) No if, pule com força 2; no else, com força 1 (a errada)
// 3) Continue até o G
`,
    solution: `let largura = 2;
mover_direita(3);
if largura >= 2 && largura <= 3 {
    pular(2);
} else {
    pular(1);
}
mover_direita(5);
`,
    // 12×8: P0, G x8 na linha 5; vão x4–x5 (2 casas, profundo); V na plataforma à direita
    map: [
      '............',
      '............',
      '.........V..',
      '.........##.',
      '............',
      'P.......G...',
      '####  ######',
      '####  ######',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'A faixa usa duas comparações ligadas por &&: largura >= 2 && largura <= 3 — só entra no if se as DUAS valerem.',
      'Ande 3 casas até a borda (x3), pular(2) cruza o vão de 2 e sobra mover_direita(5) até o G.',
    ],
    cheatSheet: world3LogicCheat,
  },
  {
    id: 'w3-l4',
    world: 3,
    order: 4,
    title: 'A Encruzilhada do Espinho',
    narrative: 'Três ramos, um só caminho seguro: o amuleto (!) nega o primeiro aviso, o else if pula o espinho e o último ramo cairia nele. Escolha com cadeia de decisões!',
    concept: {
      title: '! e else if: cadeia de decisões',
      body: 'O operador ! inverte um bool (!true vira false) e else if testa vários caminhos em sequência: if → else if → else. Só UM bloco da cadeia executa — o primeiro cuja condição der true.',
      bullets: [
        '!aprovado inverte o valor de aprovado',
        'else if testa o próximo caminho da fila',
        'else pega tudo que sobrou (última opção)',
      ],
    },
    learnAfter: {
      title: 'Você encadeou decisões com else if',
      body: 'Cadeias if / else if / else são o padrão para escolhas com mais de dois resultados: cada condição é testada de cima para baixo e a primeira que vale vence. O ! serve para inverter qualquer teste.',
      bullets: [
        'A ordem importa: para de testar no primeiro true',
        '!aprovado é false quando aprovado é true',
        'Só um ramo da cadeia é executado',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Cadeia de 3 ramos — o espinho (^) mata ao entrar:
// 1) if !aprovado { ... }            → amuleto negado: nem deve acontecer
// 2) else if obstaculo == 2 { ... }  → O CAMINHO CERTO: salte o espinho!
// 3) else { ... }                    → caminho errado: morreria no espinho
// Só um salto de 2 passa por cima do espinho.
`,
    solution: `let aprovado = true;
let obstaculo = 2;
if !aprovado {
    esperar(2.0);
} else if obstaculo == 2 {
    mover_direita(3);
    pular(2);
    mover_direita(6);
} else {
    mover_direita(5);
}
`,
    // 12×8: P0, espinho x4, G x8 na linha 5; E (engenheiro) na plataforma à direita
    map: [
      '............',
      '............',
      '..........E.',
      '..........##',
      '............',
      'P...^...G...',
      '############',
      '############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'aprovado é true, logo !aprovado é false: o primeiro if é pulado e a cadeia cai no else if obstaculo == 2.',
      'Ramo certo: mover_direita(3); pular(2); mover_direita(6); — o salto de 2 voa por cima do espinho.',
    ],
    cheatSheet: world3LogicCheat,
  },
  {
    id: 'w3-l5',
    world: 3,
    order: 5,
    title: 'Duas Medidas, Dois Saltos',
    narrative: 'Dois vãos de larguras diferentes seguidos. Meça cada um e deixe o if escolher a força do salto — errar a força é cair no abismo!',
    concept: {
      title: 'Decisão que escolhe a força',
      body: 'Aqui a decisão VIRA ação: cada vão tem sua medida e o if escolhe a força exata. Força menor que a largura não cobre o buraco — a decisão certa transforma a medição no salto perfeito.',
      bullets: [
        'if largura >= 2 { pular(2) } else { pular(1) }',
        'A força precisa ser ≥ a largura do vão',
        'Cada obstáculo tem sua própria medição',
      ],
    },
    learnAfter: {
      title: 'Você escolheu a força com uma decisão',
      body: 'Programar é mapear dados (as larguras medidas) para ações (a força do pulo). O if é a ponte entre o que você sabe sobre o obstáculo e o que o programa faz — e cada decisão tem consequência no mapa.',
      bullets: [
        'largura 1 → força 1; largura 2 → força 2',
        'Duas decisões, dois vãos, um só caminho',
        'A força errada derruba o boneco no vão',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar'],
    starterCode: `// 👉 Dois vãos na trilha (meça no mapa!):
// 1) Até a borda do 1º vão → decida a força: if largura_a >= 2 { } else { }
// 2) Até a borda do 2º vão → repita com if largura_b ...
// 3) Siga até o G
// O 1º vão tem 1 casa (x4) e o 2º tem 2 casas (x7–x8).
`,
    solution: `let largura_a = 1;
let largura_b = 2;
mover_direita(3);
if largura_a >= 2 {
    pular(2);
} else {
    pular(1);
}
mover_direita(3);
if largura_b >= 2 {
    pular(2);
} else {
    pular(1);
}
mover_direita(4);
`,
    // 12×8: P0, G x10 na linha 5; vão x4 (1 casa) e x7–x8 (2 casas), profundos
    map: [
      '............',
      '............',
      '.V..........',
      '.##.........',
      '............',
      'P.........G.',
      '#### ##  ###',
      '#### ##  ###',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Meça pelo mapa: o 1º vão tem 1 casa (x4) e o 2º tem 2 casas (x7–x8) — cada if escolhe a força do seu vão.',
      'Sequência: ande 3 → decisão do largura_a; ande 3 (até a borda x6) → decisão do largura_b; ande 4 até o G.',
    ],
    cheatSheet: world3LogicCheat,
  },
]
