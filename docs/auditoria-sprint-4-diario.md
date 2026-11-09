# Auditoria da Sprint 4 — Diário Multivariado

Data da auditoria: 9 de novembro de 2026.

## Resultado

O backend do Diário está concluído para o escopo da Sprint 4. O motor térmico está
integrado somente em modo sombra e não produz efeito clínico ou visual.

| Área auditada | Evidência encontrada | Situação |
| --- | --- | --- |
| Catálogo | Seis macrocategorias, opções, ordem e tipos preservados | Concluída |
| Preferências | Leitura, alteração individual e lote com versão otimista | Concluída |
| Criação | Validação, propriedade pela sessão e snapshot da fase | Concluída |
| Edição | Concorrência, alteração de data e recálculo transacional | Concluída |
| Exclusão | Propriedade, versão e recálculo transacional | Concluída |
| Histórico | Filtros combináveis e cursor vinculado aos filtros | Concluída |
| Detalhe | Busca isolada pela identidade autenticada | Concluída |
| Privacidade | Dados íntimos omitidos do resumo e respostas sem cache | Concluída |
| Temperatura | Valor original, unidade, precisão, perturbação e uso preservados | Concluída |
| Segurança | Rotas autenticadas e consultas sempre limitadas à titular | Concluída |
| Banco | Schema válido e dez migrations reconhecidas e aplicadas | Concluída |
| Frontend | Nenhum arquivo alterado nesta implementação | Preservado |

## Recálculo

- Criação, edição e exclusão executam o recálculo na mesma transação da mutação.
- Alterar a data recalcula os ciclos de origem e destino.
- Alterar uma fronteira menstrual recalcula todos os ciclos potencialmente afetados.
- Cada ciclo é reconstruído cronologicamente; a ordem de cadastro não muda o resultado.
- Repetir o processamento produz as mesmas chaves versionadas e o mesmo resultado.
- Uma falha no recálculo aborta a mutação, evitando estado parcialmente atualizado.

## Verificações executadas

- 141 testes unitários do Diário passaram com 100% de linhas, branches e funções.
- 398 testes combinados de Diário, Calendário e Ciclos passaram.
- 872 testes da suíte completa do backend passaram.
- ESLint passou sem avisos e Prettier confirmou todos os arquivos do Diário.
- O Prisma validou o schema, dez migrations e 28 tabelas.

## Limites da conclusão

Esta conclusão cobre o backend funcional e experimental. Não declara validação clínica
do motor térmico, não autoriza exibição de conclusões e não altera a confiança da
HU-013. Essas restrições são controles deliberados, não lacunas acidentais.
