# Operação das notificações push

## Executar

1. Configure `DATABASE_URL` e os demais parâmetros já usados pela API. No diretório `backend`, execute `npm run db:prepare` e `npm start`.
2. Em outro processo, use o mesmo `DATABASE_URL`, defina `PUSH_ENABLED=true` e execute `npm run push:worker`. Se o projeto EAS exigir autenticação reforçada para push, defina `EXPO_PUSH_ACCESS_TOKEN` no servidor.
3. Para ativar reenvios com política validada, configure `ANTICONCEPCIONAIS_JANELAS_MINUTOS` por ID do anticoncepcional e `PUSH_ANTICONCEPCIONAL_REENVIOS` por ID com as listas `aviso`, `moderados` e `criticos`. Todos os atrasos são minutos positivos, estritamente crescentes e anteriores ao fim da janela. Sem configuração, a política permanece inativa.
4. Para Android, configure o provisionamento FCM v1 no EAS e aponte `GOOGLE_SERVICES_JSON` para o arquivo Android no ambiente de build. Para iOS, configure a chave de APNs e o provisionamento do bundle existente no EAS. Mantenha segredos e arquivos do provedor fora do Git.
5. Instale uma build de desenvolvimento ou distribuição no dispositivo físico, abra o app, autentique-se e conceda a permissão do sistema. Em desenvolvimento use `npm run start:dev-client`. O Expo Go não serve para validar push remoto.

Tickets indicam aceitação pelo Expo. Recibos bem-sucedidos indicam encaminhamento ao provedor nativo. Nenhum desses estados comprova exibição ou leitura. Uma resposta ambígua do provedor não é reenviada automaticamente para reduzir duplicatas. Mudanças de conta, revogação e cancelamentos impedem novas tentativas. Mensagens já aceitas pelo provedor podem permanecer em trânsito até expirar.

## Verificar

- Em desenvolvimento, abra **Configurações → Notificações → Teste de notificações** no celular. Toque em um tipo para solicitar uma prévia na barra nativa. O atalho fica fora do aplicativo de produção. A prévia local verifica apresentação e permissão do sistema sem usar credenciais, backend ou dados da conta.
- Backend: `npm run db:validate-migrations` e `node --test tests/features/notifications/*.test.js`.
- Frontend: `npm run config:validate` e `npm test -- tests/features/notifications tests/app/App.integration.test.jsx`.
- Aparelhos físicos: confira Android e iOS em primeiro plano, segundo plano, fechado normalmente e com a tela bloqueada. Repita com permissão negada, dois dispositivos, troca de conta, logout, token renovado e reinstalação.
- Use um convite real entre contas de teste ou um lembrete com horário próximo. Confira a barra do sistema, o toque, a sessão correta, o cancelamento por preferência e a revogação. Para uma execução sem internet, observe a validade do aviso e o recibo disponível no backend.
