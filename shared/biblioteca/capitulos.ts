import type { Capitulo } from './types'

/**
 * Capítulos da Biblioteca do Aventureiro.
 *
 * Fonte de redação: o livro oficial *The Rust Programming Language* (cópia local
 * de 2025-09-18, Rust 1.90 / edition 2024). Cada capítulo aponta o capítulo do
 * livro no campo `livro` — o mesmo mapeamento já declarado nos comentários de
 * `shared/levels/world*.ts` ("Cap. 3 do livro", "Livro Cap. 4"…).
 *
 * Regras: PT-BR simples, termos técnicos em inglês, e NADA que repita `learnAfter`
 * ou `cheatSheet` do nível — se não acrescenta, não está aqui.
 */
export const CAPITULOS: Capitulo[] = [
  // ── Mundo 1 — Vila das Variáveis ─────────────────────────────────────────
  {
    slug: 'chamada-de-funcao',
    titulo: 'Chamada de função',
    resumo: 'O formato nome(argumentos); que faz o programa agir.',
    mundo: 1,
    passo: 1,
    oQueVoceFez: 'No primeiro nível você escreveu mover_direita(10); e o boneco andou até a porta. Você não criou essa função — ela vem pronta do mapa. O que você criou foi a CHAMADA: a ordem para o programa executar aquele corpo naquele ponto exato do roteiro.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Programar sem função seria reescrever a mesma instrução o tempo todo. Função existe para você guardar um comportamento sob um nome e pedir que ele rode quando quiser, quantas vezes quiser. No mundo do jogo isso é invisível porque mover_direita, pular, esperar e mover_esquerda já vêm de fábrica — mas a mecânica é exatamente a mesma de qualquer programa Rust.',
          'A distinção que muda tudo é entre DEFINIR e CHAMAR. Definir é escrever a receita; chamar é mandar alguém cozinhar agora. Uma receita escrita no caderno não alimenta ninguém, e uma função declarada com fn não faz nada até você chamá-la com parênteses.',
        ],
        codigos: [
          {
            titulo: 'Definir x chamar',
            snippet: `fn saudacao() {                 // DEFINIÇÃO: só guarda a receita
    println!("Oi!");            // corpo: roda quando chamada
}

fn main() {
    saudacao();                 // CHAMADA: executa o corpo agora
    saudacao();                 // pode chamar de novo — e de novo
}`,
          },
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'O formato é sempre nome(argumentos);. Os parênteses dizem "execute aqui" e o argumento diz o quanto fazer. É como um botão de elevador: o nome identifica o botão, e o número que você digita antes de apertar diz qual andar. Sem parênteses não há chamada — só uma referência ao nome.',
          'O ponto-e-vírgula no fim importa porque ele transforma a chamada em statement: um passo que o programa executa e descarta. A chamada em si é uma expression, ou seja, devolve um valor; com o ; ela vira mais uma linha do roteiro. Por isso o jogo insiste em ; no fim de cada linha de comando — sem ele, o parser nem enxerga o passo como completo.',
          'A ordem das linhas é a ordem da execução. O programa lê de cima para baixo, então mover_direita(4); antes de pular(2); significa andar primeiro e pular depois. Trocar as linhas troca a ação no mapa.',
        ],
        codigos: [
          {
            titulo: 'A chamada do primeiro nível, em Rust de verdade',
            snippet: `fn main() {
    mover_direita(10);          // como no w1-l1: nome + (argumento) + ;
}

// No jogo essa função é fornecida pelo mapa. No Rust real você escreve a sua:
fn mover_direita(n: i32) {
    println!("anda {n} casas");
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'A sintaxe não muda nada: nome(argumentos) vale igualmente num binário compilado. O que muda é de onde vêm as funções. No jogo elas são a API do mapa; num projeto Rust elas vêm do seu próprio código, da standard library (println!, format!) ou de crates de terceiros que você importou.',
          'Uma curiosidade que costuma surpreender: a ordem das DEFINIÇÕES de função no arquivo não importa. Rust enxerga qualquer fn declarada no mesmo scope, mesmo que esteja escrita depois da main. O que importa é a ordem das CHAMADAS em tempo de execução — só essas seguem o roteiro de cima para baixo.',
        ],
      },
    ],
    pegadinhas: [
      'Esquecer o ; no fim da chamada — no jogo a linha simplesmente não roda.',
      'Escrever fn mover_direita(10); — o fn é só para definição; chamar é só o nome com parênteses.',
      'Escrever mover_direita sem os parênteses: isso não chama nada, é só o nome de uma função.',
      'Chamar uma função que não existe no allowlist do nível: o jogo responde com E0425.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Functions',
      url: 'https://doc.rust-lang.org/book/ch03-03-how-functions-work.html',
    },
    niveis: ['w1-l1'],
  },

  {
    slug: 'variaveis-let',
    titulo: 'Variáveis com let',
    resumo: 'Colar um nome num valor para usar depois, quantas vezes precisar.',
    mundo: 1,
    passo: 3,
    oQueVoceFez: 'No segundo nível você mediu o caminho uma vez, guardou o número em passos com let passos = 8; e depois passou a variável no lugar do número na chamada mover_direita(passos). Pela primeira vez o programa passou a guardar informação em vez de só executar comandos.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Sem variável, todo número seria escrito à mão em toda linha. Se o caminho mudar, você teria que caçar todos os números espalhados pelo código. Com let, o número é escrito uma vez e o nome é reutilizado — se a medição mudar, muda em um lugar só.',
          'Também é assim que dados circulam por um programa. O valor criado num passo fica disponível nos próximos, e o programa vai montando o resultado em cima do que já sabe. É o mecanismo mais básico que existe: um programa sem variável não lembra de nada.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'let cria uma binding: um nome colado num valor. Pense numa caixinha com etiqueta — let passos = 8; põe o 8 dentro e cola o nome passos na caixinha. Na hora de executar, o Rust lê o que está escrito na etiqueta naquele momento.',
          'É importante perceber que binding não é "atribuição" no sentido de encher algo que já existia: é criar a associação. Depois do let, o valor nasce fixo — você precisa pedir mut explicitamente para mudá-lo, e isso é o assunto do capítulo seguinte.',
          'O nome só existe a partir da linha em onde foi criado. Código acima da linha do let não enxerga a variável, porque ela ainda não existe. E o valor guardado é o daquele instante: se você fizer let x = 5; e depois o mundo mudar lá fora, x continua 5 até você recriá-lo.',
        ],
        codigos: [
          {
            titulo: 'Criar, guardar e reutilizar',
            snippet: `fn main() {
    let passos = 8;                // cria a caixinha com o 8 dentro
    println!("faltam {passos}");    // lê o valor depois
    mover_direita(passos);          // usa o NOME no lugar do número
}

fn mover_direita(n: i32) {
    println!("anda {n}");
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'A palavra binding é a que os Rustaceans usam: let não "declara variável", ela cola um nome num valor. Isso explica um detalhe linguístico — você pode re-etiquetar a mesma caixinha com outro let usando o mesmo nome, prática chamada shadowing, que cria um valor novo sem pedir mut. O jogo não usa shadowing, mas você vai encontrá-lo em qualquer código real.',
          'Outra diferença prática: o tipo é deduzido do valor. let passos = 8; vira i32 automaticamente, porque 8 é um inteiro. Se precisar forçar, você escreve a anotação: let passos: i32 = 8;. O interpretador do jogo faz o mesmo raciocínio quando avalia a expressão.',
        ],
      },
    ],
    pegadinhas: [
      'Usar o nome numa linha acima da que o cria — a variável ainda não existe ali.',
      'Digitar o número de novo na chamada em vez do nome, aí se a medição mudar você tem que achar todos os números.',
      'Esquecer o ; no fim do let — sem ele o passo não fica completo.',
      'Esperar que a variável atualize sozinha: ela guarda o valor do momento do let e não acompanha nada depois.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Variables and Mutability',
      url: 'https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html',
    },
    niveis: ['w1-l2'],
  },

  {
    slug: 'mutabilidade',
    titulo: 'let mut e mutabilidade',
    resumo: 'No Rust tudo nasce travado; mut é a autorização para mudar.',
    mundo: 1,
    passo: 3,
    oQueVoceFez: 'No terceiro nível o código já vinha quebrado de propósito: passos era criado com let e recebia um valor novo depois, o que gera o erro E0384. Você consertou escrevendo let mut passos e a partir daí a variável aceitou a mudança. Foi a primeira vez que você leu um erro do compilador e o resolveu entendendo a regra.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Imutável por padrão é uma decisão de projeto, não um acidente. Se uma parte do código assume que o valor nunca muda, ninguém pode mudá-lo por acidente em outro lugar — o compilador vira um guarda que cumpre a sua promessa. Isso elimina uma classe inteira de bugs antes mesmo de o programa rodar.',
          'A regra parece dura no começo e vira hábito rápido. Na prática, a maioria das variáveis é imutável mesmo, e as que realmente precisam mudar carregam mut como um sinal visível para quem ler o código depois de você.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'let x = 5; lacra a caixinha. Tentar x = 6; em cima disso gera E0384, cannot assign twice to immutable variable, com a dica de trocar para let mut x. Foi exatamente o erro que o nível pediu para você consertar.',
          'Com let mut passos = 1;, a partir daí passos = 7; é permitido. O mut fica na DECLARAÇÃO, nunca na reatribuição — a ordem é let mut x, não mut x e nem x mut.',
          'Detalhe que evita muita confusão: mut autoriza trocar o VALOR, nunca o TYPE. Uma variável mutável continua sendo do tipo que nasceu. Se você quiser guardar um tipo diferente, precisa de um let novo com outro nome.',
        ],
        codigos: [
          {
            titulo: 'Travado x liberado',
            snippet: `fn main() {
    let x = 5;          // travado por padrão
    // x = 6;           // ERRO E0384: cannot assign twice to immutable variable

    let mut passos = 1; // declaração mutável
    passos = 7;         // reatribuição permitida
    println!("{passos}"); // lê o valor atual: 7
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'O código real é idêntico. O que muda é a leitura: em Rust, mut não significa "essa variável é mutável", significa "essa variável PODE mudar". É uma permissão explícita, e o compilador vai lembrar você dela em cada reatribuição.',
          'O E0384 não some depois do jogo — ele aparece em projetos reais com a mesma mensagem. A diferença é que o compilador real também aponta a linha exata e sugere a correção, o que torna o erro dosso de se ler depois que você entendeu a regra.',
        ],
      },
    ],
    pegadinhas: [
      'Copiar let x = 1; x = 2; de outras linguagens e levar E0384 na cara.',
      'Esquecer o mut na declaração e tentar compensar depois — não existe mut na linha da reatribuição.',
      'Escrever mut x = 1; sem o let: a ordem correta é let mut x.',
      'Tentar mudar o tipo de uma variável mut (E0308) em vez de criar uma nova binding com outro nome.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Variables and Mutability',
      url: 'https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html#variables-and-mutability',
    },
    niveis: ['w1-l3'],
  },

  {
    slug: 'argumentos',
    titulo: 'Argumentos e tipos',
    resumo: 'Cada valor passado tem um type, e o type precisa bater.',
    mundo: 1,
    passo: 2,
    oQueVoceFez: 'No quarto nível você controlou a altura do salto com pular(2) em vez de pular() — ou seja, escolheu o valor do argumento. Ao fazer isso você estava decidindo entre inteiros e decimais: casas são i32, segundos são f64, e o jogo recusa a troca entre eles.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Argumento é o valor concreto que você entrega numa chamada. Ele existe porque funções precisam saber o quanto trabalho fazer: mover_direita(4) anda 4 casas, mover_direita(9) anda 9. Sem argumento, toda função faria sempre a mesma coisa.',
          'O Rust acrescenta uma camada que outras linguagens nem sempre têm: cada argumento tem type, e esse type é verificado antes de o programa rodar. Isso soa burocrático até você perceber que ele impede coisas como passar segundos onde se esperava casas — o programa simplesmente não compila.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'Os quatro tipos primitivos do jogo cobrem quase tudo: i32 para inteiros com sinal de 32 bits (o padrão do Rust para números), f64 para decimal de 64 bits (o padrão para pontos flutuantes), bool para true ou false, e String para texto.',
          'O literal revela o type: 2 é inteiro, 2.0 é decimal. Escrever pular(2.0) onde a função pede i32 dá erro de tipo — expected i32, found f64 — e nem adianta "converter sozinho", porque Rust não faz conversão automática entre tipos numéricos.',
          'Uma regra que surpreende quem vem de outras linguagens: não existe argumento opcional nem valor default em Rust. Toda chamada leva todos os argumentos, sempre. O jogo faz uma concessão em pular, onde a força tem valor de fábrica 1, mas isso é convenção da API do mapa, não da linguagem.',
        ],
        codigos: [
          {
            titulo: 'Os quatro tipos em uso',
            snippet: `fn main() {
    let casas: i32 = 4;          // inteiro
    let tempo: f64 = 2.0;        // decimal
    let tem_chave: bool = true;  // booleano
    let aviso: String = String::from("porta trancada"); // texto

    println!("{casas} {tempo} {tem_chave} {aviso}");
}`,
          },
          {
            titulo: 'O type do argumento é cobrado',
            snippet: `fn pular_forca(forca: i32) {
    println!("salta com {forca}");
}

fn main() {
    pular_forca(2);        // ok: inteiro
    // pular_forca(2.0);   // ERRO: expected i32, found f64
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'Os tipos são os mesmos, mas o i32 é de verdade 32 bits com teto em 2.147.483.647, enquanto o jogo roda num interpretador próprio que nunca estoura (e ainda limita passos e forças a 100 via E0900). Isso importa quando a sua conta depender de cabeçalho de números grandes.',
          'Também vale notar o que existe lá fora e não aqui: usize para tamanhos, char para um caractere isolado, u8 para bytes. O jogo para nos quatro tipos primitivos de propósito — é o suficiente para a aventura, e o resto vem nos mundos seguintes.',
        ],
      },
    ],
    pegadinhas: [
      'Passar 2 onde a função pede f64 (ou o contrário): mismatched types.',
      'Esperar argumentos default — Rust exige todos, sempre.',
      'Trocar a ordem de dois argumentos do mesmo type: compila, mas a lógica quebra em silêncio.',
      'Esquecer a vírgula entre argumentos: trecho(2 2) nem passa do parser.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Data Types',
      url: 'https://doc.rust-lang.org/book/ch03-02-data-types.html',
    },
    niveis: ['w1-l4'],
  },

  {
    slug: 'sequencia',
    titulo: 'Sequência e planejamento',
    resumo: 'O programa é um roteiro lido de cima para baixo.',
    mundo: 1,
    passo: 1,
    oQueVoceFez: 'No quinto nível você não escreveu código direto: primeiro leu o mapa, decidiu onde parar, quando pular e com qual força, e só depois transformou cada obstáculo em uma ou mais linhas na ordem certa. Foi o primeiro momento em que programar foi resolver um problema, não só digitar sintaxe.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Antes de qualquer sintaxe existe um plano. Um programa é uma sequência de ações organizadas para resolver algo, e a habilidade central de quem programa é quebrar um problema grande em passos pequenos e ordenados. Escrever a linha é a parte fácil; saber qual linha vem antes de qual é a parte difícil.',
          'É por isso que o nível pede o desenho no papel primeiro. O mapa mostra onde você precisa chegar, e cada obstáculo vira uma decisão: andar até aqui, pular este vão, medir a largura, escolher a força. O código é só a tradução desse plano para a linguagem que o computador entende.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'A execução é linha a linha, de cima para baixo, uma por vez. O programa começa na primeira linha da main, faz, vai para a segunda, faz, e assim até o fim. Ele não pula, não reordena e não adivinha intenção — a ordem das suas linhas É a ordem das ações.',
          'Variáveis dão continuidade ao roteiro: um valor criado num passo pode ser usado nos próximos. Calcular a ida, guardar, executar, depois calcular a volta reaproveitando o que já se sabe — os dados circulam, mas sempre "pra baixo". Um valor só existe depois da linha que o criou.',
          'Uma exceção importante: a ordem das DEFINIÇÕES de função não importa, porque Rust resolve o nome em qualquer lugar do scope. O que segue o roteiro é a ordem das CHAMADAS. Separe os dois conceitos e metade das dúvidas de leitura de código desaparece.',
        ],
        codigos: [
          {
            titulo: 'O roteiro em quatro passos',
            snippet: `fn main() {
    let avanco = 4 * 3;         // 1) calcula a ida: 12
    println!("ida: {avanco}");   // 2) executa a ida
    let volta = avanco - 4;      // 3) calcula a volta: 8
    println!("volta: {volta}");  // 4) executa a volta — reaproveita o passo 1
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'A regra é idêntica em qualquer projeto Rust. O que muda é a escala: em vez de 8 linhas você escreve centenas, e é aí que o hábito de planejar antes de digitar paga conta. Código escrito sem plano vira código que você não consegue explicar uma semana depois.',
          'Vale uma nota sobre otimização: o compilador otimiza bastante, mas ele preserva a semântica das suas ações. Ele nunca vai reordenar passos que mudam o resultado — se você andou antes de pular, andou antes de pular.',
        ],
      },
    ],
    pegadinhas: [
      'Usar um valor numa linha acima da que o cria — ele ainda não existe naquele ponto.',
      'Escrever os passos fora da ordem do mapa: pular antes de chegar na borda morre no vão.',
      'Achar que o Rust reordena ou otimiza a lógica por conta própria — ele preserva a ordem das suas ações.',
      'Refazer uma conta que já tinha sido guardada numa variável, porque esqueceu de reutilizar o nome.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Functions',
      url: 'https://doc.rust-lang.org/book/ch03-03-how-functions-work.html',
    },
    niveis: ['w1-l5'],
  },

  // ── Mundo 2 — Penhasco dos Operadores ────────────────────────────────────
  {
    slug: 'operadores',
    titulo: 'Operadores aritméticos',
    resumo: '+, -, *, / e % — e o truque da divisão inteira.',
    mundo: 2,
    passo: 4,
    oQueVoceFez: 'Nos cinco níveis do penhasco você resolveu forças e passos com contas: soma para dobrar, divisão para repartir, multiplicação para acelerar. Em algum momento o resultado não foi o decimal que você esperava — e foi aí que a divisão inteira apareceu.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Operador é a forma de o programa calcular alguma coisa. Ele combina dois valores e produz um novo, que é avaliado na hora da execução e guardado onde você mandou. Sem operadores, variável só guardaria constantes e o programa não pensaria nada.',
          'Existe uma segunda razão, menos óbvia: operador carrega regra de precedência. Ela decide qual conta acontece primeiro quando a linha tem mistura, e é o que permite escrever 2 * 2 + 1 sem parênteses em volta de cada pedaço.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'Os cinco operadores são os da matemática: + soma, - subtrai, * multiplica, / divide e % devolve o resto da divisão. Existe também o atalho compound assignment, como += e -=, que soma e reatribui na mesma linha.',
          'A armadilha clássica é a divisão inteira. Quando os dois lados são i32, o resultado é i32 e a parte fracionária é truncada em direção a zero. 7 / 2 vale 3, não 3.5. E -5 / 2 vale -2, porque o arredondamento é para zero, não para baixo. Para decimal você precisa de f64 nos dois lados: 7.0 / 2.0.',
          'O % é o complemento natural: se 7 / 2 dá 3, então 7 % 2 dá 1, a sobra. Juntos eles fazem repartição inteira, que é exatamente o cálculo de quantum por rodada que você repetiu no segundo nível.',
          'A precedência segue a matemática: primeiro unário (-x), depois * / %, depois + -, depois comparações, depois &&, depois ||. Quando você quiser outra ordem, agrupe com parênteses — e use-os sempre que a conta ficar ambígua, porque eles documentam a intenção.',
        ],
        codigos: [
          {
            titulo: 'Divisão inteira e resto',
            snippet: `fn main() {
    let a = 7;
    let b = 2;
    let quociente = a / b;     // integer division: 7 / 2 == 3 (trunca)
    let resto = a % b;         // remainder: 7 % 2 == 1 (a sobra)
    println!("{quociente} {resto}"); // imprime "3 1"
}`,
          },
          {
            titulo: 'Precedência em ação',
            snippet: `fn main() {
    let mut forca = 2 * 2;       // * antes de + → 4
    forca += 1;                  // soma e reatribui → 5
    let passos = 12 / 4 + 1;     // / primeiro: 3 + 1 == 4
    let agrupado = (1 + 2) * 3;  // parênteses mudam a ordem → 9
    println!("{forca} {passos} {agrupado}");
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'O tipo do resultado sai dos operandos e o Rust exige que os dois lados sejam do mesmo tipo: 5 + 2 é i32, 5.0 + 2.0 é f64, e 5 + 2.0 não compila. Não existe conversão automática — o mesmo comportamento que o checker do jogo cobra quando você mistura tipos.',
          'A diferença relevante está em runtime. Dividir inteiro por zero no Rust é panic: o programa aborta na hora, e o compilador não avisa porque ele não sabe que valor vai chegar ali. No jogo isso vira o E0201 com mensagem amigável. Curiosidade: no Rust, 5.0 / 0.0 em f64 NÃO panica — vira inf.',
          'Os operadores vêm de traits overloadable (Add, Sub, Mul, Div, Rem), o que significa que tipos que você criar podem definir como somam. Isso está longe do alcance do jogo, mas explica por que o mesmo símbolo funciona para inteiros, decimais e tipos que ainda vão aparecer.',
        ],
      },
    ],
    pegadinhas: [
      'Esperar que 7 / 2 dê 3.5 — com i32 o resultado é 3, e 7 / 2 == 4 é tão errado quanto.',
      'Dividir ou tirar resto por zero: no jogo é E0201, no Rust é panic em runtime.',
      'Misturar i32 e f64 (5 / 2.0) — é erro de compilação, não conversão implícita.',
      'Esquecer a precedência numa conta mista: 2 * 2 + 1 é 5, não 6.',
    ],
    livro: {
      capitulo: 'Apêndice B — Operators and Symbols',
      url: 'https://doc.rust-lang.org/book/appendix-02-operators.html#operators',
    },
    niveis: ['w2-l1', 'w2-l2', 'w2-l4'],
  },

  {
    slug: 'expressoes',
    titulo: 'Expressões e precedência',
    resumo: 'Quase tudo em Rust produz valor — inclusive blocos.',
    mundo: 2,
    passo: 4,
    oQueVoceFez: 'No último nível do penhasco você juntou variáveis, contas e salto numa coisa só, agrupando partes da conta com parênteses para a ordem sair certa. Na prática você estava montando expressions que o programa avaliava antes de virar ação.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Uma expression é um pedaço de código que produz um valor. 5 + 6 é uma expression que vale 11; true é uma expression que vale true. O oposto é statement, que faz algo e não devolve valor — let x = 6; prepara uma binding e entrega nada.',
          'Essa separação parece acadêmica até você descobrir que ela sustenta quase toda a sintaxe do Rust: o valor de retorno de uma função, o valor de um if, o valor de um bloco, tudo vem da ideia de que código pode produzir resultado.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'Blocos são expressions. O valor de { ... } é a ÚLTIMA linha escrita sem ;. Se você põer ; na última linha, ela vira statement e o bloco passa a valer (), o unit — um valor vazio que ninguém quer guardar.',
          'Rust favorece expression até onde outras linguagens usariam statement: if, match, loop e blocos podem ser atribuídos a uma variável. É a razão de if no jogo poder escolher a força do pulo — os dois ramos entregam um número.',
          'A precedência é a da matemática: * e / vêm antes de + e -. Quando você quer outra ordem, agrupe com parênteses. Vale escrever parênteses mesmo onde seriam redundantes, porque eles documentam a intenção para quem lê.',
        ],
        codigos: [
          {
            titulo: 'O bloco como expression',
            snippet: `fn main() {
    let forca = {
        let base = 2;      // statement: declara e termina com ;
        base * 2           // última linha SEM ; → dá o valor do bloco (4)
    };
    println!("{forca}");    // imprime 4

    // let vazio = { 5; }; // com ; o bloco valeria () — e não 5
}`,
          },
          {
            titulo: 'Precedência e agrupamento',
            snippet: `fn main() {
    let conta = 1 + 2 * 3;         // * antes de + → 7
    let agrupado = (1 + 2) * 3;    // parênteses primeiro → 9
    println!("{conta} {agrupado}"); // imprime "7 9"
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'O compilador deduz o tipo da expression a partir dos operandos: let a = 5; vira i32, let b = 2.0; vira f64, e let soma = a + a; herda i32. Quando a inferência não basta, você anota explicitamente com let x: i32 = 5;.',
          'Um detalhe que só aparece em código real: overflow muda conforme o perfil de build. Em debug, i32::MAX + 1 panica com uma mensagem boa; em release ele envolve silenciosamente para i32::MIN por questão de performance. Por isso existem checked_add, wrapping_add e saturating_add. O jogo não tem overflow — o interpretador limita valores via E0900.',
        ],
      },
    ],
    pegadinhas: [
      'Pôr ; na última linha de um bloco que deveria devolver valor — o ; mata o retorno.',
      'Tentar usar statement como valor: let x = (let y = 6); não compila.',
      'Esquecer a precedência: 1 + 2 * 3 é 7, não 9.',
      'Achar que ; é só formalidade — ele muda o sentido da linha inteira.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Statements and Expressions',
      url: 'https://doc.rust-lang.org/book/ch03-03-how-functions-work.html#statements-and-expressions',
    },
    niveis: ['w2-l3', 'w2-l5'],
  },

  // ── Mundo 3 — Floresta das Decisões ──────────────────────────────────────
  {
    slug: 'if-else',
    titulo: 'if e else',
    resumo: 'O programa escolhe um caminho a partir de um bool.',
    mundo: 3,
    passo: 5,
    oQueVoceFez: 'Na floresta você escreveu código que lê o mapa e decide sozinho: se tem chave abre, senão tenta outro caminho. Em w3-l1 o if escolhia entre duas rotas; em w3-l5 ele escolhia a FORÇA do pulo a partir da largura medida. Pela primeira vez o seu programa reagiu ao que encontrou.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Um programa sem condicional só executa sempre a mesma coisa. if é o que transforma código em decisão: testa uma condição e executa um bloco só se ela for verdadeira. É o ponto onde o programa deixa de ser um roteiro fixo e passa a responder ao ambiente.',
          'No jogo isso ficou concreto porque o mapa muda: às vezes há chave, às vezes não; às vezes o vão tem 1 casa, às vezes 2. Escrever duas versões do código seria insustentável — uma versão só, com if dentro, resolve todos os casos.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'A forma é if condicao { bloco } — sem parênteses em volta da condição. Escrever (condicao) gera warning de parênteses desnecessários e foge do estilo do Rust. Chaves são sempre obrigatórias, mesmo para bloco de uma linha.',
          'A condição precisa ser bool de verdade. Rust não converte número em lógico como outras linguagens fazem: if numero { } dá erro de tipo, expected bool, found integer. Você precisa comparar — if numero < 5 { }.',
          'Para vários caminhos, encadeie else if. O Rust testa de cima para baixo e executa SÓ o primeiro ramo cuja condição der true, ignorando o resto. O else final é a última opção, executada quando nada bateu.',
          'Detalhe que costuma ser novidade: if é uma expression. Ele produz valor — let numero = if condicao { 5 } else { 6 }; guarda 5. Só que os dois ramos precisam ter o mesmo type: if com 5 de um lado e "seis" do outro é erro de tipos.',
        ],
        codigos: [
          {
            titulo: 'Cadeia de decisões',
            snippet: `fn main() {
    let numero = 3;
    if numero < 5 {                      // condição sem parênteses
        println!("condição verdadeira");
    } else if numero % 2 == 0 {          // testa só se o anterior falhou
        println!("par");
    } else {
        println!("condição falsa");
    }
}`,
          },
          {
            titulo: 'if como expression (o que você fez em w3-l5)',
            snippet: `fn main() {
    let largura = 2;
    // os DOIS ramos devolvem i32 → ok
    let forca = if largura >= 2 { 4 } else { 2 };
    println!("{forca}"); // imprime 4
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'É exatamente o mesmo código. A leitura que muda: em Rust, if é expressão de primeira classe, e isso aparece em todo lugar — você vai ver if usado como valor em funções, em match, em closures. Quem entendeu que if devolve valor entendeu metade da sintaxe do Rust.',
          'A regra do bool estrito existe porque Rust elimina falsy. Não existe 0 sendo falso, nem string vazia sendo falsa. Só true e false, e isso remove uma classe inteira de bugs de leitura.',
        ],
      },
    ],
    pegadinhas: [
      'Condição que não é bool: if numero { } não compila.',
      'Colocar parênteses em volta da condição — warning e estilo errado.',
      'Ramos com types diferentes quando if é usado como valor (E0308).',
      'Esquecer o else final quando existe um caso residual — ele é simplesmente ignorado, sem aviso.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Control Flow',
      url: 'https://doc.rust-lang.org/book/ch03-05-control-flow.html#if-expressions',
    },
    niveis: ['w3-l1', 'w3-l5'],
  },

  {
    slug: 'comparacoes',
    titulo: 'Comparações',
    resumo: 'Dois valores viram um bool — a matéria-prima da decisão.',
    mundo: 3,
    passo: 5,
    oQueVoceFez: 'No segundo nível da floresta você testou energia > 0 antes de agir e descobriu que a comparação devolve true ou false, e é esse resultado que o if consome. Foi a ponte entre medir o mundo e decidir o que fazer com a medida.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Comparação é como o programa pergunta algo sobre a realidade: a largura é pelo menos 2? a energia ainda sobrou? o valor é diferente de zero? Cada pergunta devolve true ou false, e com isso a decisão fica objetiva.',
          'Sem comparação, if não teria o que testar. É por isso que as duas coisas se aprendem juntas: comparação produz o bool, e if consome o bool.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'São seis operadores: == igual, != diferente, < menor, > maior, <= menor ou igual, >= maior ou igual. Todos produzem bool — nunca 1 ou 0. O resultado é um valor como qualquer outro e pode ser guardado numa variável.',
          'Comparar é diferente de atribuir: = sozinho cria ou reatribui valor; == pergunta se são iguais. Escrever if largura = 2 { } é erro — Rust espera uma expression booleana ali, e o = é statement.',
          'Os dois lados precisam ter types que façam sentido juntos. Comparar i32 com f64, ou número com texto, é erro de tipos antes mesmo de o programa rodar.',
        ],
        codigos: [
          {
            titulo: 'Comparação virando decisão',
            snippet: `fn main() {
    let largura = 2;
    let cabe = largura >= 2 && largura <= 3; // cada comparação vira bool
    if largura == 2 {                        // == pergunta se é igual
        println!("cabe: {cabe}");
    } else if largura != 0 {
        println!("diferente de zero");
    }
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'Os operadores são os mesmos e o comportamento é idêntico. Vale notar que bool ocupa 1 byte e só pode ser true ou false — não existe valor intermediário, o que reforça a regra de que if exige bool puro.',
          'Para comparar texto no Rust real é preciso atenção: == funciona para String, mas comparação parcial usa starts_with, contains e métodos parecidos. O jogo simplify: String compara por igualdade direta, e o resto é material para mundos futuros.',
        ],
      },
    ],
    pegadinhas: [
      'Usar = (atribuição) onde queria == na condição.',
      'Escrever if largura { } esperando que número vire condição — compare primeiro (largura > 0).',
      'Esperar que a comparação devolva 1 ou 0 — devolve true ou false.',
      'Comparar types diferentes (i32 contra f64) sem converter antes.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Control Flow',
      url: 'https://doc.rust-lang.org/book/ch03-05-control-flow.html#if-expressions',
    },
    niveis: ['w3-l2'],
  },

  {
    slug: 'operadores-logicos',
    titulo: '&&, || e !',
    resumo: 'Combinar várias perguntas numa só decisão.',
    mundo: 3,
    passo: 5,
    oQueVoceFez: 'Em w3-l3 você juntou duas comparações com && para dizer "entre 2 e 3", e em w3-l4 usou ! para inverter um valor e else if para encadear três possibilidades. Você estava montando condições compostas — o dia a dia de quem escreve regra.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Muita decisão não depende de uma pergunta só. "A largura está entre 2 e 3" são duas perguntas que precisam valer ao mesmo tempo. Operadores lógicos existem para combinar bools num bool maior, e é isso que permite escrever regras do mundo real em uma linha.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          '&& é E lógico: só é true se AS DUAS partes forem true. || é OU lógico: é true se BASTAR uma. ! nega: true vira false e vice-versa. Com esses três você monta qualquer condição.',
          'A avaliação é short-circuit, da esquerda para a direita. Em a && b, se a já é false, b nem é avaliada — não adianta calcular. Em a || b, se a já é true, b é pulada. Isso economiza trabalho e evita efeitos colaterais no lado descartado.',
          'Em cadeias if / else if / else a ordem também importa: o Rust testa de cima para baixo e para no primeiro true. Coloque as condições mais específicas antes das genéricas, senão a primeira engole todos os casos.',
        ],
        codigos: [
          {
            titulo: 'Faixa, negação e alternativa',
            snippet: `fn main() {
    let largura = 2;
    if largura >= 2 && largura <= 3 {     // as DUAS precisam valer
        println!("faixa ok");
    }

    let aprovado = false;
    if !aprovado {                        // inverte: vira true
        println!("bloqueado");
    } else if largura == 2 || largura == 3 { // basta UM
        println!("ou um, ou outro");
    }
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'Nada muda: &&, || e ! são os mesmos, com as mesmas regras de precedência — comparações primeiro, depois &&, depois ||. Se você misturar vários níveis, parênteses deixam a leitura explícita.',
          'O que muda é o alcance. No Rust real você vai combinar isso com métodos e results, mas a lógica booleana é idêntica. E o short-circuit é mais do que otimização: é o que permite escrever algo como texto != "" && texto.starts_with("a") sem medo de erro.',
        ],
      },
    ],
    pegadinhas: [
      'Trocar && com || — leia em voz alta: "e" contra "ou".',
      'Esperar que as duas partes sempre sejam avaliadas: o short-circuit muda isso.',
      'Escrever and / or / not de outras linguagens — aqui é &&, ||, !.',
      'Em else if, colocar a condição mais ampla antes da específica e engolir todos os casos.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Control Flow',
      url: 'https://doc.rust-lang.org/book/ch03-05-control-flow.html#handling-multiple-conditions-with-else-if',
    },
    niveis: ['w3-l3', 'w3-l4'],
  },

  // ── Mundo 4 — Caverna da Repetição ───────────────────────────────────────
  {
    slug: 'loop',
    titulo: 'loop e contagem',
    resumo: 'Repetição infinita que só o break encerra.',
    mundo: 4,
    passo: 5,
    oQueVoceFez: 'No primeiro nível da caverna você repetiu dez passos até a porta. Em vez de escrever mover_direita(1) dez vezes, criou um contador mutável, somou 1 a cada volta e cortou com if + break na meta. Você transformou repetição manual em repetição contada.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Escrever a mesma linha dez vezes funciona até a décima vez. A partir daí você precisa de uma forma de dizer "repita" — e loop é a mais básica delas: ele repete o bloco para sempre, sem perguntar nada, até alguém mandar parar.',
          'A força do loop está justamente na ausência de condição. Quando você não sabe de antemão quantas voltas serão necessárias, loop com uma saída programada é o modelo mais honesto: continua enquanto não bateu o critério.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'A receita é sempre a mesma em três partes: criar um contador com let mut, incrementá-lo dentro do corpo, e testar com if + break quando chegar na meta. Sem mut, o incremento leva E0384; sem incremento, a condição nunca muda e o loop é infinito de verdade.',
          'A ordem dentro do corpo decide onde o programa para. No jogo você aprendeu a contar DEPOIS de andar, para o break cair exatamente na casa certa. Contar antes muda a posição final em uma casa — e uma casa é a diferença entre passar e morrer no espinho.',
          'loop também devolve valor: break pode carregar um resultado para fora, o que mostra que loop é expression, não só controle de fluxo. É o mesmo princípio do if que devolve valor.',
        ],
        codigos: [
          {
            titulo: 'Repetição contada',
            snippet: `fn main() {
    let mut passos = 0;              // 1) contador mutável
    loop {
        passos = passos + 1;         // 2) incrementa a cada volta
        if passos >= 10 {            // 3) chegou na meta?
            break;                   //     corta o laço
        }
    }
    println!("fez {passos} passos");
}`,
          },
          {
            titulo: 'loop devolvendo valor',
            snippet: `fn main() {
    let mut counter = 0;
    let resultado = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2;       // o valor sai junto com o break
        }
    };
    println!("{resultado}");          // imprime 20
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'O código é idêntico num projeto real. A diferença é o que acontece se você esquecer o break: no jogo o interpretador corta com E0900 (limite de passos e comandos); no terminal real é um laço que nunca termina e você precisa de Ctrl+C.',
          'Vale saber que loop é a forma mais crua. Existem formas mais seguras — while e for — que cuidam da condição ou do contador para você. O loop existe para quando a saída depende de algo que só se sabe no meio do caminho.',
        ],
      },
    ],
    pegadinhas: [
      'Esquecer o break: loop infinito (no jogo, E0900; no terminal, Ctrl+C).',
      'Esquecer o mut ou o incremento do contador — a condição nunca avança.',
      'Contar na ordem errada: para uma casa antes ou depois da desejada.',
      'Misturar break; e break valor; num loop usado como expression — os types não fecham.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Control Flow',
      url: 'https://doc.rust-lang.org/book/ch03-05-control-flow.html#repeating-code-with-loop',
    },
    niveis: ['w4-l1'],
  },

  {
    slug: 'while',
    titulo: 'while',
    resumo: 'Repete enquanto a condição for verdadeira.',
    mundo: 4,
    passo: 5,
    oQueVoceFez: 'No segundo nível você escreveu while cont < 8 { mover_direita(1); cont = cont + 1; } — o mesmo padrão de contador, mas sem precisar escrever break manualmente. O laço parou sozinho quando a condição caiu para false.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'O padrão loop + contador + if + break aparece tanto que merece uma forma curta. while é exatamente isso: ele testa a condição antes de cada volta e para sozinho quando ela vira false, sem você escrever o break.',
          'Também é a forma natural de repetir "enquanto" algo for o caso: enquanto houver energia, enquanto não chegou no destino, enquanto a condição do mundo ainda vale.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'A condição segue as mesmas regras do if: precisa ser bool e não leva parênteses. while cont < 8 compara; while cont não compila, porque número não é condição.',
          'O contador precisa ser atualizado DENTRO do corpo. Se cont nunca muda, cont < 8 continua true para sempre — é o bug clássico de loop infinito, e é o erro mais comum de quem está começando.',
          'A comparação acontece antes de cada volta, inclusive da primeira. Se a condição já nascer false, o corpo não executa nem uma vez.',
        ],
        codigos: [
          {
            titulo: 'Contagem regressiva',
            snippet: `fn main() {
    let mut number = 3;
    while number != 0 {          // testa ANTES de cada volta
        println!("{number}!");
        number -= 1;             // avança em direção à saída
    }
    println!("LIFTOFF!!!");      // só depois de false
}`,
          },
          {
            titulo: 'O padrão do w4-l2',
            snippet: `fn main() {
    let mut cont = 0;
    while cont < 8 {
        mover_direita(1);        // anda uma casa
        cont = cont + 1;         // sem isto, loop infinito
    }
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'A sintaxe é a mesma. O alerta do livro é sobre o uso de while com índice manual para percorrer coleções: while index < 5 funciona, mas se o tamanho mudar e você esquecer de ajustar a condição, o programa quebra com index out of bounds. Para percorrer coleções, for é mais seguro — é por isso que o livro prefere for quando o número de voltas é conhecido.',
          'Também vale notar que while devolve (), ou seja, nada. Diferente de loop, que pode devolver valor pelo break, while não tem essa saída.',
        ],
      },
    ],
    pegadinhas: [
      'Não atualizar o contador: a condição nunca vira false e o laço não sai.',
      'Errar o operador (<= quando quer <): uma volta a mais ou a menos.',
      'Esquecer o mut na variável do contador — E0384 no incremento.',
      'Condição que não é bool: E0308.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Control Flow',
      url: 'https://doc.rust-lang.org/book/ch03-05-control-flow.html#streamlining-conditional-loops-with-while',
    },
    niveis: ['w4-l2'],
  },

  {
    slug: 'for',
    titulo: 'for e ranges',
    resumo: 'Repetição contada sem contador escrito à mão.',
    mundo: 4,
    passo: 5,
    oQueVoceFez: 'Em w4-l3 você fez três saltos idênticos com for i in 0..3 em vez de copiar o mesmo comando três vezes. O laço cuidou do contador sozinho — e o detalhe que quase todo mundo erra na primeira vez é que 0..3 dá exatamente 3 voltas, com i valendo 0, 1 e 2.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Contar com variável própria funciona, mas é trabalho manual: você declara, incrementa, testa e ainda pode errar o limite. for existe para tirar esse trabalho de cima — quando o número de voltas é conhecido, o Rust faz a contagem por você.',
          'É a forma preferida do Rust para repetição contada. O livro é direto a respeito: mesmo para um simples countdown, um Rustacean usaria for com range em vez de while manual.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'A forma é for variavel in 0..n. O range 0..n começa em 0 e termina ANTES de n — o fim não entra. Logo, 0..3 produz três voltas com i valendo 0, 1 e 2. Essa meia-exclusão é a mesma da matemática e evita o erro de ficar um passo a mais.',
          'O laço também percorre coleções: for elemento in a visita cada item sem índice manual, o que elimina por completo o risco de estourar o limite.',
          'Se você não precisa do valor de i, escreva for _ in 0..3. O underscore descarta cada valor e evita o warning de variável declarada e não usada.',
        ],
        codigos: [
          {
            titulo: 'Range e direção',
            snippet: `fn main() {
    for i in 0..3 {                 // 3 voltas: i = 0, 1, 2 (3 NÃO entra)
        println!("volta {i}");
    }

    for number in (1..4).rev() {    // range revertido: 3, 2, 1
        println!("{number}!");
    }
}`,
          },
          {
            titulo: 'Percorrendo uma coleção',
            snippet: `fn main() {
    let larguras = [1, 2, 1, 3, 2];
    for largura in larguras {       // visita cada item, sem índice
        println!("{largura}");
    }
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'Sintaxe idêntica. A diferença é o que dá para percorrer: no jogo, só ranges; no Rust real, vetores, strings, iterators e qualquer coisa que implemente Iterator — que é de onde for vem.',
          'Ranges também têm formas que o jogo não usa: ..= para incluir o fim (0..=3 dá 4 voltas), ranges abertos como 2.. e ranges negativos como ..0. Vale conhecer a forma fechada porque ela resolve o erro de "eu queria incluir o último".',
        ],
      },
    ],
    pegadinhas: [
      'Achar que 0..3 inclui o 3 — são 3 voltas com valores 0, 1, 2.',
      'Trocar os lados do range: 3..0 não gera nada, porque o range é crescente.',
      'Usar while manual com índice e errar o limite em coleção.',
      'Declarar i e não usar — warning; troque por _ se for descartar.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Control Flow',
      url: 'https://doc.rust-lang.org/book/ch03-05-control-flow.html#looping-through-a-collection-with-for',
    },
    niveis: ['w4-l3', 'w4-l5'],
  },

  {
    slug: 'break',
    titulo: 'break',
    resumo: 'A alavanca que corta o laço na hora certa.',
    mundo: 4,
    passo: 5,
    oQueVoceFez: 'No quarto nível você precisava parar EXATAMENTE na borda antes do espinho, e não no fim natural do laço. break foi a saída que você programou: o laço continuaria para sempre, mas a condição certa cortava na casa exata — e então pular(2) roda fora do laço.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Nem toda repetição termina por condição prévia. Às vezes você só sabe que deve parar quando acontecer algo no meio do caminho — chegou na borda, achou o alvo, a leitura mudou. break é essa saída: ele corta o laço na hora e devolve o fluxo para o código de depois.',
          'Sem break, loop é infinito por definição, e while depende de uma condição que talvez você só consiga testar depois de executar alguma coisa.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'break só é legal DENTRO de um laço. Fora dele, o compilador responde break outside of loop — e é um erro de compilação, não de runtime.',
          'Em laços aninhados, break atinge o laço mais interno. Para quebrar um externo, você rotula o laço com um nome começando por apóstrofo e referencia o label: break nome_do_laço.',
          'Depois do break, o fluxo continua na linha seguinte ao LAÇO, não à instrução break. É por isso que no jogo você escreveu break; dentro do loop e pular(2); logo depois: a decisão de parar vem de dentro, a ação seguinte vem de fora.',
          'Em loop, break ainda pode devolver valor. E não confunda: continue não sai do laço, só pula para a próxima volta; return sai da função inteira.',
        ],
        codigos: [
          {
            titulo: 'Parar na hora certa',
            snippet: `fn main() {
    let mut passo = 0;
    loop {
        passo += 1;              // conta a volta
        if passo >= 4 {          // chegou na borda?
            break;               // sai do laço AGORA
        }
    }
    println!("parou em {passo}"); // continua DEPOIS do laço
}`,
          },
          {
            titulo: 'Label para laço externo',
            snippet: `fn main() {
    'externo: for i in 0..3 {    // laço com label (começa com ')
        if i == 1 {
            break 'externo;       // quebra o laço rotulado, não só o if
        }
        println!("{i}");
    }
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'Tudo idêntico. A diferença prática é a consequência de esquecer: no jogo, o interpretador te salva com E0900 (limite de comandos e passos); num programa real, um laço sem saída trava o processo.',
          'Labels e break com valor são usados com frequência em código real — em parsers, em loops de leitura e em qualquer lugar onde a saída dependa de um estado que só aparece durante a execução.',
        ],
      },
    ],
    pegadinhas: [
      'Escrever break fora de qualquer laço — não compila.',
      'Esquecer o break em loop — laço infinito.',
      'Esperar que break saia só do if: ele derruba o laço inteiro.',
      'Confundir break com continue (próxima volta) ou return (sai da função).',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Control Flow',
      url: 'https://doc.rust-lang.org/book/ch03-05-control-flow.html#returning-values-from-loops',
    },
    niveis: ['w4-l4'],
  },

  // ── Mundo 5 — Oficina das Funções ────────────────────────────────────────
  {
    slug: 'funcoes',
    titulo: 'fn: suas próprias funções',
    resumo: 'Guardar um plano num nome e reusar quantas vezes quiser.',
    mundo: 5,
    passo: 6,
    oQueVoceFez: 'Na oficina você deixou de usar só as funções do mapa e passou a criar as suas: declarou fn com corpo, deu um nome ao plano e chamou essa função várias vezes. Em w5-l1 três chamadas da mesma função somaram 9 casas — o mesmo plano reaproveitado sem reescrever.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Até aqui você chamava funções prontas. Definir a sua é o salto de quem só usa a ferramenta para quem começa a fabricar: você identifica um padrão que se repete, dá um nome a ele e escreve uma vez só.',
          'É também o ponto onde código deixa de ser linha solta e vira estrutura. Um programa real é uma coleção de funções pequenas com nomes claros — e a qualidade do programa costuma refletir a qualidade desses nomes.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'A forma é fn nome(parametros) { corpo }. A função principal é fn main(), o ponto de entrada do programa. Todos os outros nomes seguem snake_case: tudo minúsculo, palavras separadas por underscore.',
          'A assinatura é o cabeçalho — nome, parênteses com parâmetros e, se houver, o -> type de retorno. O corpo entre chaves é o que executa. Declarar não executa: fn ir() { mover_direita(3); } só guarda o plano; ir(); é o que roda, e pode rodar quantas vezes você quiser.',
          'A ordem das definições no arquivo não importa. Rust enxerga uma função declarada depois da main sem problema nenhum. O que importa é a ordem das chamadas em execução.',
        ],
        codigos: [
          {
            titulo: 'Definir e reaproveitar',
            snippet: `fn ir() {                        // como no w5-l1
    mover_direita(3);            // o plano, escrito uma vez só
}

fn main() {
    ir();                        // 1ª chamada
    ir();                        // 2ª
    ir();                        // 3ª → 9 casas no total
}`,
          },
          {
            titulo: 'A ordem das definições não importa',
            snippet: `fn main() {
    saudacao();                  // funciona mesmo declarada abaixo
}

fn saudacao() {
    println!("Oi!");
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'Exatamente o mesmo. A diferença em relação ao jogo é que mover_direita é fornecida pelo mapa — em Rust, funções vêm de você, da standard library ou de crates. println! tem exclamação porque é macro, não função: macros são avaliadas em tempo de compilação e podem fazer coisas que função não faz.',
          'Um hábito que vale desde já: funções devem fazer uma coisa e ter nome que diga essa coisa. Se o corpo começa a precisar de comentário para ser entendido, provavelmente são duas funções.',
        ],
      },
    ],
    pegadinhas: [
      'Confundir definição com chamada: ir sem os parênteses não executa nada.',
      'Escrever println("oi") — println! é macro e exige o !.',
      'Chamar função inexistente: cannot find function.',
      'Usar camelCase no nome — o padrão do Rust é snake_case.',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Functions',
      url: 'https://doc.rust-lang.org/book/ch03-03-how-functions-work.html',
    },
    niveis: ['w5-l1', 'w5-l5'],
  },

  {
    slug: 'parametros',
    titulo: 'Parâmetros e argumentos',
    resumo: 'O lugar na receita e o valor na chamada — na ordem certa.',
    mundo: 5,
    passo: 6,
    oQueVoceFez: 'Em w5-l2 e w5-l3 você criou funções que recebem informação: primeiro uma com um parâmetro, depois duas. A função passou a ser genérica — andar quantas casas e saltar qual força, em vez de uma função fixa para cada caso.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Uma função sem parâmetro faz sempre a mesmo coisa. Com parâmetro, ela vira um plano reutilizável para casos parecidos: em vez de escrever andar_ate_a_porta e andar_ate_o_poço, você escreve uma função andar(n) e passa o valor.',
          'É o que permite que uma função pequena resolva muitos problemas — e é a razão de o parâmetro tipado existir: o compilador sabe exatamente o que aceita e o que recusa.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'Existe uma diferença de vocabulário que vale decorar: na definição as caixinhas são parameters (fn caminhar(n: i32)), e na chamada os valores concretos são arguments (caminhar(4)). Na conversa do dia a dia as palavras se misturam, mas tecnicamente são coisas diferentes.',
          'O type de cada parameter é OBRIGATÓRIO: fn caminhar(n) não compila. Essa é decisão de design do Rust — como a assinatura sempre declara os types, o compilador consegue erros melhores e raramente pede anotação em outros pontos.',
          'Vários parameters se separam por vírgula e os arguments entram na MESMA ordem. A chamada também precisa ter o número exato de arguments — nem mais, nem menos.',
        ],
        codigos: [
          {
            titulo: 'Dois parâmetros, na ordem',
            snippet: `fn trecho(n: i32, f: i32) {     // como no w5-l3
    println!("anda {n}, salta {f}");
}

fn main() {
    trecho(2, 5);               // n = 2, f = 5
    // trecho(2);               // ERRO: faltou um argumento
    // trecho(2, 5, 1);         // ERRO: sobrou um argumento
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'Idêntico. O que amplia é o que pode ser passado: no Rust real você passa references (&str, &Vec), ownership (String), Option e Result. O jogo para em i32, f64, bool e String — o suficiente para ensinar a mecânica sem a complexidade.',
          'Vale notar que no Rust não existem argumentos default. Se a sua função quiser um valor de fábrica, o padrão é criar uma segunda função sem aquele parâmetro que chama a completa — é mais verboso, mas deixa a assinatura explícita.',
        ],
      },
    ],
    pegadinhas: [
      'Esquecer o type do parameter: fn f(x) não compila.',
      'Trocar a ordem de dois arguments do mesmo type: compila, mas a lógica quebra em silêncio.',
      'Passar número errado de arguments, faltando ou sobrando.',
      'Passar argumento de type errado (2.0 para i32).',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Functions',
      url: 'https://doc.rust-lang.org/book/ch03-03-how-functions-work.html#parameters',
    },
    niveis: ['w5-l2', 'w5-l3'],
  },

  {
    slug: 'retorno',
    titulo: 'Retorno com -> i32',
    resumo: 'O valor da última linha, sem ;, é o que sai da função.',
    mundo: 5,
    passo: 6,
    oQueVoceFez: 'Em w5-l4 você escreveu uma função que devolve um número e usou esse número como argumento de outra chamada. O truque que tornou aquilo possível: a última linha do corpo não tinha ponto-e-vírgula. Com ; a função devolveria nada e o código não fecharia.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Função que só faz algo é útil, mas função que devolve resultado é o que permite encadear operações. Sem retorno, você não calcularia o dobro de um número dentro de outra chamada — teria que fazer tudo em etapas separadas, com variáveis intermediárias.',
          'Retorno é o que transforma função em bloco de construção: uma recebe, processa e entrega; outra consome o que foi entregue.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'O contrato vai na assinatura: fn five() -> i32 { ... }. Não se nomeia o retorno — ele é a última expression do corpo, escrita SEM ;. Esse é o return implícito, e é o padrão do Rust.',
          'Colocar ; na última linha transforma aquilo em statement, que devolve (), e o compilador acusa com E0308: expected i32, found (). A mensagem até sugere remover o ponto-e-vírgula. Esse foi literalmente o erro do exemplo do livro em plus_one.',
          'return valor; existe e serve para sair cedo — por exemplo, validar a entrada e abortar antes de chegar ao fim. No último linha do corpo ele é redundante, e o estilo Rust prefere a expression implícita.',
          'Sem ->, a função não devolve nada, e o resultado não pode ser guardado em let. Mas ele ainda pode ser usado direto dentro de outra chamada: mover_direita(dobro(3)); é composição de chamadas.',
        ],
        codigos: [
          {
            titulo: 'Return implícito',
            snippet: `fn five() -> i32 {
    5                        // última expression SEM ; → devolve 5
}

fn plus_one(x: i32) -> i32 {
    x + 1                    // sem ; → devolve x + 1
    // x + 1;               // ERRO E0308: ; mata o retorno e vira ()
}

fn main() {
    let x = five();          // 5
    let y = plus_one(x);     // 6
    println!("{y}");
}`,
          },
          {
            titulo: 'Encadeando retorno (w5-l5)',
            snippet: `fn dobro(x: i32) -> i32 {
    x * 2                    // devolve sem ;
}

fn main() {
    mover_direita(dobro(3)); // o valor de dobro vira argumento
}

fn mover_direita(n: i32) {
    println!("anda {n}");
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'Sintaxe idêntica, e o return implícito é o estilo que todo código Rust real segue. Escrever return na última linha funciona, mas soa redundante para quem lê — é o tipo de coisa que separa código escrito por quem aprendeu Rust de código traduzido de outra linguagem.',
          'No Rust real o -> também aparece com tipos que representam sucesso ou falha, como Result<T, E>. É o assunto do capítulo 9 do livro, que o jogo ainda não cobre — hoje o interpretador mostra o erro diretamente, sem Result.',
        ],
      },
    ],
    pegadinhas: [
      'Pôr ; na última expression do corpo: E0308, found ().',
      'Esquecer o -> i32 na assinatura — a função não declara que devolve algo.',
      'Usar return no fim quando a última expression já faria — funciona, mas é antipadrão.',
      'Tentar guardar em let o retorno de função sem -> (não devolve valor).',
    ],
    livro: {
      capitulo: 'Capítulo 3 — Functions',
      url: 'https://doc.rust-lang.org/book/ch03-03-how-functions-work.html#functions-with-return-values',
    },
    niveis: ['w5-l4'],
  },

  // ── Mundo 6 — Ruínas da Posse ────────────────────────────────────────────
  {
    slug: 'string',
    titulo: 'String: texto no Rust',
    resumo: 'Texto que o programa é dono e que pode crescer.',
    mundo: 6,
    passo: 10,
    oQueVoceFez: 'Em w6-l1 você criou um texto com let msg = "..." e mandou o herói falar. Foi a primeira vez que um valor não-numérico entrou no seu programa — e a primeira vez que a posse desse valor importava, porque falar(msg) entrega o texto de verdade.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Números são fixos: i32 sempre ocupa 32 bits. Texto não — "oi" tem 2 caracteres, "boletim da ruína" tem 17. O stack só aceita dados de tamanho fixo e conhecido em tempo de compilação, então texto precisa de espaço no heap, alocado na hora de rodar.',
          'String é o tipo que resolve isso. Ela aloca no heap, guarda os bytes do texto e expõe no stack apenas três campos pequenos: um pointer para o heap, o len (bytes usados) e o capacity (bytes alocados). Quando a String sai do escopo, o Rust chama drop e devolve a memória sozinho — nem garbage collector, nem free manual.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'Existem dois tipos de texto e a distinção importa. O string literal, escrito entre aspas, fica embutido no binário, é fixo e imutável — no Rust real ele tem tipo &str. Já o String guarda texto em tempo de execução e pode crescer.',
          'Para criar: String::from("texto") ou "texto".to_string(), que fazem a mesma coisa e é questão de estilo. String::new() cria um vazio. Literal puro não é String — let s: String = "olá"; não compila, é preciso converter.',
          'Crescer exige mut: let mut saudacao = String::from("olá"); saudacao.push_str(", mundo");. O push_str anexa um &str no final sem tomar a posse de nada.',
          'Sobre UTF-8: cada caractere pode ocupar de 1 a 4 bytes. Isso tem consequência prática — len() conta BYTES, não letras, e cortar o texto no meio de um caractere quebra o programa.',
        ],
        codigos: [
          {
            titulo: 'Criando e crescendo texto',
            snippet: `fn main() {
    let literal: &str = "Porta aberta!";    // fixo, no binário, imutável
    let mut msg = String::from(literal);    // String: dona do buffer no heap
    let outra = "Ruína".to_string();        // atalho idêntico a from()
    msg.push_str(" Abrindo...");            // anexa sem tomar posse
    msg.push('!');                          // anexa UM char
    println!("{msg} {outra}");
}`,
          },
          {
            titulo: 'O que um String guarda',
            snippet: `fn main() {
    let texto = String::from("boletim");
    // stack: ptr, len, capacity (3 campos pequenos)
    // heap:  os bytes "boletim"
    println!("len = {}, cap = {}", texto.len(), texto.capacity());
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'No jogo o interpretador trata literal como String para você não precisar decorar &str ainda, e falar(msg) aceita o valor direto. Lá fora, a assinatura real de uma função que só lê texto é &str — e passar &msg mantém a variável original viva.',
          'Um detalhe que enganou muita gente: String é um wrapper sobre Vec<u8>, uma coleção de bytes no heap com métodos de texto por cima. indexar com s[0] não existe no Rust (error E0277), e fatiar com &s[0..4] corta por BYTES — se o cair no meio de um caractere multibyte, o programa panica.',
          'Para ler texto de verdade, use chars() para valores Unicode ou bytes() para bytes. O livro recomenda sempre ser explícito sobre se você quer caracteres ou números.',
        ],
      },
    ],
    pegadinhas: [
      'Tratar literal como String mutável: let s = "oi"; s.push_str("!"); não compila.',
      'Esquecer o mut: a binding continua imutável mesmo sendo String.',
      'Cortar texto no meio de um caractere — "Olá" tem 4 bytes, e &s[0..3] quebra.',
      'Achar que len() conta letras: "Olá".len() é 4, não 3.',
    ],
    livro: {
      capitulo: 'Capítulo 8 — Storing UTF-8 Encoded Text with Strings',
      url: 'https://doc.rust-lang.org/book/ch08-02-strings.html',
    },
    niveis: ['w6-l1'],
  },

  {
    slug: 'move',
    titulo: 'move: a posse se transfere',
    resumo: 'Entregar um valor invalida quem o entregou — e o E0382 te avisa.',
    mundo: 6,
    passo: 10,
    oQueVoceFez: 'Em w6-l2 o nível veio propositalmente quebrado: falar(senha); duas vezes gerava E0382. Você descobriu que passar um String por valor para uma função MOVE a posse — a variável original fica indisponível. Foi o momento em que o jogo parou de ser sobre sintaxe e passou a ser sobre regra.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Ownership existe para gerenciar memória sem garbage collector e sem free manual. O livro enuncia três regras que valem para o Rust inteiro: cada valor tem um owner; só pode haver um owner por vez; quando o owner sai do escopo, o valor é dropped.',
          'A regra do "um owner por vez" parece arbitrária até você ver o problema que ela resolve. Se dois owners apontassem para o mesmo buffer do heap, os dois droppariam no fim do escopo: double free, memória corrompida, falha de segurança. move é o mecanismo que impede isso em tempo de compilação.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'Acontece em let b = a; com String. Só o stack é copiado (pointer, len, capacity) — o buffer do heap NÃO é copiado, porque poderia ser enorme. Para dois pointers não apontarem para o mesmo heap, o Rust invalida a variável original. Isso não é cópia: é move. a foi movida para b, e a morreu.',
          'Passar String para função faz exatamente o mesmo. No jogo, falar(mensagem: String) recebe a posse de msg na chamada; quando a função termina, o parâmetro sai do escopo e o drop libera o heap. Por isso a segunda falar(senha); quebra.',
          'O compilador reporta E0382, borrow of moved value. O erro existe para te proteger de usar dado que já foi entregue e de liberar memória duas vezes. Ele aponta a linha do move e até sugere clone() como alternativa.',
          'Diferente dos tipos só de stack. i32, bool, f64 e char implementam Copy: na atribuição são simplesmente copiados e a variável original segue válida. String não é Copy — ela tem Drop — então ela move.',
        ],
        codigos: [
          {
            titulo: 'O move que derruba o nível',
            snippet: `fn main() {
    let senha = String::from("pedra-verde");
    let copiada = senha;            // move: a posse vai para copiada
    // println!("{senha}");         // descomente → ERRO E0382
    println!("{copiada}");           // só copiada é a dona agora
}`,
          },
          {
            titulo: 'Move na ida e na volta',
            snippet: `fn pega_txt(t: String) -> String {   // entrada: move para o parâmetro
    t                                 // saída: devolve a posse
}

fn main() {
    let s = String::from("yours");
    let s = pega_txt(s);             // move na ida e na volta → ok
    println!("{s}");                  // um owner sempre
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'É exatamente esse o comportamento do compilador real. O E0382 aparece com uma mensagem longa e bem explicada — e depois que você entende a regra, ela se lê em segundos.',
          'Move não acontece só em chamada: em atribuição, em retorno de função, em reatribuição (s = String::from("novo") droppa o valor antigo na hora) e em struct update syntax. A pergunta prática é sempre: esse valor tem heap? então provavelmente é move.',
          'O jogo deliberadamente NÃO oferece clone(). Se existisse, todo E0382 viraria "clona e segue a vida" e a lição morreria. No Rust real, clone() é a saída legítima para quando você realmente quer dois owners independentes — e o livro avisa que ele é caro: o custo é proporcional ao tamanho do dado.',
        ],
      },
    ],
    pegadinhas: [
      'Achar que let b = a; copia como em outras linguagens — com String é move e a deixa de ser usável.',
      'Usar a variável depois de passar por valor: falar(msg); println!("{msg}"); dá E0382.',
      'Consertar só a SEGUNDA chamada com & — se a primeira já moveu, o E0382 continua.',
      'Aceitar o clone() que o compilador sugere sem pensar — vira cópia profunda escondida.',
    ],
    livro: {
      capitulo: 'Capítulo 4 — What Is Ownership?',
      url: 'https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html#ownership-rules',
    },
    niveis: ['w6-l2', 'w6-l4'],
  },

  {
    slug: 'emprestimo',
    titulo: 'Borrowing com &',
    resumo: 'Ler sem ser dono — msg continua viva e pode falar de novo.',
    mundo: 6,
    passo: 10,
    oQueVoceFez: 'Em w6-l3 você trocou falar(msg) por falar(&msg) e o texto sobreviveu às duas chamadas. O & criou um empréstimo: a função só leu, não ficou com a posse, e nada foi dropado. Foi a solução para o E0382 que você tinha batido no nível anterior.',
    secoes: [
      {
        titulo: 'Por que isso existe',
        paragrafos: [
          'Se tudo que é passado move, ficaria impossível usar um valor duas vezes — e usar duas vezes é o caso normal. Borrowing resolve isso: você empresta o valor para quem só precisa ler, sem entregar a posse.',
          'A analogia do dia a dia funciona direto: dono de algo pode emprestar; quem empresta nunca foi dono, e quando acaba devolve. Enquanto o empréstimo estiver em aberto, o dono continua dono.',
        ],
      },
      {
        titulo: 'Como funciona',
        paragrafos: [
          'O & cria uma reference: um endereço para dados owned por outra variável. É como um pointer, mas com a garantia de que aponta para valor válido enquanto a reference existir.',
          'Como a reference não owna o dado, o dado NÃO é dropado quando ela sai de escopo. É por isso que falar(&msg) atravessa a chamada: dentro da função o parâmetro só olha o texto; ao terminar, o drop roda só no parâmetro, e msg continua dona e viva.',
          'References são immutable por default — assim como variáveis. Tentar modificar através de & exige &mut. E valem duas regras: em qualquer momento você pode ter OU uma &mut OU quantas & imutáveis quiser, nunca as duas ao mesmo tempo no mesmo dado; e toda reference precisa sempre ser válida.',
          'A regra prática cabe numa linha, e é a que a cheat sheet do jogo resume: vai usar de novo? passe &msg.',
        ],
        codigos: [
          {
            titulo: 'Empréstimo que atravessa a chamada',
            snippet: `fn falar(mensagem: &str) {        // assinatura com & → nada move
    println!("{mensagem}");
}

fn main() {
    let msg = String::from("Segredo da ruína");
    falar(&msg);                  // empréstimo 1: msg continua dona
    falar(&msg);                  // empréstimo 2: quantas vezes quiser
    println!("ainda tenho: {msg}"); // msg segue viva e válida
}`,
          },
          {
            titulo: 'Muitos & ou um &mut',
            snippet: `fn main() {
    let mut s = String::from("hello");
    let r1 = &s;                  // leitura: pode ter vários
    let r2 = &s;                  // segundo & imutável: ok
    println!("{r1} {r2}");
    let r3 = &mut s;              // agora: um &mut só, e só um
    println!("{r3}");
}`,
          },
        ],
      },
      {
        titulo: 'No Rust de verdade',
        paragrafos: [
          'É o borrow checker que aplica essas regras em tempo de compilação. Ele é a razão de Rust ser considerado seguro sem garbage collector: data races, use-after-free e double free viram erro de compilação antes de o programa rodar.',
          'No jogo, falar(&msg) funciona mesmo com a assinatura declarando String — o interpretador aceita por coerção. No Rust real a assinatura correta é &str ou &String; escrever falar(&msg) com param String dá E0308.',
          'O jogo também ainda não simula E0499 (duas &mut), E0502 (misturar & e &mut) nem lifetimes — `docs/erros.md` marca borrow checker completo como fora de escopo. O Mundo 6 cobre a base: move, empréstimo e E0382. Lifetimes e conflitos de empréstimo vêm no capítulo 10 do livro.',
          'Existe ainda uma armadilha que o jogo testa em w6-l4: se a função foi declarada para receber String, passar &msg mantém msg viva. Em Rust real você corrigiria a assinatura — mas a lição é a mesma: empréstimo atravessa a chamada.',
        ],
      },
    ],
    pegadinhas: [
      'Colocar & só na segunda chamada: se a primeira já moveu, E0382 permanece.',
      'Tentar modificar através de & — exige &mut, e só um &mut de cada vez.',
      'Misturar & e &mut no mesmo dado ao mesmo tempo (E0502) ou ter dois &mut (E0499).',
      'Devolver reference para variável local da função: ela morre junto com o escopo.',
    ],
    livro: {
      capitulo: 'Capítulo 4 — References and Borrowing',
      url: 'https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html',
    },
    niveis: ['w6-l3', 'w6-l5'],
  },
]
