# Tabela de erros do interpretador

Códigos imitam a numeração real do Rust de propósito — o jogador se acostuma
a ver `E0384` e, lá na frente, no compilador de verdade, reconhece o erro.
A fonte de verdade é `shared/interpreter/errors.ts`; esta tabela é o espelho
legível. Mantém sincronia com aquela tabela.

| Código | Estágio | Quando acontece | Mensagem amigável (resumo) |
|---|---|---|---|
| `E0001` | lex/parse | Caractere ou token inesperado (inclui string sem fechar `")` | "A sintaxe ficou confusa aqui. Confira se falta algo como `;`, `)` ou `=`." |
| `E0002` | parse | Faltou um token esperado (`;`, `)`, `=`, `{`, `}`, `->`, `..`, `in`, `:`, `expressão`, `variável`, `nome da função`, `parâmetro`, tipo) | "Faltou um `;` no fim da linha." (varia pelo token) |
| `E0003` | check | Expressão solta que não faz nada (ex.: `x;`, guardar comando em variável, usar fn void como valor) | "Esse valor não faz nada sozinho…" / "…não retorna valor…" |
| `E0004` | check | `break`/`continue` fora de um laço | "`break` só pode ser usado dentro de loop, while ou for…" + dica |
| `E0412` | check | Variável usada antes/depois de declarada | "A variável `x` não existe. Você criou ela com `let`?" + dica |
| `E0384` | check | Atribuição a variável criada sem `mut` | "Não dá pra mudar `x` porque ela foi criada com `let`. Use `let mut`." |
| `E0382` | check | Uso de variável `String` depois de passada por valor (move) | "`x` foi movida: ao passar um texto por valor, a posse transfere…" + dica: use `&variavel` |
| `E0308` | check | Tipos incompatíveis (operação, argumento, anotação, atribuição, condição `if`/`while`, retorno de `fn`) | Frase completa indicando os dois tipos envolvidos |
| `E0425` | check | Chamou função que não existe (nem API de jogo nem `fn` do jogador) | "`foo` não existe: não é um comando do jogo nem uma fn que você definiu." |
| `E0428` | check | `fn` duplicada ou com nome de comando da API | "`x` já existe. Escolha outro nome para a sua fn…" |
| `E0572` | check | `return` fora de função | "`return` só existe dentro de uma fn…" |
| `E0061` | check | Número de argumentos errado | "O comando `mover_direita` espera 1 argumento, mas você passou 2." |
| `E0901` | check | Comando fora do allowlist do nível | "Esse comando não está liberado neste nível." |
| `E0201` | exec | Divisão ou resto por zero em tempo de execução | "Divisão por zero! O programa parou aqui." |
| `E0900` | exec | Limites de segurança (500 comandos, 100 passos, 50k avaliações, 64 níveis de chamada, laço infinito) | "Seu código gerou comandos demais…" / "chamadas demais (recursão infinita?)" |

## Fora do escopo (por ora)

O borrow checker completo (`E0502` referência mutável simultânea, lifetimes)
não é simulado: o Mundo 6 cobre a base de ownership (move + empréstimo `&`,
`E0382`). Conflitos de empréstimo simultâneo ficam para uma fase futura.
