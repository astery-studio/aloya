# HU-014 — Criação de registro no Diário

## Acesso e escopo

A aba **Diário** do menu inferior abre `DiaryFlow`. A tela oferece a ação
**Criar registro**, que abre um bottom sheet. O painel pode ser fechado pelo retorno do
sistema, pelo escape de acessibilidade ou por um gesto vertical para baixo. Durante o
salvamento, o fechamento fica bloqueado para evitar interrupção ambígua.

Esta HU entrega a criação. Cartões, timeline e histórico visual pertencem à HU-017.
O fluxo conserva em memória os registros criados na sessão, ordenados por data e id
decrescentes, e confirma a data do registro mais recente sem antecipar essa listagem.

## Componentes e responsabilidades

- `DiaryFlow`: controla a abertura do modal e a inserção ordenada do resultado.
- `DiaryScreen`: apresenta o ponto de entrada acessível pela navegação inferior.
- `NewDiaryEntryModal`: liga o bottom sheet aos estados de catálogo e formulário.
- `NewDiaryEntryContent`: apresenta carregamento, erro, retry, campos e ação de salvar.
- `DiaryMacrocategoryList`: cria os acordeões e recolhe Vida Íntima e Social por padrão.
- `DiaryCategoryField`: traduz o tipo do catálogo em opções, decimal, duração ou texto.
- `DiaryDateNavigator`: altera datas civis sem conversão de fuso ou salto de dia.

## Catálogo e preferências

Ao abrir o modal, o frontend consulta `GET /api/diario/catalogo` com a sessão
autenticada. Somente macrocategorias ativas e categorias com `ativaEfetiva` verdadeira
são renderizadas. A resposta é cancelada ao fechar ou recarregar o modal, e respostas
obsoletas não substituem o estado atual.

Os nomes, a ordem, os tipos, as unidades, os limites e as opções vêm do backend. A
apresentação local associa as seis macrocategorias às paletas do tema e associa cada
opção ao ícone aprovado, sem duplicar o catálogo funcional.

## Validação e envio

A data inicial é o dia civil atual. As setas permitem datas anteriores e impedem
avançar além de hoje. Data inválida ou futura produz a mensagem definida pela HU.

Nenhuma categoria isolada é obrigatória. O envio exige ao menos uma categoria ativa
preenchida. Campos vazios são omitidos. Opções preservam seleção múltipla; duração é
enviada em minutos; anotação aceita até 5.000 caracteres e exibe contador em tempo real.

A temperatura aceita uma casa decimal e o intervalo 32,0–42,0 °C definido pelo backend.
O valor é comparado e enviado sem arredondamento. O payload usa ponto decimal apenas
na representação da API. O salvamento chama `POST /api/diario/registros` uma única vez,
inclui o fuso IANA e fecha o modal somente depois de uma resposta válida.

## Privacidade e motor térmico

O frontend não envia identificador de usuário; a titular é determinada exclusivamente
pela sessão autenticada. Vida Íntima e Social permanece discreta por padrão. O modal não
exibe conclusão térmica, ovulação ou mudança de confiança da HU-013.

O motor térmico continua exclusivamente em modo sombra no backend. A criação apenas
registra a medição; recálculo, versionamento e isolamento da HU-013 seguem as regras
documentadas em `motor-termico-modo-sombra.md` e `motor-termico-recalculo.md`.
