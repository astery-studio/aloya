# Aloya — Prisma

## 1. O que é Prisma?

Prisma é um ORM utilizado para facilitar a comunicação entre o backend e o banco de dados.

ORM significa:

> Object-Relational Mapping

Ele permite representar tabelas do banco através de modelos no código.

---

# 2. Instalação

No backend:

```bash
npm install prisma @prisma/client
```

Inicializar:

```bash
npx prisma init
```

Isso cria:

```text
prisma/
└── schema.prisma

.env
```

---

# 3. `schema.prisma`

O arquivo:

```text
prisma/schema.prisma
```

é responsável por definir a estrutura do banco utilizada pelo Prisma.

Exemplo:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

---

# 4. Model

Um `model` representa uma entidade/tabela.

No exemplo:

```prisma
model User
```

representa usuários.

---

# 5. Campos

Dentro do model são definidos os campos:

```prisma
id       Int
name     String
email    String
password String
```

Cada campo possui um tipo.

Exemplos:

```text
String
Int
Boolean
DateTime
Float
```

---

# 6. Modificadores

Alguns modificadores possuem significados especiais.

### `@id`

Define a chave primária.

```prisma
id Int @id
```

### `@default`

Define um valor padrão.

```prisma
createdAt DateTime @default(now())
```

### `@unique`

Impede valores duplicados.

```prisma
email String @unique
```

---

# 7. Migrations

Depois de alterar o schema:

```bash
npx prisma migrate dev --name nome_da_migration
```

Exemplo:

```bash
npx prisma migrate dev --name create_user
```

---

# 8. Prisma Client

O Prisma Client permite realizar consultas.

Exemplo:

```javascript
const users = await prisma.user.findMany();
```

Para buscar um usuário:

```javascript
const user = await prisma.user.findUnique({
  where: {
    email: email
  }
});
```

---

# 9. Prisma Studio

O Prisma possui uma interface visual para visualizar os dados.

Executar:

```bash
npx prisma studio
```

Ela permite visualizar e manipular os registros do banco durante o desenvolvimento.

---

# 10. Fluxo

```text
schema.prisma
      ↓
Migration
      ↓
PostgreSQL
      ↓
Prisma Client
      ↓
Backend
```

---

# 11. Regra

O Prisma deve ser utilizado como camada de acesso ao banco.

A regra de negócio deve permanecer nos services, e não diretamente nas rotas.

---