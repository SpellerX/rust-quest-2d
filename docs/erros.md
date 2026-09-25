# Tabela de erros do interpretador

Códigos imitam a numeração real do Rust de propósito — o jogador se acostuma
a ver `E0384` e, lá na frente, no compilador de verdade, reconhece o erro.
A fonte de verdade é `shared/interpreter/errors.ts`; esta tabela é o espelho
legível. Mantém sincronia com aquela tabela.

| Código | Estágio | Quando acontece | Mensagem amigável (resumo) |
|---|---|---|---|
| `E0001` | lex/parse | Caractere ou token inesperado | "A sintaxe ficou confusa aqui. Confira se falta algo como `;`, `)` ou `=`." |
| `E0002` | parse | Faltou um token esperado (`;`, `)`, `=`, `expressão`, `variável`, `,`) | "Faltou um `;` no fim da linha." (varia pelo token) |
| `E0003` | check | Expressão solta que não faz nada (ex.: `x;`, ou guardar comando em variável) | "Esse valor não faz nada sozinho…" / "Os comandos do jogo não retornam valor…" |
| `E0412` | check | Variável usada antes/depois de declarada | "A variável `x` não existe. Você criou ela com `let`?" + dica |
| `E0384` | check | Atribuição a variável criada sem `mut` | "Não dá pra mudar `x` porque ela foi criada com `let`. Use `let mut`." |
| `E0308` | check | Tipos incompatíveis (operação, argumento, anotação, atribuição) | Frase completa indicando os dois tipos envolvidos |
| `E0425` | check | Chamou função que não existe na API de jogo | "`foo` não é um comando do jogo. Veja os comandos disponíveis no painel." |
| `E0061` | check | Número de argumentos errado | "O comando `mover_direita` espera 1 argumento, mas você passou 2." |
| `E0901` | check | Comando fora do allowlist do nível | "Esse comando não está liberado neste nível." |
| `E0201` | exec | Divisão ou resto por zero em tempo de execução | "Divisão por zero! O programa parou aqui." |
| `E0900` | exec | Limites de segurança (500 comandos, 100 passos, 50k avaliações) | "Seu código gerou comandos demais… passos e força devem ficar entre 1 e 100." |

## Fora do escopo do MVP

Erros de borrow/move (`E0382`, `E0502`…) pertencem aos mundos de Ownership
(Fase 3 do roadmap): o subconjunto MVP não tem referências, então o borrow
checker real não é simulado.
