import type { CheatSection, Level } from './types'

/**
 * Mundo 6 — Ruínas da Posse: String, falar() e as regras de ownership
 * (Livro Cap. 4). Mesmo formato de mapa dos mundos anteriores.
 * Starter só comentários — EXCEÇÃO: w6-l2 é propositalmente código
 * quebrado (lição do E0382). Para alterar equilíbrio, edite aqui e commite —
 * tests/world6.test.ts garante que a solução continua vencendo o mapa.
 */

const COMMANDS_CHEAT: CheatSection = {
  title: 'Comandos do jogo',
  lines: [
    'mover_direita(n);  → anda n casas pra direita',
    'mover_esquerda(n); → anda n casas pra esquerda',
    'pular(n);          → salta: cobre n casas de vão e sobe 1 degrau com n ≥ 2',
    'esperar(s);        → espera s segundos',
    'falar(texto);      → o herói fala (pausa a animação, não anda)',
  ],
}

const STRINGS_CHEAT: CheatSection = {
  title: 'Textos (String)',
  lines: [
    'let msg = "olá!";  → texto entre aspas é um valor String',
    'falar(msg);        → entrega o texto ao comando',
    'falar("pronto");   → também aceita texto pronto na chamada',
    'Tipos: i32, f64, bool e String',
  ],
}

const OWNERSHIP_CHEAT: CheatSection = {
  title: 'Posse: move e &',
  lines: [
    'falar(msg);   → passa POR VALOR: move a posse (msg fica indisponível)',
    'falar(&msg);  → & é empréstimo: msg continua valendo pra reusar',
    'let b = a;    → com String, também move a para b',
    'Usar msg depois de mover = erro E0382',
    'Regra em 1 linha: vai usar de novo? passe &msg',
  ],
}

const world6Cheat: CheatSection[] = [COMMANDS_CHEAT, STRINGS_CHEAT, OWNERSHIP_CHEAT]

export const WORLD6_LEVELS: Level[] = [
  {
    id: 'w6-l1',
    world: 6,
    order: 1,
    title: 'Palavra Mágica',
    narrative: 'A porta da ruína só responde a voz: escreva a senha como texto e FALE antes de caminhar.',
    concept: {
      title: 'Texto: tipo String e falar()',
      body: 'Textos entre aspas "..." são valores do tipo String — outra caixinha do Rust, só que guarda palavras. O comando falar(mensagem) faz o herói dizer o texto em voz alta: ele pausa para falar e não se move do lugar.',
      bullets: [
        'let msg = "Porta aberta!"; → cria o texto',
        'falar(msg); → o herói diz a frase',
        'Falar pausa a animação, mas não anda',
      ],
    },
    learnAfter: {
      title: 'Você criou e falou um texto',
      body: 'String é o tipo dos textos do Rust e o let guarda ele igual guarda número. Passar msg a falar() entregou a frase ao comando — uma frase, uma fala, e o programa segue em frente.',
      bullets: [
        'Aspas "..." criam um String',
        'falar(x); roda como qualquer outro comando',
        'O boneco fala sem sair do lugar',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar', 'falar'],
    starterCode: `// 👉 1) let msg = "..."; → escreva a senha da ruína entre aspas
//     2) falar(msg); → diga a senha (uma vez só)
//     3) mover_direita(?); → conte as casas até o G
`,
    solution: `let msg = "Portão aberto!";
falar(msg);
mover_direita(10);
`,
    // 12×8: P0, G x10; V e E nas plataformas
    map: [
      '............',
      '............',
      '.V........E.',
      '.##......##.',
      '............',
      'P.........G.',
      '############',
      '############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Crie o texto com let msg = "..."; e entregue a falar com falar(msg);',
      'Depois é só caminhar: o G está 10 casas à direita do P.',
    ],
    cheatSheet: world6Cheat,
  },
  {
    id: 'w6-l2',
    world: 6,
    order: 2,
    title: 'O Texto que Sumiu',
    narrative: 'O compilador travou a ruína: a senha sumiu depois do primeiro falar. Ache o E0382 e conserte!',
    concept: {
      title: 'Move: a posse se transfere',
      body: 'Passar um String por valor para uma função MOVE a posse: quem chama entrega a caixinha inteira e a variável original fica indisponível. Usá-la de novo gera o erro E0382 — o Rust não deixa usar o que já foi entregue.',
      bullets: [
        'falar(senha); → move a posse de senha',
        'Segunda falar(senha); → erro E0382',
        'E0382 = "valor movido e usado de novo"',
      ],
    },
    learnAfter: {
      title: 'Você escapou do E0382',
      body: 'O erro E0382 protege você de usar dado que já foi transferido. A saída é emprestar com & antes do valor: falar(&senha) lê o texto sem tirar a posse — e como nada moveu, a frase pode ser dita quantas vezes precisar.',
      bullets: [
        '&senha → empréstimo (não move)',
        'Se a 1ª chamada já moveu, nem & na 2ª salva',
        'E0382 some quando nada é usado após o move',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar', 'falar'],
    starterCode: `// O Rust travou este código com erro E0382.
// A senha foi movida no 1º falar — ela some na 2ª chamada.
// Conserte as chamadas e chegue ao G.
let senha = "pedra-verde";
falar(senha);
falar(senha);
// 👉 Depois: mover_direita(9); até o G
`,
    solution: `let senha = "pedra-verde";
falar(&senha);
falar(&senha);
mover_direita(9);
`,
    // 12×8: P0, moeda x5, G x9 — rota reta após o conserto
    map: [
      '............',
      '............',
      '............',
      '............',
      '............',
      'P.....o..G..',
      '############',
      '############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Se a PRIMEIRA chamada já moveu a senha, nem &senha na segunda resolve — empreste desde o começo.',
      'Duas chamadas de empréstimo falar(&senha); falar(&senha); e depois mover_direita(9);.',
    ],
    cheatSheet: world6Cheat,
  },
  {
    id: 'w6-l3',
    world: 6,
    order: 3,
    title: 'A Chave Emprestada',
    narrative: 'Dois portões pedem a mesma senha: empreste o texto com & para usá-lo em dois momentos diferentes.',
    concept: {
      title: '&: empréstimo sem mover',
      body: 'Antes de um identificador, & significa "só estou olhando": falar(&msg) empresta o texto sem tirar a posse de msg. Como nada foi movido, msg continua viva e pode ser usada de novo — quantas vezes você quiser.',
      bullets: [
        'falar(&msg); → empréstimo, msg continua disponível',
        'Emprestar não gera E0382',
        'Vai reusar o mesmo texto? & é o caminho',
      ],
    },
    learnAfter: {
      title: 'Você reutilizou um texto com &',
      body: 'Empréstimo é a rotina do dia a dia em Rust: quase tudo passa por referência &x para nada se mover sem querer. Só quando você quer ENTREGAR de verdade a posse é que se passa o valor sem o &.',
      bullets: [
        '&msg empresta; msg sem & move',
        'Duas falas, um só texto, zero erros',
        'Referência lê sem consumir',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar', 'falar'],
    starterCode: `// 👉 1) let msg = "..."; → a senha dos dois portões
//     2) falar(&msg); ANTES de sair e de novo NA borda do vão
//     3) Rota: mover_direita(5); pular(2); mover_direita(4);
`,
    solution: `let msg = "Segredo da ruína";
falar(&msg);
mover_direita(5);
falar(&msg);
pular(2);
mover_direita(4);
`,
    // 12×8: P0, G x9; vão x6–x7 (2 casas, profundo)
    map: [
      '............',
      '............',
      '..........E.',
      '........###.',
      '............',
      'P........G..',
      '######  ####',
      '######  ####',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'Passe &msg nas DUAS falas: o empréstimo deixa msg viva para a segunda.',
      'Rota: 5 casas até a borda (x5), falar de novo, pular(2) e 4 casas até o G.',
    ],
    cheatSheet: world6Cheat,
  },
  {
    id: 'w6-l4',
    world: 6,
    order: 4,
    title: 'O Mensageiro da Ruína',
    narrative: 'O arauto repete o boletim: ensine uma fn a falar e não deixe ela comer seu texto no caminho.',
    concept: {
      title: 'fn com parâmetro String',
      body: 'fn anunciar(t: String) recebe um texto — e a regra de posse vale aqui também: chamar anunciar(msg) MOVE msg para dentro da fn. Passando anunciar(&msg), o empréstimo atravessa a chamada e msg sobrevive para a próxima.',
      bullets: [
        'fn anunciar(t: String) { falar(t); }',
        'anunciar(msg); → move (E0382 na próxima)',
        'anunciar(&msg); → empréstimo que atravessa',
      ],
    },
    learnAfter: {
      title: 'Você passou empréstimo para uma fn',
      body: 'A posse acompanha o valor por onde ele viaja: valor entregue move, referência empresta. Com & na chamada, a mesma mensagem foi anunciada duas vezes e o programa seguiu sem esbarrar no E0382.',
      bullets: [
        'anunciar(&msg); pode ser chamado quantas vezes',
        'Sem &, a 2ª chamada cai no E0382',
        'Parâmetro String + argumento & = empréstimo seguro',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar', 'falar'],
    starterCode: `// 👉 1) fn anunciar(t: String) { falar(t); }
//     2) let msg = "boletim da ruína";
//     3) Chame anunciar(&msg); DUAS vezes: antes do salto e após pousar
//     4) Rota: mover_direita(4); pular(2); mover_direita(5);
`,
    solution: `fn anunciar(t: String) {
  falar(t);
}
let msg = "Ruína desperta!";
anunciar(&msg);
mover_direita(4);
pular(2);
anunciar(&msg);
mover_direita(5);
`,
    // 13×8: P0, espinho x5, moeda x8, G x9
    map: [
      '.............',
      '.............',
      '.............',
      '.............',
      '.............',
      'P....^..oG...',
      '#############',
      '#############',
    ],
    success: { type: 'reach_goal' },
    hints: [
      'A fn recebe t: String, mas quem chama deve passar &msg — senão msg morre já na 1ª chamada.',
      'anunciar(&msg); → 4 casas até a borda, pular(2) sobre o espinho, anunciar(&msg); e 5 casas até o G.',
    ],
    cheatSheet: world6Cheat,
  },
  {
    id: 'w6-l5',
    world: 6,
    order: 5,
    title: 'O Selo das Ruínas',
    narrative: 'O selo exige voz, passos repetidos e a moeda antiga: junte laço, fn e posse para concluí-lo.',
    concept: {
      title: 'Tudo junto: laço, fn e posse',
      body: 'O ritual final combina as três artes: o laço for repete os passos, sua fn fala sem gastar a posse, e o & mantém a mensagem viva do começo ao fim. Com isso você descreve o caminho inteiro em poucas linhas.',
      bullets: [
        'for i in 0..3 { mover_direita(2); } → 3 repetições',
        'anunciar(&saudacao); → fala sem mover o texto',
        'Moeda obrigatória: colete antes de ir ao G',
      ],
    },
    learnAfter: {
      title: 'Você concluiu a Ruína da Posse',
      body: 'Laços economizam linhas, funções guardam ideias e & mantém os textos emprestados. Com essas três peças você escreve programas curtos, seguros e completos — exatamente o estilo do Rust de verdade.',
      bullets: [
        'for repetiu a caminhada sem copiar e colar',
        'anunciar reusou a mesma saudação com &msg',
        'Moeda + G = selo completo',
      ],
    },
    allowedFunctions: ['mover_direita', 'mover_esquerda', 'pular', 'esperar', 'falar'],
    starterCode: `// 👉 Ritual completo (voz + passos + moeda):
// 1) fn anunciar(t: String) { falar(t); }
// 2) let saudacao = "..."; → anunciar(&saudacao); abre o ritual
// 3) for i in 0..3 { mover_direita(2); } → 6 casas até a borda (coleta a moeda)
// 4) pular(2); mover_direita(3); → para em x9, antes do espinho
// 5) pular(2); anunciar(&saudacao); mover_direita(4); → rumo ao G
`,
    solution: `fn anunciar(t: String) {
  falar(t);
}
let saudacao = "Selo desperto!";
anunciar(&saudacao);
for i in 0..3 {
  mover_direita(2);
}
pular(2);
mover_direita(3);
pular(2);
anunciar(&saudacao);
mover_direita(4);
`,
    // 14×8: P0, moeda x5, espinho x10, G x13; vão x7–x8 (2 casas, profundo)
    map: [
      '..............',
      '..............',
      '..............',
      '..............',
      '..............',
      'P....o....^..G',
      '#######  #####',
      '#######  #####',
    ],
    success: { type: 'reach_goal_all_coins' },
    hints: [
      'O for repete 3× mover_direita(2) → 6 casas até a borda do vão, coletando a moeda no caminho.',
      'Depois: pular(2) e 3 casas até x9; pular(2) de novo (espinho), anunciar(&saudacao); e 4 casas até o G.',
    ],
    cheatSheet: world6Cheat,
  },
]

/** Rótulos curtos por nível — cards de progresso / mapas de conceito. */
export const WORLD6_CONCEPTS: Record<string, string> = {
  'w6-l1': 'String e falar()',
  'w6-l2': 'E0382: move',
  'w6-l3': 'empréstimo &',
  'w6-l4': 'fn com String',
  'w6-l5': 'laço + fn + posse',
}
