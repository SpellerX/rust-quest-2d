# Design System — Rust Quest 2D

Este documento mantém a linguagem visual consistente conforme o produto cresce. A implementação dos tokens globais fica em `app/assets/css/main.css`; prefira esses tokens e os componentes existentes antes de criar estilos novos.

## Direção do produto

Rust Quest é uma aventura pixel-art que ensina programação. A interface deve parecer parte do jogo e, ao mesmo tempo, manter o código e as instruções fáceis de ler. O mapa, os personagens e a execução são a identidade; não transforme as páginas em um dashboard administrativo ou em um curso com cartões decorativos.

- Use a atmosfera de floresta noturna, metal e cobre, com dourado para recompensas e verde para progresso.
- Deixe o pixel-art nos personagens, mapas e pequenos detalhes de marca. Não use a fonte pixel em parágrafos ou instruções longas.
- Mantenha o editor como ferramenta principal da fase. A cena Phaser mostra o efeito do programa e não substitui o feedback textual.
- Prefira superfícies planas e organizadas. Use painéis para ferramentas ou grupos relacionados; não coloque cartões dentro de cartões.
- Preserve a linguagem narrativa dos mundos, mas mantenha controles e mensagens de estado literais e fáceis de entender.

## Tokens

Os valores abaixo espelham `:root` em `app/assets/css/main.css`. Ao mudar a identidade visual, atualize os tokens centrais em vez de introduzir cores avulsas nos componentes.

| Token | Valor atual | Uso |
|---|---|---|
| `--bg` | `#0d1514` | Fundo principal |
| `--bg-panel` | `#15201e` | Painéis e alertas |
| `--bg-elevated` | `#202d29` | Botões e controles elevados |
| `--border` | `#34433d` | Bordas padrão |
| `--border-bright` | `#53665b` | Hover e contornos de maior ênfase |
| `--text` | `#f3f3e9` | Texto principal |
| `--text-dim` | `#b7c2b6` | Texto secundário; deve continuar legível |
| `--accent` | `#ef8050` | Ação principal e cobre |
| `--accent-deep` | `#c95636` | Variação escura da ação principal |
| `--accent-2` | `#f1c49a` | Destaques quentes e narrativa |
| `--gold` | `#f0c96d` | Estrelas, avisos e foco visível |
| `--green` | `#78d6a0` | Sucesso e progresso concluído |
| `--red` | `#ff7a7a` | Erros e ações destrutivas |
| `--blue` | `#77d4df` | Links e informação |

Use `--space-1` a `--space-8` para uma escala de 4, 8, 12, 16, 24 e 32 px. `--radius` é 8 px. Reserve formas totalmente arredondadas para indicadores pequenos; não use pílulas como padrão para botões e cartões.

As sombras padrão são `--shadow-panel` e `--glow`. Use brilho com moderação: ele indica uma ação ou recompensa importante, não deve contornar todos os elementos.

## Tipografia e iconografia

- Interface e leitura: `var(--font-body)` (Inter, com fallbacks locais).
- Código, números técnicos e referências: `var(--font-mono)`.
- Marca pixel: `var(--font-pixel)` apenas em rótulos curtos e decorativos.
- Use tamanhos legíveis e hierarquia por peso, espaçamento e posição. Não use texto pixel para conteúdo pedagógico.
- Ícones, emojis e símbolos não devem ser a única forma de comunicar uma ação ou estado. Acompanhe-os de texto ou de um nome acessível; marque como decorativo quando o texto já comunicar o significado (`aria-hidden="true"`).

## Componentes e estados

Reutilize `.btn`, `.panel` e `.inline-alert` de `main.css` e o componente `InlineAlert.vue`. Estilos específicos devem compor esses padrões em vez de redefinir o mesmo controle em cada página.

| Padrão | Regra |
|---|---|
| Ação primária | `.btn.btn-primary`; uma ação principal por região |
| Ação secundária | `.btn`; mantenha verbo e rótulo explícitos |
| Campo | Label visível, `autocomplete` apropriado, foco claro e erro associado ao campo quando aplicável |
| Painel | `.panel` para uma ferramenta ou grupo relacionado; evite painéis aninhados |
| Alerta | `InlineAlert` com tom `info`, `success`, `warning` ou `danger`; não dependa só da cor |
| Nível | Diferencie disponível, recomendado, concluído e bloqueado com texto, ícone e estilo |
| Carregamento | Skeleton para conteúdo estruturado; mantenha um texto de status acessível |
| Vazio | Explique o que falta e ofereça a próxima ação quando houver uma |
| Erro | Diga o que aconteceu em linguagem direta e ofereça recuperação quando possível |
| Salvamento | Diferencie salvando, salvo e falha de sincronização; não apresente sucesso antes da confirmação |

Estados interativos devem cobrir padrão, hover, foco, ativo, desabilitado, carregamento, erro e sucesso conforme a função do controle. Use `:disabled` para controles indisponíveis e mantenha o motivo compreensível. Links bloqueados não devem continuar parecendo ações clicáveis.

Não crie tabelas, dropdowns, tabs, modais ou toasts sem uma necessidade real do fluxo. Quando um padrão novo se tornar necessário, documente-o aqui e implemente-o de forma reutilizável.

### Formulário de avaliação (`FeedbackForm.vue`)

Bloco dentro do banner de vitória (`NarrativeBanner.vue`), entre os alertas de sincronização e as ações. Não é modal: usa o overlay já existente.

- **Quem vê**: apenas `auth.isAuthenticated` **e** `syncState === 'saved'`. Visitantes dos níveis livres não recebem o formulário — assim evitamos spam e garantimos que o servidor já gravou o progresso.
- **Notação de estrelas, não troque**: `⭐` = estrelas *ganhas* da tentativa (máximo 3, custo de dicas); `★` = **nota do desafio** de 1 a 5. Rótulos sempre "Nota do desafio" / "Avaliação", nunca "estrelas" sozinho.
- **Campos**: nota (5 radios ocultos + `<label>★</label>`), "Você gostou do desafio?" (radios Sim/Não), comentário opcional (`textarea`, `maxlength` 500).
- **Estados**: desabilitado sem nota → `aria-busy` ao enviar → sucesso em `role="status"` com "Alterar avaliação" → erro via `InlineAlert` (`warning` para 503 sem banco, `danger` nos demais). A falha nunca bloqueia a vitória.
- **Acessibilidade**: grupos em `<fieldset>`/`<legend>`; o foco dourado de 3 px é transferido do input oculto ao label vizinho (`input:focus-visible + label`); alvos de 44 px nas estrelas e nos botões.

### Biblioteca do Aventureiro (prateleira de capítulos)

Índice `/biblioteca` e página de capítulo `/biblioteca/[slug]`. O índice é uma **prateleira**:
uma estante por **mundo**, um **livrinho** por capítulo (`app/components/LibraryBook.vue`).
Não é modal, tabela ou tab — é navegação, e cada livro é um `NuxtLink`.

- **Hierarquia:** prateleira = mundo (6) · livrinho = capítulo (20). Os capítulos cobrem os 30
  níveis; a chave nível → capítulo fica em `shared/biblioteca/index.ts` (`slugDoNivel`), nunca
  duplicada dentro dos componentes.
- **Lombada:** fundo escuro (`--bg-elevated`/`--bg-panel`) com texto `--text`, e faixas na cor
  do `passo` (`[data-passo]` → `--cor-passo`). **Nunca** hex novo: só tokens de `:root`.
  A cor reforça a trilha, mas o passo também aparece escrito no índice — a cor nunca é o único sinal.
- **Praticado:** `✓` na lombada (desktop) e o texto `✓ Praticado` na capa (≤ 640 px), além do
  `aria-label`. Símbolo + texto, nunca só cor.
- **Hover:** o livro sai da prateleira (`translateY(-7px)`), desligado em `prefers-reduced-motion`.
- **Responsivo:** ≥ 720 px livros de pé com lombada vertical sobre a régua; ≤ 640 px a grade vira
  **capas horizontais** (a lombada vertical fica ilegível e causa overflow). A régua some no mobile.
- **Página do capítulo:** "livro aberto" com largura de leitura limitada e borda esquerda na cor
  do `passo`, fechando o ciclo visual com a prateleira. Blocos fixos: *O que você fez* → seções →
  *Pegadinhas* → *Pratique neste nível* → *No livro oficial*.
- **Botão na vitória:** dentro de `.learn`, como `.btn` **secundário** (`📖 Entenda melhor`) — a
  ação primária da região continua sendo "Próximo nível". Some se o nível não tiver capítulo.
- **Conteúdo:** vive em `shared/biblioteca/capitulos.ts` (TypeScript, sem pipeline de markdown).
  Regras de redação: PT-BR simples, **termos técnicos em inglês** (`ownership`, `borrowing`,
  `slice`) com glosa só quando ajudar, e nada que repita `learnAfter`/`cheatSheet`
  (garantido por `tests/biblioteca.test.ts`).

## Layout e responsividade

- Páginas de exploração e conteúdo usam largura limitada e leitura escaneável; a bancada de jogo pode ocupar mais espaço para editor e cena.
- Prefira grids e colunas fluidas com `minmax(0, 1fr)` e limites de largura estáveis. Evite larguras fixas que causem rolagem horizontal.
- Em telas largas, editor e cena podem coexistir. Em tablet e celular, preserve o editor como fluxo principal e ofereça alternância clara entre Código e Cena.
- Não esconda ações essenciais em hover. Alvos de toque devem ter pelo menos 44 px; campos de formulário usam pelo menos 48 px.
- Reorganize conteúdo em mobile: empilhe regiões, permita que os botões ocupem a largura disponível e mantenha diálogos roláveis dentro da viewport.
- Verifique ao menos 390 px, 768 px e 1280 px, além de uma largura estreita próxima de 320 px. Confirme que não há texto cortado nem overflow horizontal.

## Acessibilidade e movimento

- Mantenha foco de teclado visível. O padrão global usa contorno dourado de 3 px; não remova o foco sem substituto equivalente.
- Use elementos nativos: links para navegação, botões para ações, labels para campos e `progress` para progresso mensurável.
- Mensagens dinâmicas devem usar uma região apropriada (`role="alert"` para erro urgente, `role="status"` para atualização de estado).
- Diálogos devem ter nome acessível, foco inicial, foco contido, fechamento por `Escape` quando permitido e restauração do foco ao fechar.
- Não comunique sucesso, erro, bloqueio ou progresso apenas por cor; inclua texto, forma ou símbolo compreensível.
- Respeite `prefers-reduced-motion`: remova movimento decorativo e reduza transições sem eliminar o feedback necessário para entender a execução.

## Organização do código

- Tokens e utilitários globais: `app/assets/css/main.css`.
- Componentes compartilhados: `app/components/`.
- Estilos exclusivos de uma página ou componente: `<style scoped>` no próprio arquivo.
- Use variáveis CSS semânticas em vez de repetir hexadecimais. Cores fixas são apropriadas apenas para arte e renderização da cena Phaser.
- Não altere interpretador, simulador, validação, APIs ou persistência para resolver apenas uma questão visual.
- Ao adicionar uma variante ou token, atualize este documento e verifique os usos existentes antes de duplicar um padrão.

## Checklist para novas telas

- A tela parece parte de uma aventura de programação, sem perder legibilidade?
- Usa os tokens, botões, campos, painéis e alertas existentes?
- As ações principais e a próxima etapa estão claras?
- Há estados de carregamento, vazio, erro e sucesso quando aplicáveis?
- Todos os controles funcionam por teclado e têm nome acessível?
- O estado é compreensível sem depender somente de cor ou animação?
- A tela funciona em desktop, tablet e mobile sem overflow?
- `prefers-reduced-motion` foi respeitado?
- As regras de gameplay e autenticação foram preservadas?