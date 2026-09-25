# 🦀 Rust Quest 2D

Plataforma gamificada de ensino de Rust para iniciantes: um jogo de
plataforma 2D **vertical** onde você **escreve código Rust do zero** num
console e o boneco pixel-art executa os comandos gerados pelo seu código.

> Escopo atual: **MVP com pedagogia** — Mundos 1 e 2 (10 níveis), cada nível
> com card *"O que você vai aprender"*, dicas progressivas por nível e
> resumo *"Você aprendeu"* na vitória; mapas multi-plataforma com pulo em
> arco, queda, câmera que segue o personagem, NPCs animados e backend
> JWT + MongoDB Atlas.

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
  checker → executor, usado **tanto pelo navegador quanto pelo servidor**
- **Vitest** — 102 testes (interpretador, simulador vertical, níveis)

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
tests/         Vitest (102 testes)
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

Sem o `NUXT_MONGODB_URI` o jogo continua **jogável offline** (progresso
local), mas auth/progresso respondem `503` rápido — nada trava.

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm test` | 102 testes (interpretador, simulador, níveis) |
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
```

### Mapa ASCII (multi-linha, vertical)

`P` início · `#` chão · `^` espinho · `o` moeda (coleta automática) ·
`G` objetivo · `V`/`E` NPCs decorativos · **célula sem `#` embaixo = vão**.

Regras do pulo: arco `h(k)=min(k, f−k)` (pico `⌊f/2⌋`); pule na borda;
queda não mata (só o fundo do mapa ou espinho); entrar em `G` com chão em
qualquer altura vence. Vitória é decidida **sempre** pelo simulador
(`shared/game/simulator.ts`), nunca pela animação.

## Roadmap (do plano de produto)

- **MVP atual (feito)**: Mundo 1–2 completos com pedagogia, plataforma
  vertical, pixel-art, auth + progresso no Atlas.
- **Próxima fase**: Mundos 3–6 (`if`/loops/funções/ownership básico).
- **Depois**: Mundos 7–12, avaliar sandbox real para borrow checker.
- **Polimento**: som, tutorial guiado, onboarding.
