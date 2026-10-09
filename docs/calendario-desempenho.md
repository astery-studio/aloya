# Otimização do calendário — relatório técnico

Data: 08/10/2026. Repositório: `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya`.
Base de comparação: `527ffbe1c6765182b031e20280702b150e78637b`.

As seções A–H registram a primeira etapa. A revisão posterior, motivada pelo relato de travamento no iOS pelo Expo, está no adendo ao final; ela atualiza o escopo e os resultados de validação.

## A. Diagnóstico inicial

O componente em uso na tela de teste é `CycleCalendar`. A outra cópia do projeto, em `Aloya Project/editar-anticoncepcional`, contém o calendário do onboarding, mas não esse componente. O trabalho foi realizado no repositório `aloya`, sem alterar a cópia.

1. **Principal gargalo: normalização integral durante paginação.** Em `CycleCalendar.jsx`, o `useMemo` dependia do array `meses`. Cada inclusão criava outro array e `normalizarMeses` reconstruía todos os meses, semanas e dias, incluindo mapas de registros e cálculos UTC. Isso invalidava a comparação por referência do `memo` existente em `CycleMonth`, `CycleWeek` e `CycleDay`. A virtualização limitava a montagem visual, mas não o processamento dos dados fora da tela.
2. **Custo repetido na montagem e atualização.** `intervaloContem`, em `cycleCalendar.utils.js`, verificava os mesmos tipos e expressões regulares de cada intervalo para cada dia consultado. Esses intervalos são constantes durante a normalização de um mês.
3. **Lint local preexistente.** O cálculo dos layouts acumulava `deslocamento` dentro de um callback de `map`, sinalizado por `react-hooks/immutability`. Foi convertido em um laço local, com a mesma saída.

O componente já usa virtualização, lotes de dois meses, janela de três telas, callbacks memorizados, índice inicial e layouts pré-calculados. Não se justificou substituir a lista ou introduzir biblioteca. Os componentes de dias, semanas e meses já usam `memo`; adicionar mais wrappers não resolveria a invalidação das referências.

O toque em dia registrado apenas encaminha `{data, registroCicloId}` ao chamador: não há estado de seleção interno nem navegação semanal independente nesse componente. Os callbacks de paginação são protegidos por flags de carregamento e interação. O componente não faz requisições, portanto não controla cancelamento ou ordenação de respostas da API. A tela de teste usa dados locais e limpa seus temporizadores ao desmontar. Não foi constatado vazamento por inspeção; não foi realizado perfil de heap.

Não há animações próprias de transição nesse calendário. A rolagem é nativa e o callback de scroll apenas verifica condições de paginação. Não foram medidas duração de frames, latência de gestos ou montagem nativa. Não foram identificadas cascatas de estado adicionais que justificassem mudanças neste escopo.

Prioridade adotada: reaproveitar dados na paginação, retirar validações repetidas, testar correção e renderizações, medir o processamento isolado.

## B. Alterações realizadas por arquivo

### `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/src/features/calendar/components/CycleCalendar/CycleCalendar.jsx`

- Troca do import de `normalizarMeses` por `criarNormalizadorMeses`.
- Criação de um normalizador memorizado por instância/data e uso dele na preparação da lista. Antes, qualquer novo array reconstruía todos os meses; agora, objetos mensais preservados reutilizam o resultado anterior. Isso permite que o `memo` existente evite renderizações redundantes.
- Conversão do `map` com acumulador capturado para `for...of`, preservando índices, comprimentos e offsets. Corrige o diagnóstico de lint sem alterar dimensões ou o comportamento da lista.
- Inclusão da quebra de linha final. Nenhuma alteração no JSX, nos estilos, nos parâmetros da lista ou nos callbacks de interação.

### `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/src/features/calendar/utils/cycleCalendar.utils.js`

- Extração de `validarIntervalo` e criação de `prepararPrevisao`: valida os cinco intervalos uma vez por mês. `intervaloContem` passa a realizar apenas as comparações dos limites já validados. Preservadas as regras de prioridade, formato, previsão e janela fértil.
- `normalizarMeses` aceita um normalizador opcional, mantendo o comportamento padrão, a ordenação e a regra de que a última ocorrência de um mês vence.
- Novo export `criarNormalizadorMeses`: encapsula `WeakMap` indexado pelo objeto mensal, incluindo entradas envelopadas. Reutiliza meses normalizados e armazena também resultados inválidos. Cada instância possui seu próprio cache, associado a uma data local.
- O cache não mantém referências fortes aos objetos de entrada: meses descartados pelo chamador podem ser coletados. Não há um cache global de histórico. Meses ainda mantidos pelo chamador continuam ocupando memória; não foi imposto limite ao histórico funcional.
- Comentários explicitam o contrato de atualização imutável; adicionada quebra de linha final.
- Complexidade: a preparação detalhada passa de todos os dias de todos os meses para os dias dos meses novos/substituídos. A passagem pela coleção, a ordenação e os layouts continuam dependentes do total de meses.

### `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/tests/features/calendar/utils/cycleCalendar.cache.test.js`

Novo arquivo com 11 casos: reaproveitamento na paginação, envelopes, entradas inválidas, substituição imutável de dados, isolamento de instâncias/datas, duplicatas, virada de ano, anos bissextos e anos anteriores a 100, além de intervalos malformados. Verifica referências e valores; não adiciona comportamento ao produto.

### `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/tests/features/calendar/components/CycleCalendar.performance.test.jsx`

Novo teste com contador de execução do mês preservado. Confirma ausência de renderizações adicionais ao acrescentar mês ou mudar loading com os mesmos dados. Também confirma que a substituição do callback chega ao toque, evitando congelar uma função antiga em nome da otimização.

### `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/tests/features/calendar/benchmark.mjs`

Novo benchmark Node com imports nativos, sem dependências adicionais. Lê a implementação original via `git show`, compara profundamente os resultados e mede a normalização inicial e a paginação. Usa 121 meses sintéticos com fases, registros e janela fértil, mais seis entradas inválidas/envelopadas/duplicadas. Compara referências dos 120 meses existentes. Não integra o tempo do benchmark ao critério de aprovação dos testes, evitando falhas por variação de máquina.

### `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/docs/calendario-desempenho.md`

Novo relatório com diagnóstico, alterações, evidências, comandos e limitações. Nenhum efeito no aplicativo.

## C. Bibliotecas e dependências

Nenhuma biblioteca adicionada, removida ou atualizada. Preservados React 19.2.3, React Native 0.86.3 e Expo ~57.0.26, conforme o manifesto. Nenhuma alteração em manifestos ou lockfiles. O projeto usa JavaScript/JSX; não foi introduzido TypeScript ou nova arquitetura.

## D. Resultados de desempenho

Ambiente: Windows x64, Node v22.20.0. Benchmark sintético no host, sem Hermes, emulador ou build release. Mediana de 101 amostras, após 30 aquecimentos por cenário. Na paginação, o cache já contém os 120 meses anteriores; cada amostra recebe um novo objeto para o mês adicional. Os resultados são uma execução, sujeitos a variação e não equivalem a medidas de interface.

| Métrica | Antes | Depois | Resultado |
|---|---:|---:|---|
| Preparação de dados de três meses, cache novo | 0,065 ms | 0,038 ms | Cerca de 42% menor nesta execução |
| Preparação na paginação de 120 para 121 meses | 2,286 ms | 0,042 ms | Cerca de 98% menor nesta execução |
| Objetos de meses anteriores recriados na paginação | 120 | 0 | Referências preservadas |
| Renderizações adicionais do mês preservado no teste de componente | Não medido | 0 | Verificado com callback estável |
| Tempo de renderização inicial nativa | Não medido | Não medido | Requer dispositivo |
| Tempo de navegação/rolagem entre meses | Não medido | Não medido | Requer dispositivo |
| Tempo de resposta à seleção | Não medido | Não medido | Encaminhamento funcional testado |
| Consumo de memória/heap | Não medido | Não medido | Cache fraco inspecionado; sem perfil de heap |

Reprodução, na raiz do repositório:

```powershell
node frontend/tests/features/calendar/benchmark.mjs 527ffbe1c6765182b031e20280702b150e78637b
```

O benchmark verifica igualdade profunda da saída antiga e nova antes de imprimir os resultados. O ganho esperado na interface é menos trabalho JavaScript e menos renderizações dos meses preservados; não se afirma ausência comprovada de travamentos em dispositivos.

## E. Validação e testes

Comandos executados em `frontend`, salvo indicação:

- `npm test -- --watch=false tests/features/calendar`: antes, 38 testes/5 suítes passaram; depois, 50 testes/7 suítes passaram.
- `npm test -- --watch=false`: 809 testes/95 suítes passaram, incluindo os testes de integração do frontend. Tempo total informado pelo Jest: 88,473 s; esse tempo não é uma métrica do calendário.
- `npm run lint`: inicialmente apontou 16 erros e 5 avisos, incluindo o acumulador de layouts corrigido.
- `npx eslint src/features/calendar tests/features/calendar`: passou após os ajustes, incluindo o benchmark.
- `npx eslint src tests --format json --output-file node_modules/.cache/calendar-lint.json`: resultado final de 15 erros e 5 avisos fora dos arquivos alterados. `BottomSheet.jsx`: 14 erros/1 aviso; `DatePickerSheet.jsx`: 1 erro/1 aviso; testes `createAppServices.test.js`: 1 aviso; `InteractionCoverage.test.jsx`: 2 avisos. Não foram corrigidos por estarem fora do escopo.
- `git diff --check`, na raiz: passou; Git apenas avisou sobre conversão futura LF/CRLF.
- Benchmark acima: passou na comparação da saída com a revisão original e produziu as métricas registradas.

As primeiras tentativas do Jest no sandbox falharam por `EPERM` em `realpath` do cache, inclusive com TEMP/TMP locais. A execução fora dessa restrição foi autorizada pelo mecanismo de aprovação e passou. Não houve instalação de pacotes. Arquivos temporários de cache estão em `node_modules/.cache`, não são entregáveis.

Type checking separado: não executado, pois não há script de typecheck ou tsconfig no projeto inspecionado. A transformação de JS/JSX foi exercitada pelo Jest. Não foram executados testes de backend/API real, builds nativos ou comparação visual em dispositivo.

## F. Garantia de preservação

O diff não altera estilos, cores, dimensões, textos, ícones, JSX, gestos, paginação ou parâmetros de virtualização. Os arquivos `CycleMonth`, `CycleWeek`, `CycleDay` e `CycleCalendar.styles.js` permaneceram intactos. Os layouts retornam os mesmos valores. A comparação contra a implementação anterior verificou igualdade dos dados normalizados; os testes existentes cobrem marcações, acessibilidade, cliques e paginação.

Isso oferece evidência de preservação estrutural e funcional, mas não comprova equivalência pixel a pixel em Android/iOS. Nenhuma captura comparativa foi realizada. Foram mantidos os padrões de módulos, nomes em português, hooks e atualização imutável usados pelo projeto.

## G. Arquivos modificados

Alterados:

- `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/src/features/calendar/components/CycleCalendar/CycleCalendar.jsx`
- `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/src/features/calendar/utils/cycleCalendar.utils.js`

Criados:

- `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/tests/features/calendar/utils/cycleCalendar.cache.test.js`
- `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/tests/features/calendar/components/CycleCalendar.performance.test.jsx`
- `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/tests/features/calendar/benchmark.mjs`
- `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/docs/calendario-desempenho.md`

Nenhum arquivo removido. As alterações preexistentes em `frontend/src/App.js` e o diretório não rastreado `frontend/src/features/calendar/testing/` foram lidos e preservados, sem edição nesta tarefa.

## H. Pendências e recomendações

- Comparar capturas e perfilar uma build release em Android/iOS, especialmente durante paginação longa e rolagem rápida. Frames, heap, resposta ao toque e equivalência visual permanecem sem medição.
- Ao editar um mês, substituir seu objeto e o array de meses. Mutação interna do mesmo objeto não invalida o cache; essa restrição está documentada e coincide com a atualização imutável utilizada na tela inspecionada. Recriar todos os objetos em cada render continua correto, mas reduz o ganho do cache.
- A data local continua fixada na montagem, como antes. Atualização automática ao atravessar meia-noite não foi introduzida.
- O histórico de entrada ainda é integralmente percorrido/ordenado. Avaliar preparação sob demanda apenas se o perfil real mostrar necessidade; introduzi-la agora ampliaria a mudança na lista e nos layouts.
- Verificar offsets e escalonamento de fontes em dispositivo: os layouts numéricos preexistentes foram preservados, sem alterar a altura do indicador de carregamento ou a estratégia de posicionamento.
- A integração real deverá tratar concorrência e cancelamento de requisições no proprietário dos dados. O calendário atual recebe dados e callbacks, sem controlar a rede.
- Os problemas de lint externos continuam pendentes. Não há regressão conhecida nos testes executados, mas a validação nativa permanece necessária para confirmar todos os critérios perceptivos solicitados.

## Adendo — correção de paginação no iOS/Expo

Após a primeira etapa, a usuária informou que o componente continuava bugando e travando no iOS pelo Expo. As métricas anteriores cobriam processamento de dados e não demonstravam que esse problema perceptível estivesse resolvido.

### Diagnóstico e alterações

Arquivo alterado: `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/src/features/calendar/components/CycleCalendar/CycleCalendar.jsx`.

1. O `getItemLayout` ignorava os 44 pontos do indicador de carregamento anterior. Agora, o acumulador de offsets começa na altura do indicador quando ele está presente, lida diretamente do estilo existente; o memo depende também de `carregandoAnteriores`. O comprimento de cada mês continua igual. Essa correção mantém coerência entre conteúdo rolável e coordenadas usadas pela virtualização.
2. O `ListHeaderComponent` era adicionado/removido conforme o loading. A implementação instalada de `VirtualizedList` ajusta `minIndexForVisible` conforme a presença desse cabeçalho. Agora existe um `View` não colapsável estável, vazio com altura zero quando não está carregando, que recebe o mesmo indicador quando necessário. Isso preserva o índice nativo reservado ao cabeçalho sem adicionar espaço visual em repouso.
3. As flags booleanas de solicitação só eram liberadas em `onScrollBeginDrag`: depois de uma resposta, uma nova página era bloqueada durante o mesmo gesto/momentum. Agora as refs registram a chave do primeiro/último mês solicitado. Eventos repetidos para a mesma borda continuam bloqueados, mas a chegada de uma nova borda permite a próxima solicitação. A proteção por loading e por interação inicial permanece. Um novo gesto ainda permite tentar novamente uma borda sem resposta/dados novos.

Não foram modificados estilos, aparência dos indicadores, ícones, parâmetros de virtualização, dados de teste ou dependências. O impacto esperado é corrigir inconsistências de posicionamento e a interrupção da paginação; não foi medido ganho de FPS.

Arquivo alterado: `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/tests/features/calendar/components/CycleCalendar.test.jsx`.

Foram acrescentados três testes: offsets/cabeçalho durante entrada e saída do loading, paginação posterior continuada e paginação anterior continuada sem novo gesto. Os testes de continuação reproduziram uma chamada em vez das duas necessárias antes da correção; o de cabeçalho reproduziu sua ausência. Após a alteração, todos passaram. Não houve exclusões ou novas bibliotecas.

Arquivo atualizado: `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/docs/calendario-desempenho.md`, para registrar esta revisão e distinguir as evidências das duas etapas.

### Validação desta revisão

- `npm test -- --watch=false tests/features/calendar/components/CycleCalendar.test.jsx`: três novos casos falharam antes da correção. A primeira execução também revelou um uso de API de teste não disponível na versão instalada, corrigido antes de confirmar as falhas funcionais.
- `npm test -- --watch=false tests/features/calendar`: 53 testes em 7 suítes passaram após a correção.
- `npx eslint src/features/calendar tests/features/calendar`: passou.
- `git diff --check`: passou, apenas avisos LF/CRLF.
- A suíte completa de 809 testes pertence à primeira etapa; não foi repetida nesta revisão, que foi validada pelo conjunto completo do calendário.

O ambiente disponível é Windows e não há simulador iOS. A rolagem nativa no iPhone, equivalência visual e eliminação do travamento ainda precisam de confirmação no aparelho. O teste de renderer não executa UIKit nem reproduz frames do Expo Go. Caso o problema continue, o próximo diagnóstico depende do sintoma específico (saltos/brancos, fim da paginação ou congelamento geral) e de reprodução/logs no dispositivo; não se declara o problema perceptível definitivamente resolvido.

## Adendo — primeiro gesto para meses posteriores

A usuária especificou o sintoma: ao abrir o calendário no iOS/Expo, precisava rolar para cima antes de conseguir carregar meses para baixo. A inspeção de `VirtualizedList.js` da versão instalada confirmou que a lista registra `_sentEndForContentLength` antes de chamar `onEndReached`. O componente rejeitava o evento inicial por `usuarioInteragiu === false`, mas a lista só voltava a notificá-lo ao sair da região final ou mudar o comprimento. Liberar a flag em `onScrollBeginDrag` não recuperava o evento perdido.

Em `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/src/features/calendar/components/CycleCalendar/CycleCalendar.jsx`, foi adicionada verificação da distância ao final usando `contentSize`, `layoutMeasurement` e `contentOffset` nos eventos nativos. Ela roda no início do gesto e durante a rolagem, reutilizando as proteções existentes contra duplicatas, carregamento em andamento e ausência de interação. O limiar permanece em 15% da altura visível, agora centralizado em `LIMIAR_FINAL`. `onEndReached` continua disponível; eventos concorrentes são deduplicados pela chave do último mês. Não foram alterados estilos, posição inicial ou dependências.

Em `C:/Users/kayla/Documentos/Dev/Projeto Integrado III/aloya/frontend/tests/features/calendar/components/CycleCalendar.test.jsx`, três novos testes reproduziram a falha antes da correção: evento inicial consumido sem repetição, aproximação ao final somente via scroll, e conteúdo menor que a tela no primeiro gesto. Após a correção, os 56 testes das 7 suítes do calendário passaram (`npm test -- --watch=false tests/features/calendar`). Os casos verificam também que não há carregamento automático antes da interação, nem chamadas duplicadas entre scroll e `onEndReached`. Este relatório também foi atualizado. A validação em iPhone continua pendente; esses são testes de eventos e lógica, não medições nativas.
