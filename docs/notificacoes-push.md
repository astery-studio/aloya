# Notificações push do Aloya

O aplicativo recebe notificações nativas por Expo Push. O Expo encaminha para FCM v1 no Android e APNs no iOS. O backend mantém a agenda e o histórico de processamento no SQLite. O toque no aviso resolve o destino pela sessão autenticada, dentro das telas existentes.

```mermaid
flowchart LR
    App["App Expo"] -->|"Token e fuso"| API["API autenticada"]
    Dominios["Ciclo, Diário, Anticoncepcional, Rede e Conta"] --> Agenda["Agenda persistente"]
    API --> Agenda
    API --> Dispositivos["Dispositivos e sessões"]
    Agenda --> Worker
    Dispositivos --> Worker["Worker push"]
    Worker --> Expo["Expo Push"]
    Expo --> FCM["Android · FCM"]
    Expo --> APNs["iOS · APNs"]
    Expo -->|"Ticket e recibo"| Worker
    Worker --> Entregas["Auditoria por dispositivo"]
```

```mermaid
flowchart TD
    P["Planejar ocorrência com dados atuais"] --> A["Agendada"]
    A --> C["Reivindicar no SQLite"]
    C --> V{"Preferência, origem, acesso e sessão válidos?"}
    V -- Não --> X["Cancelada ou expirada"]
    V -- Sim --> D["Uma entrega por vínculo de dispositivo"]
    D --> E["Enviar ao Expo"]
    E -->|"Rejeição transitória confirmada"| R["Retentar com backoff"]
    R --> V
    E -->|"Ticket aceito"| T["Consultar recibo"]
    T -->|"Recibo OK"| F["Encaminhada a FCM ou APNs"]
    E -->|"Rejeição permanente ou resposta ambígua"| G["Falha auditável"]
```

## Contratos

| Rota | Uso |
|---|---|
| `GET /api/preferencias-notificacao` | Preferências salvas e estado efetivo por evento |
| `GET /api/preferencias-notificacao/padroes` | Padrões e grupos do catálogo |
| `PATCH /api/preferencias-notificacao` | Atualização de um campo por `{ chave, valor }` |
| `POST /api/preferencias-notificacao/restaurar` | Restaura os padrões da conta |
| `POST /api/dispositivos-notificacao` | Registra `instalacao`, `token`, `plataforma` e `fuso` na sessão atual |
| `GET /api/dispositivos-notificacao` | Lista dispositivos da conta, com identificador, plataforma e atualização |
| `DELETE /api/dispositivos-notificacao/:id` | Desvincula um dispositivo da própria conta |
| `GET /api/dispositivos-notificacao/destino/:id` | Resolve destino após conferir conta e autorização |

O catálogo de tipos usa as chaves do catálogo de preferências. A versão é inicializada sem duplicação na tabela `CatalogoNotificacao` pelo worker ou na consulta de padrões. A preferência efetiva combina categoria, grupo e evento. Os desligamentos preservam valores individuais e cancelam itens persistidos identificados. Usuários têm somente acesso às próprias configurações e dispositivos.

`Notificacao` guarda evento, ocorrência, origem, horário UTC e status da agenda. A combinação destinatário, evento e ocorrência é única. `DispositivoPush` vincula uma instalação e um token a uma conta e sessão. `EntregaPush` grava o vínculo vigente, tentativas, erro sanitizado, ticket e recibo. Uma troca de conta ou token gera um novo vínculo e invalida entregas pendentes do anterior. Uma sessão revogada bloqueia novas entregas.

## Cobertura e regras

- **Ciclo e Previsões:** proximidade, pedido de confirmação na data estimada, fases, dicas educativas, lembrete de diário, resumo semanal e comparação quando há registros nas duas semanas.
- **Anticoncepcional:** horário da agenda, pausas, retomadas, eventos por método e validade. O agendador usa os dados cadastrados e verifica usos já confirmados. A antecedência legada de troca é de 7 dias.
- **Reenvios de Anticoncepcional:** implementados por configuração explícita de janela e atrasos. Sem dados validados, o worker mantém somente os alertas independentes dessa janela. Um registro sem confirmação indica apenas ausência de confirmação no app.
- **Rede de Apoio:** eventos de convite, atualização e revogação, exclusão de conta, registro e resumo de ciclo, resumos por permissão de diário e eventos de anticoncepcional compartilhado. O backend confere o vínculo e as permissões novamente antes do envio. Os avisos de resumo indicam que há dados autorizados no domínio correspondente.
- **Consentimento:** aprovação e expiração da solicitação. O fluxo existente envia por e-mail a solicitação ao responsável. O domínio não implementa recusa explícita pelo responsável.
- **Segurança:** alteração de senha, alteração de e-mail, recuperação, redefinição e nova instalação quando há outro dispositivo da conta. O e-mail existente continua responsável pelo link de recuperação. Ao redefinir a senha, a revogação de todas as sessões impede novos pushes para vínculos revogados.

Os templates usam o protótipo de push atualizado, incluindo variantes de resposta ao convite e os exemplos da HU-034 a HU-037. O padrão é título e corpo discretos com somente o ID do aviso no payload de navegação. Para uma conta adulta, a API permite optar por `previaDetalhada` onde existe template detalhado. O protótipo de preferências não oferece um controle para essa opção. Alertas com conteúdo sensível, mensagens de menores e detalhes sem fonte autorizada mantêm uma variante discreta. A barra, o agrupamento, a aparência e a visibilidade do banner pertencem ao sistema operacional.

Consulte o [procedimento de execução e verificação](notificacoes-push-operacao.md).
