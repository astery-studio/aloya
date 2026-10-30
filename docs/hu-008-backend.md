# HU-008 — Backend do registro menstrual

Branch: `feat/adicionar-registro-menstruacao`, criada de `origin/develop`.

## Registro e sincronização

`POST /api/cycles/registrations`, autenticado com o mesmo Bearer token das demais rotas.
Enviar `Idempotency-Key` de 8 a 128 caracteres (`A-Z`, `a-z`, números, `.`, `_`, `:`, `-`).
O app deve gerar uma chave por operação e persistir essa chave junto da marcação offline.

Corpo para um dia (inclusive o atalho de hoje):

```json
{ "data": "2026-10-29" }
```

Corpo para um intervalo consecutivo, inclusivo, de até 366 dias:

```json
{ "dataInicio": "2026-10-01", "dataFim": "2026-10-05" }
```

Não há etapa de confirmação na API. A titular é sempre obtida da sessão;
campos extras, inclusive `usuarioId`, são rejeitados. Datas civis são `AAAA-MM-DD`,
com validação do dia atual pelo relógio UTC do servidor, conforme os serviços existentes.

- `201`: operação persistida, dias `sincronizado`, ciclo atualizado e previsão recalculada na resposta.
- `200`, `repetida: true`: recibo de uma operação já concluída com a mesma chave e mesmo intervalo.
  Não recria dias, não reaplica uma operação antiga após edição/remoção e não duplica notificações.
  O recibo contém o resultado original; consultar Home/Calendário para o estado atual.
- `409 CHAVE_SINCRONIZACAO_REUTILIZADA`: mesma chave usada com outro intervalo.
- `409 CONFLITO_REGISTRO_MENSTRUAL`: sobreposição ou tentativa de unir dois ciclos;
  a mensagem orienta editar pelo Histórico. Não substitui registros existentes.
- `409 CONCORRENCIA_REGISTRO_MENSTRUAL`: repetir posteriormente com a mesma chave.
- `422`: formato, intervalo, chave ou data futura inválidos.

Um dia consecutivo estende o período. Marcação imediatamente anterior permite completar
retroativamente o mesmo período. Uma lacuna inicia outro ciclo; preencher uma lacuna entre
dois ciclos distintos exige edição. A extensão não preenche dias desmarcados internamente.
`dataFim` é o último dia efetivamente registrado. Ao surgir um próximo início, ciclos abertos
anteriores são encerrados no último dia registrado, sem inventar dias de sangramento.
`duracaoCiclo` do ciclo anterior é a diferença entre os dois inícios; o último permanece `null`.

Dias, ciclos, durações, invalidação das projeções persistidas, notificações e recibo são gravados
na mesma transação. Uma falha intermediária reverte tudo. A resposta inclui `previsao`, calculada
pelo algoritmo existente; as rotas de Home, Calendário e Histórico consultam os dados persistidos.
Não é usado um processamento assíncrono para efetuar o recálculo.

## Rede de Apoio

Após uma operação nova, são agendadas notificações duráveis `rede_apoio` para contatos de vínculos
ativos com `geral.historico_ciclo`. Se existe categoria, suas permissões vigentes prevalecem;
as permissões individuais são usadas quando não há categoria. A notificação não contém o histórico. Contas desativadas e contatos com notificações da Rede de Apoio desabilitadas não recebem novos agendamentos.
O envio externo depende do mecanismo de entrega de notificações, que não é implementado por esta HU.

`GET /api/cycles/shared/:titularId` permite que o contato autenticado consulte o histórico
atualizado. As permissões são revalidadas em cada leitura; vínculo revogado ou sem permissão
retorna `404`, sem revelar dados da titular. Retorna até 50 ciclos por página, ordenados por ID
decrescente; `?antesDe=<proximoCursor>` carrega a próxima página. A resposta usa `private, no-store`.

## Parte que cabe ao aplicativo

Esta entrega altera somente backend. O frontend deverá persistir os dias e as operações na
fila local **antes** de enviar a requisição; manter os dados quando houver falha; repetir com
a mesma chave ao restabelecer a conexão; exibir o indicador discreto e a marcação com ícone/texto;
aplicar a previsão retornada e atualizar as telas. Conflitos definitivos devem permitir correção
do usuário e não entrar em repetição automática infinita. Cada item da fila usa uma transação;
não há atomicidade entre múltiplas requisições independentes.

A meta de exibição em um segundo precisa de validação no app e no ambiente de implantação.
