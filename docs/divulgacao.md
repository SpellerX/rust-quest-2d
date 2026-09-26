# Divulgação do Rust Quest 2D

Roteiro pronto para copiar e colar. URLs canônicas:
`https://rust-quest-2d-one.vercel.app` · repo: `https://github.com/SpellerX/rust-quest-2d`

## 1. Google Search Console (prioridade máxima)

1. Acesse <https://search.google.com/search-console> → **Adicionar propriedade** →
   domínio `rust-quest-2d-one.vercel.app` (método "Prefixo de URL" é mais rápido).
2. Escolha **Tag HTML**: a Google te dá um `<meta name="google-site-verification" …>`.
   Me envie o código que eu adiciono no `nuxt.config.ts` (ou cole em
   `app/app.vue` → `useHead`) e fazemos push.
3. Depois da verificação: **Sitemaps** → enviar `sitemap.xml`.
4. **Solicitar indexação** da home e de 2–3 níveis na aba "Inspeção de URL".
5. Repetir o passo 2–4 no <https://www.bing.com/webmasters> (o Bing também alimenta
   DuckDuckGo e o Copilot).

## 2. Temas (topics) do repositório no GitHub

Em <https://github.com/SpellerX/rust-quest-2d> → **About → Topics**, colar:

```
rust
learn-rust
rust-lang
tutorial
education
educational-game
game
nuxt
vuejs
typescript
phaser
pt-br
```

Isso dá tráfego direto do GitHub e melhora o ranqueamento do README no Google.

## 3. Show HN (Hacker News)

**Título:** `Show HN: Rust Quest 2D – aprenda Rust escrevendo código num jogo de plataforma (grátis)`

```
Oi! Criei um jogo de plataforma 2D onde você escreve código Rust de verdade
num console e o boneco executa seus comandos.

São 30 níveis em 6 mundos, cobrindo do `let` até ownership (move/`&`,
erro E0382), seguindo a progressão do livro oficial. Os 3 primeiros
níveis são jogáveis sem cadastro, tudo roda no navegador (sem instalar
o Rust) e os erros aparecem em português.

Interessante tecnicamente: escrevi um interpretador de Rust em
TypeScript (lexer → parser → checker → executor) compartilhado entre
navegar e servidor — o mesmo código que valida sua resposta no browser
roda de novo no backend antes de salvar o progresso.

Ao vivo: https://rust-quest-2d-one.vercel.app
Código: https://github.com/SpellerX/rust-quest-2d
```

Obs.: o HN prefere inglês; se quiser máximo alcance, traduza (posso traduzir
por você).

## 4. dev.to / Medium (artigo em inglês)

**Título:** *I built a free browser game that teaches Rust, from `let` to ownership*

Pontos do artigo (escrevo o texto completo se quiser):
1. Problema: aprender Rust sozinho trava em ownership/borrow checker.
2. Ideia: erro do compilador vira mecânica de jogo (E0382 = personagem
   não pode usar a variável depois de mover).
3. Arquitetura: interpretador TS compartilhado client/server; simulador
   determinístico decide a vitória, Phaser só anima.
4. Pedagogia: dicas em cascata custam estrelas; card "o que você vai
   aprender" antes; resumo "você aprendeu" depois.
5. Link + convite para issues/PRs (Mundos 7–12 no roadmap).

## 5. Reddit

**r/learnprogramming** (inglês):
> **Title:** I made a free platformer where you learn Rust by writing real code
> **Body:** 30 levels, browser-based, no install. You write `let`, loops,
> functions and eventually ownership in a console, and the character executes
> it. First 3 levels are playable without signup. Source is open: <repo>

**r/rust** (inglês) — mais exigente, destaque o interpretador próprio e
peça feedback técnico honesto.

**r/brdev** e **r/programmingBR** (português):
> Fiz um jogo grátis pra aprender Rust no navegador — 30 níveis do `let`
> ao ownership, erros em português, sem instalar nada. Os 3 primeiros
> níveis são sem cadastro: <link>. Código aberto, feedback é bem-vindo.

## 6. Redes sociais (PT-BR)

**X/Bluesky/LinkedIn:**
> 🦀 Aprenda Rust jogando: escreva `let`, laços e ownership num console e
> veja o boneco executar. 30 níveis grátis, em português, sem instalar nada.
> Os 3 primeiros níveis são sem cadastro 👉 https://rust-quest-2d-one.vercel.app

**Grupos de WhatsApp/Telegram de programação:** mesma mensagem + "qual
mundo/conceito vocês querem ver nos Mundos 7–12?"

## 7. itch.io (tráfego de longo prazo para jogos)

1. Conta + upload como **browser game** (já roda com URL).
2. Tags: educational, pixel-art, programming, learning, free.
3. Descrição com as palavras-chave "learn rust", "coding game".

## 8. O que observar depois

- Search Console → "Desempenho": quais consultas trazem gente.
- Páginas que subem primeiro costumam ser as de nível (conteúdo único);
  reforçar com links internos (já há rodapé com os 3 níveis livres).
- Meta honesta: ranquear para *"aprender rust"*, *"rust para iniciantes"*,
  *"tutorial rust português"* — o termo puro "rust" é intocável de início.
