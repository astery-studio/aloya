# CI/CD do Aloya

## Integração contínua

O workflow `.github/workflows/ci.yml` é executado em:

- pull requests destinados a `main` ou `develop`;
- pushes em `main` ou `develop`;
- execução manual pela aba **Actions**.

O workflow publica dois checks independentes:

- `Backend`: instala dependências, gera o Prisma Client, valida o schema
  Prisma e executa os testes;
- `Frontend`: instala dependências e executa todos os testes Jest.

As instalações usam `npm ci` e os arquivos `package-lock.json`, garantindo
que o CI use as mesmas versões de dependências versionadas no repositório.

O check de cobertura ainda não é obrigatório: embora todos os testes passem,
a cobertura atual não alcança os limites globais de 90% definidos no
`frontend/package.json`. Quando esses limites forem atingidos, o comando do
job `Frontend` poderá ser alterado de `npm test` para
`npm run test:coverage`.

As migrations devem ganhar um check próprio quando houver testes de
integração com banco. O comando `prisma migrate deploy` não faz parte deste
CI inicial e deverá ser validado contra o mesmo tipo de banco escolhido para
produção antes de ser usado em deploys.

## Entrega contínua

O deploy não é executado por este workflow. Antes de habilitar CD, o projeto
precisa definir:

- o provedor que hospedará o backend e o banco usado em produção;
- os ambientes `staging` e `production` no GitHub;
- os secrets específicos de cada ambiente;
- o projeto Expo Application Services (EAS) e seus perfis de build.

Após essas decisões, o fluxo recomendado é:

- merge em `develop`: deploy automático do backend em `staging` e build EAS
  de preview;
- tag `v*` criada a partir de `main`: deploy em `production` e build EAS de
  produção, ambos protegidos por aprovação do ambiente.

Secrets nunca devem ser gravados nos arquivos YAML ou no repositório. Eles
devem ser cadastrados em **Settings > Environments** e liberados somente aos
jobs que referenciam o ambiente correspondente.
