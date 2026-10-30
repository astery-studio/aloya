# HU-008 — Componentes de apresentação

## MenstruationRegistrationScreen

Tela controlada em `frontend/src/features/cycles/screens/MenstruationRegistrationScreen.jsx`.
Usa a normalização de meses do calendário de fases e uma grade própria para seleção,
sem mudar os componentes visuais do calendário de fases.

| Prop                   | Contrato                                                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `meses`                | Meses no mesmo formato da API de calendário: `mes`, `possuiCiclos`, `diasMenstruacao`. As previsões não são pintadas nesta tela. |
| `datasSelecionadas`    | Array controlado de datas civis `AAAA-MM-DD`. O fluxo monta o intervalo após os toques no primeiro e no último dia.              |
| `onAlternarData(data)` | Recebe um toque em data livre; não abre confirmação.                                                                             |
| `onSalvar(datas)`      | Recebe uma cópia da seleção. A decisão de estender ou iniciar um ciclo pertence ao backend.                                      |
| `salvando`             | Bloqueia os dias, a navegação e a ação principal enquanto o fluxo salva.                                                         |
| `erro`                 | Erro do fluxo. `CONFLITO_REGISTRO_MENSTRUAL` mostra a orientação para editar. Outros erros mostram o popup de sincronização.     |
| `sucesso`              | Exibe “Menstruação cadastrada”. Deve ser informado pelo fluxo após a operação apropriada.                                        |
| `onTentarNovamente`    | Solicita retentativa ao fluxo, sem criar operações nesta tela.                                                                   |
| `onFecharFeedback`     | O fluxo limpa `erro`/`sucesso`. A seleção permanece controlada e não é apagada ao fechar o popup.                                |
| `onVoltar`             | Retorna à tela anterior.                                                                                                         |
| `onCarregarAnteriores` | Paginação opcional de meses anteriores.                                                                                          |
| `hoje`                 | Referência civil opcional; por padrão usa o dia local do aparelho.                                                               |

O primeiro dia selecionado apresenta a orientação para tocar no último dia, mas um dia
sozinho já pode ser salvo. Dias futuros ficam desabilitados. Dias já registrados mostram
contorno e ícone de gota; um toque neles apresenta “Ciclo existente” sem alterar a seleção.
A faixa selecionada usa extremidades preenchidas, gotas e texto em destaque.
Toques simples permitem avançar dia a dia ou escolher o último dia da faixa. Um duplo toque
no mesmo dia livre em até 300 ms chama `onIniciarFaixa(data)` e substitui a seleção por esse
novo primeiro dia. A ação acessível “Iniciar uma nova faixa neste dia” oferece a mesma
operação para leitores de tela. Isso altera somente a seleção ainda não salva.

## SyncStatusIndicator

Componente de apresentação em `frontend/src/features/cycles/components/SyncStatusIndicator.jsx`.
Recebe o estado de uma alteração **já persistida localmente**:

| Status          | Apresentação                                                               |
| --------------- | -------------------------------------------------------------------------- |
| `sincronizando` | Atividade e texto.                                                         |
| `pendente`      | Ícone de relógio e texto indicando que a alteração está salva no aparelho. |
| `falha`         | Ícone, texto e retentativa opcional por `onTentarNovamente`.               |
| `sincronizado`  | Oculto por padrão; `mostrarSincronizado` permite mostrar a confirmação.    |

`mensagem` substitui o texto padrão. O componente não acessa armazenamento,
conectividade ou API, não dispara a fila e não tenta sincronizar ao montar.

## Integração

O cadastro é acessado pela Home e pelo botão de cadastro do Calendário.
Ao abrir pela Home, `dataInicial` recebe o dia selecionado e inicia a seleção editável
do cadastro. Datas futuras ou inválidas não são pré-selecionadas. A entrada pelo botão
do Calendário limpa essa referência e começa sem pré-seleção. Não há salvamento automático.
Em cada abertura, a lista inicia no mês atual, inclusive quando a data pré-selecionada
pertence a outro mês. Os meses anteriores continuam disponíveis pela rolagem.
O container carrega
os últimos 12 meses e controla a seleção. A decisão de estender um período ou criar outro
continua no backend. A operação é persistida no armazenamento seguro antes da chamada HTTP.
A fila é separada pelo identificador da conta, serializa gravações e conserva a mesma chave
de idempotência nas retentativas. Até oito operações podem aguardar sincronização.
O retorno do aplicativo ao primeiro plano e tentativas a cada 15 segundos enquanto ativo
permitem sincronizar novamente após o retorno da conexão. A fila não depende da tela aberta.
A Home conserva a apresentação existente e abre o cadastro pela ação já prevista no protótipo.
O adaptador de calendário acrescenta as datas pendentes sem inventar IDs remotos nem alterar
o cálculo de fases. Após sincronizar, Home e Calendário são recarregados; o Histórico busca
os dados atuais quando acessado. A seleção permanece após falhas.
O contrato do backend está em `docs/hu-008-backend.md`.

Ainda é necessária validação em aparelhos Android e iOS e medição do prazo de um segundo
com rede e banco reais. Testes JavaScript não comprovam esses dois pontos.
