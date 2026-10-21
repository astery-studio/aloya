# CI/CD do Aloya

## Visão geral

O repositório usa gates separados para qualidade, segurança, cobertura e
entrega. Nenhum secret é versionado. Builds de loja são gerados pelo EAS e a
API é empacotada como imagem OCI não-root no GitHub Container Registry (GHCR).

## Integração contínua

O workflow `.github/workflows/ci.yml` roda em pull requests e pushes para
`main` e `develop`, pode ser executado manualmente e também é reutilizado pelos
workflows de entrega.

Os gates obrigatórios são:

- backend: instalação reprodutível, Prisma Client, schema, formatação, lint e
  testes;
- banco: aplicação de todas as migrations em um banco vazio;
- aplicativo: formatação, lint sem warnings, configuração de release, testes,
  compatibilidade Expo e geração dos bundles Android e iOS.

Os workflows adicionais executam CodeQL, revisão de dependências em pull
requests, auditoria periódica de dependências de runtime e publicação de
relatórios de cobertura. A cobertura também bloqueia regressões abaixo do piso
validado de cada aplicação. O audit bloqueia severidade alta no backend e
crítica no frontend. O limite diferente é intencional: advisories altos atuais
do frontend atingem ferramentas transitivas do Expo/Metro/Jest cujas versões
mais recentes ainda não possuem correção upstream; vulnerabilidades críticas
continuam bloqueadas.

Configure a proteção de `main` e `develop` para exigir, no mínimo, os checks
`Backend`, `Database`, `Frontend`, `CodeQL JavaScript` e `Dependency Review`,
além de revisão humana e branches atualizadas antes do merge.

## Segurança dos builds mobile

`frontend/app.config.js` exige `EXPO_PUBLIC_API_URL` HTTPS em preview e
produção, define identificadores nativos estáveis e desabilita tráfego HTTP no
Android. HTTP pode ser habilitado somente no ambiente local de desenvolvimento
com `EXPO_PUBLIC_ALLOW_HTTP_FOR_TESTING=true`.

No EAS, crie os ambientes `preview` e `production` e configure neles:

- `EXPO_PUBLIC_API_URL`: URL HTTPS da API correspondente;
- demais variáveis públicas necessárias ao bundle, nunca credenciais.

Credenciais privadas do Android e iOS devem permanecer no gerenciamento de
credenciais do EAS. O token de automação fica no secret `EXPO_TOKEN` dos
environments homônimos do GitHub.

## Entrega mobile

`frontend/eas.json` contém os perfis:

- `preview`: distribuição interna e APK Android instalável;
- `production`: artefatos de loja com incremento remoto de versão.

`.github/workflows/mobile-build.yml` executa novamente todo o quality gate e:

- em push para `develop`, inicia builds EAS de preview;
- em tags `v*`, inicia builds EAS de produção;
- manualmente, permite escolher perfil e plataforma.

`.github/workflows/mobile-submit.yml` é deliberadamente manual, usa o
environment protegido `production` e envia o build de produção mais recente à
loja escolhida. Exija aprovação nesse environment para impedir publicação sem
revisão. Antes do primeiro uso, gere ou associe no EAS as credenciais de cada
loja e os identificadores dos aplicativos.

## Entrega do backend

`.github/workflows/backend-image.yml` executa o quality gate, gera SBOM e
proveniência e publica a imagem `ghcr.io/<owner>/<repo>-backend`:

- `staging` e `sha-*` em alterações do backend integradas a `develop`;
- `v*` e `sha-*` em tags de versão.

A imagem executa como usuário não-root. O deploy final depende do provedor de
runtime e banco escolhido pelo projeto; conecte o provedor ao pacote GHCR e
injete as variáveis de `backend/.env.example` pelo cofre de secrets dele. O
banco SQLite e os uploads persistentes, se usados, precisam de volume durável;
para múltiplas réplicas, migre para um banco gerenciado antes de escalar.

## Checklist inicial dos ambientes

1. Criar os environments `preview`, `staging` e `production` no GitHub.
2. Exigir aprovação para `production`.
3. Adicionar `EXPO_TOKEN` em `preview` e `production`.
4. Configurar `EXPO_PUBLIC_API_URL` nos ambientes EAS correspondentes.
5. Inicializar as credenciais Android/iOS no EAS com um build local assistido.
6. Configurar as credenciais de submissão das lojas no EAS.
7. Habilitar as regras de proteção e os checks obrigatórios das branches.
8. Conectar o provedor do backend ao pacote GHCR e ao cofre de secrets.
