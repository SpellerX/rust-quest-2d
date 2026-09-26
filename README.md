# 🦀 Rust Quest 2D

Plataforma gamificada de ensino de Rust para iniciantes: um jogo de
plataforma 2D **vertical** onde você **escreve código Rust do zero** num
console e o boneco pixel-art executa os comandos gerados pelo seu código.

> Escopo atual: **Mundos 1–6 (30 níveis)** com pedagogia completa —
> card *"O que você vai aprender"*, dicas progressivas por nível e
> resumo *"Você aprendeu"* na vitória; mapas multi-plataforma com pulo em
> arco, queda, câmera que segue o personagem, NPCs animados e backend
> JWT + MongoDB Atlas. O interpretador cobre do `let` básico até
> ownership: `if`/`else`, `loop`/`while`/`for`, `fn` com retorno e
> `String` com move/empréstimo (`&`) — seguindo a progressão do livro
> oficial *The Rust Programming Language*.

## O que diferencia

- **O jogador escreve TODO o código** — os níveis começam só com comentários-
  guia (testes garantem que nenhum starter tem código executável).
- **Pedagogia completa por nível**: conceito antes, dicas em cascata
  (dica 1 → dica 2 → exemplo, cada uma custa 1 estrela) e resumo do
  aprendizado na vitória.
- **Plataforma vertical de verdade**: simulador com arco de pulo
  (`h(k)=min(k, f−k)`), queda entre plataformas, subida de degraus e
  morte só no fundo do mapa/espinho — cliente e servidor rodam o MESMO
  simulador (a animação é só replay).
- **Personagens pixel-art gerados em código** (sem assets externos):
  herói com idle/correr/pular/cair/morrer + vigia e engenheiro animados.

## Stack

- **Nuxt 4** (Vue 3) + Nitro — front e API no mesmo projeto
- **Phaser 4** — renderização 2D com câmera e parallax (só client)
- **CodeMirror 6** — editor de código com highlight de Rust
- **MongoDB Atlas + Mongoose** — usuários, progresso e histórico
- **Interpretador TypeScript próprio** em `shared/` — lexer → parser →
  checker → executor, usado **tanto pelo navegador quanto pelo servidor**;
  subconjunto do Rust com `if`/`else`, laços, `fn` do jogador e
  ownership de `String` (move/`&`, erro E0382)
- **Vitest** — 318 testes (interpretador, simulador vertical, níveis)

## Interface e Design System

Para manter a identidade visual e os padrões de interação ao adicionar novas telas e componentes, consulte o [guia do Design System](docs/design-system.md).

## Arquitetura em uma frase

O jogador envia **código** (nunca comandos prontos); cliente e servidor
rodam o **mesmo interpretador + simulador determinístico** sobre o mesmo
mapa ASCII — Phaser anima o trace (`{x, y, k: walk|jump|fall}`) que o
simulador já validou.

```
app/           páginas, componentes (GameCanvas, CodeConsole…), stores Pinia
app/components/game/textures.ts   pixel-art procedural do herói e NPCs
shared/        interpretador, simulador vertical, níveis  ← client e server
server/        rotas Nitro (auth, levels, progress, attempts), models
tests/         Vitest (318 testes)
```

## Como rodar

```powershell
cd rust-quest-2d
npm install
npm run dev        # http://localhost:3000
```

### Configuração (`.env`)

Copie `.env.example` para `.env`:

```
NUXT_JWT_SECRET=<segredo de 32+ caracteres>
NUXT_MONGODB_URI=<connection string do Atlas, com /rustquest antes do ?>
```

O acesso ao mapa e aos níveis exige uma conta autenticada, e o progresso é
salvo no MongoDB. Sem `NUXT_MONGODB_URI`, cadastro, login e sincronização de
progresso não estarão disponíveis (as rotas retornam `503`). A execução do
código acontece no navegador, mas o produto **não oferece um modo offline
completo**.

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm test` | 318 testes (interpretador, simulador, níveis) |
| `npm run typecheck` | TypeScript estrito (vue-tsc) |

## Conceito do jogo (MVP)

1. Card **"O que você vai aprender"** explica o conceito do nível.
2. O console começa **só com comentários-guia** — você escreve `let`,
   as chamadas e a estrutura inteira.
3. **▶ Executar** → interpretador valida → simulador decide → boneco anima
   (idle/correr/saltar/cair) com câmera seguindo.
4. Erros em português amigável (`E0412` → "Você criou ela com `let`?").
5. Dicas em cascata (dica 1 → 2 → exemplo), cada uma −1★.
6. Vitória com **"Você aprendeu"** (resumo do conceito) + estrelas/XP.

### API de jogo (único "runtime" que o código do jogador pode chamar)

```rust
mover_direita(passos);   // i32
mover_esquerda(passos);  // i32
pular(forca);            // i32, opcional (default 1) — cobre vão de f casas, sobe 1 degrau com f ≥ 2
esperar(segundos);       // f64
falar(mensagem);         // String — o herói "fala" (pausa a animação)
```

### Linguagem (subconjunto do Rust, na ordem dos mundos)

Mundos 1–2: `let`/`let mut`, tipos `i32`/`f64`/`bool`, operadores ·
Mundo 3: `if`/`else`, comparações, `&&`/`||`/`!` ·
Mundo 4: `loop`/`while`/`for i in 0..n`, `break`/`continue` ·
Mundo 5: `fn` do jogador com parâmetros e retorno (`-> i32`, return
implícito) · Mundo 6: `String`, posse por valor (move → E0382) e
empréstimo `&`.

### Mapa ASCII (multi-linha, vertical)

`P` início · `#` chão · `^` espinho · `o` moeda (coleta automática) ·
`G` objetivo · `V`/`E` NPCs decorativos · **célula sem `#` embaixo = vão**.

Regras do pulo: arco `h(k)=min(k, f−k)` (pico `⌊f/2⌋`); pule na borda;
queda não mata (só o fundo do mapa ou espinho); entrar em `G` com chão em
qualquer altura vence. Vitória é decidida **sempre** pelo simulador
(`shared/game/simulator.ts`), nunca pela animação.

## Roadmap (do plano de produto)

- **Feito**: Mundos 1–6 completos com pedagogia (30 níveis), plataforma
  vertical, pixel-art, auth + progresso no Atlas, interpretador com
  if/laços/fn/ownership básico.
- **Próxima fase**: Mundos 7–12 (structs/enums, coleções, erros,
  traits/generics).
- **Depois**: avaliar sandbox real para borrow checker completo.
- **Polimento**: som, tutorial guiado, onboarding.
