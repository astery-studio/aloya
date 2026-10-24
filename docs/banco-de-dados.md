# Aloya — Banco de Dados

## 1. Visão geral

O Aloya utiliza um banco de dados relacional para persistir informações da aplicação.

A persistência atual utiliza:

- SQLite;
- Prisma ORM 7;
- `@prisma/client`;
- `@prisma/adapter-better-sqlite3`;
- migrations versionadas.

SQLite armazena o banco em um arquivo local e não exige a instalação de um servidor de banco separado.

## 2. Configuração da conexão

A conexão é definida no arquivo:

```text
backend/.env
```

Configuração usada no desenvolvimento:

```env
DATABASE_URL="file:./prisma/aloya-dev.db"
```

O Prisma lê a variável por meio de:

```text
backend/prisma.config.ts
```

A aplicação cria o cliente com o adaptador Better SQLite 3 em:

```text
backend/src/shared/config/prisma.js
```

## 3. Arquivos principais

```text
backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── prisma.config.ts
└── src/
    └── shared/
        └── config/
            └── prisma.js
```

### `schema.prisma`

Define:

- entidades;
- atributos;
- tipos;
- chaves primárias;
- chaves estrangeiras;
- relacionamentos;
- índices;
- restrições únicas;
- comportamento de exclusão.

### `migrations/`

Contém o histórico versionado das alterações estruturais do banco.

### `prisma.config.ts`

Informa ao Prisma:

- localização do schema;
- localização das migrations;
- URL do datasource.

### `prisma.js`

Cria e exporta a instância compartilhada do `PrismaClient`.

## 4. Entidades principais

O modelo contém entidades relacionadas às seguintes áreas.

### Usuário e autenticação

- `Usuario`;
- `Sessao`;
- `ConfirmacaoEmail`;
- `RecuperacaoSenha`;
- `ConsentimentoParental`.

### Ciclo menstrual

- `RegistroCiclo`;
- `DiaMenstruacao`;
- `Previsao`.

### Diário

- `RegistroDiario`.

### Anticoncepcionais

- `Anticoncepcional`;
- `UsoAnticoncepcional`.

### Rede de apoio

- `CategoriaPermissao`;
- `VinculoRedeApoio`.

### Notificações e suporte

- `PreferenciaNotificacao`;
- `Notificacao`;
- `Conversa`;
- `MensagemSuporte`.

## 5. Relacionamentos

Exemplos de relacionamentos existentes:

```text
Usuario
 ├── Sessao
 ├── RecuperacaoSenha
 ├── RegistroCiclo
 ├── RegistroDiario
 ├── Anticoncepcional
 ├── CategoriaPermissao
 ├── Notificacao
 └── VinculoRedeApoio
```

Um usuário pode possuir vários registros de ciclo:

```text
Usuario 1 → N RegistroCiclo
```

Um usuário pode possuir vários anticoncepcionais:

```text
Usuario 1 → N Anticoncepcional
```

Um anticoncepcional pode possuir vários registros de uso:

```text
Anticoncepcional 1 → N UsoAnticoncepcional
```

As relações utilizam chaves estrangeiras e, quando aplicável, exclusão em cascata.

## 6. Integridade dos dados

O schema contém restrições como:

- e-mail de usuário único;
- token armazenado em formato de hash;
- categoria de permissão única por titular e nome normalizado;
- registro de ciclo único por usuário e data inicial;
- registro de diário único por usuário e data;
- índices para consultas frequentes;
- chaves estrangeiras para garantir relacionamentos válidos.

A validação ocorre em diferentes camadas:

```text
Frontend
   ↓
Validator do backend
   ↓
Regra de negócio
   ↓
Prisma
   ↓
SQLite
```

## 7. Migrations

Migrations registram alterações no schema ao longo do desenvolvimento.

Para criar e aplicar uma migration durante o desenvolvimento:

```bash
npx prisma migrate dev --name nome_da_alteracao
```

Exemplo:

```bash
npx prisma migrate dev --name adicionar_preferencia_visual
```

Para aplicar migrations já existentes:

```bash
npx prisma migrate deploy
```

Para consultar o estado das migrations:

```bash
npx prisma migrate status
```

As migrations devem ser enviadas ao Git.

O arquivo local `.db` não deve ser enviado.

## 8. Prisma Client

Depois de instalar as dependências ou alterar o schema, gere o cliente:

```bash
npx prisma generate
```

Para validar o schema:

```bash
npx prisma validate
```

Para formatar o schema:

```bash
npx prisma format
```

## 9. Prisma Studio

Para inspecionar os dados em uma interface visual:

```bash
npx prisma studio
```

O Prisma Studio deve ser usado apenas em ambiente de desenvolvimento.

## 10. Seed

Quando houver dados iniciais configurados no projeto, o seed pode ser executado com:

```bash
npx prisma db seed
```

Antes de usar esse comando, confirme se `prisma/seed.js` contém os dados que devem ser inseridos.

## 11. Arquivos que não devem ser versionados

Os seguintes arquivos são locais:

```text
backend/.env
backend/prisma/*.db
backend/prisma/*.db-journal
backend/prisma/*.db-shm
backend/prisma/*.db-wal
```

Eles devem permanecer no `.gitignore`.

Devem ser versionados:

```text
backend/.env.example
backend/prisma/schema.prisma
backend/prisma/migrations/
backend/prisma.config.ts
```

## 12. Segurança

O banco pode armazenar dados pessoais e sensíveis. Por isso:

- senhas são persistidas somente como hash;
- tokens puros não devem ser armazenados;
- credenciais permanecem no `.env`;
- respostas HTTP não expõem hashes;
- consultas usam a identidade obtida da sessão;
- dados de uma conta não devem ser retornados para outra conta;
- arquivos locais do banco não devem ser publicados.

## 13. Testes de persistência

A suíte inclui testes com SQLite real para validar migrations, constraints e integração.

Execute:

```bash
npm test
```

Uma suíte aprovada deve terminar sem testes com falha.

## 14. Limitações e evolução

SQLite atende ao ambiente atual de desenvolvimento e à entrega acadêmica.

Se o projeto futuramente migrar para outro banco, serão necessários:

- alteração do datasource;
- troca ou remoção do adaptador SQLite;
- revisão das migrations;
- testes de compatibilidade;
- revisão das instruções de implantação.

Até que essa migração aconteça, toda a documentação deve identificar SQLite como o banco utilizado.