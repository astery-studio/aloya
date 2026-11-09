# Motor térmico — recálculo determinístico

O resultado é sempre reconstruído das medições originais ordenadas por data.
Ele não depende da ordem de cadastro nem do resultado calculado anteriormente.

## Associação ao ciclo

Uma medição pertence ao ciclo cujo `dataInicio` é o último início menstrual
menor ou igual à data medida. O próximo `dataInicio` inicia imediatamente outro
ciclo. `dataFim` representa o fim da menstruação, não o fim do ciclo, e não
limita as temperaturas.

Medições anteriores ao primeiro ciclo conhecido permanecem no Diário, mas não
produzem análise por ciclo até existir uma fronteira que permita associá-las.

## Eventos e alcance

| Evento | Alcance do recálculo |
|---|---|
| Criar uma temperatura | ciclo da data |
| Editar valor ou perturbação | ciclo da data |
| Mover um registro | ciclos de origem e destino |
| Excluir uma temperatura | ciclo da data excluída |
| Criar início menstrual | todos os ciclos da pessoa |
| Editar início menstrual | todos os ciclos da pessoa |
| Excluir ciclo ou primeiro dia | todos os ciclos restantes |

Não basta recalcular somente o dia alterado: uma leitura pode compor a
referência dos dias seguintes, iniciar ou interromper a sequência confirmatória.

## Reconstrução causal

Para cada ciclo afetado, o motor:

1. consulta novamente as temperaturas originais;
2. ordena por data civil;
3. exclui do cálculo, sem apagar, medições perturbadas;
4. procura seis dias anteriores consecutivos e válidos;
5. avalia o candidato sem incluí-lo na própria média;
6. congela a referência durante os três dias elevados;
7. encerra a busca após a primeira sequência confirmada;
8. classifica o ciclo e grava o resultado versionado.

Cadastro retroativo e cadastro cronológico geram o mesmo resultado. Editar e
depois restaurar uma medição também restaura o resultado correspondente.

## Atomicidade e versionamento

O recálculo ocorre na mesma transação da criação, edição ou exclusão. Se ele
falhar, a mutação original é desfeita; não existe temperatura nova acompanhada
de análise antiga.

Cada resultado é identificado por ciclo, versão, variante e disponibilidade.
Reexecutar a mesma versão atualiza o mesmo resultado. Uma versão futura cria
outro resultado e preserva a rastreabilidade da regra anterior.
