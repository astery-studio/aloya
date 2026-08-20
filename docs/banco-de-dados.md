# Aloya — Banco de Dados

## 1. O que é um banco de dados?

Banco de dados é o local onde as informações do sistema são armazenadas de maneira persistente.

Por exemplo, quando um usuário cria uma conta, seus dados precisam continuar existindo mesmo depois que o aplicativo for fechado.

---

# 2. Banco utilizado

O Aloya utilizará:

```text
PostgreSQL
```

O PostgreSQL é um banco de dados relacional.

---

# 3. Banco relacional

Um banco relacional organiza os dados em tabelas.

Por exemplo:

```text
USER
────────────────────
id
name
email
password
```

Outra tabela:

```text
CYCLE
────────────────────
id
userId
startDate
endDate
```

O `userId` pode relacionar um ciclo a um usuário.

---

# 4. Entidades

Antes de criar as tabelas, precisamos identificar as entidades do sistema.

Possíveis entidades do Aloya:

```text
User
Cycle
MenstrualRecord
Symptom
Mood
Partner
CommunityPost
```

> **Importante:** essa lista é inicial e deve ser revisada conforme os requisitos definitivos.

---

# 5. Relacionamentos

Os dados possuem relações.

Exemplo:

```text
User
 │
 └── Cycle
       │
       └── MenstrualRecord
```

Um usuário pode possuir vários registros de ciclo.

Isso representa uma relação:

```text
1 usuário → vários ciclos
```

---

# 6. Chaves

## Primary Key

É o identificador único de um registro.

Exemplo:

```text
id = 15
```

Nenhum outro registro deve possuir o mesmo identificador.

---

## Foreign Key

É utilizada para relacionar tabelas.

Exemplo:

```text
Cycle.userId
```

pode apontar para:

```text
User.id
```

---

# 7. Modelagem

Antes de implementar o banco, deve-se criar um modelo contendo:

* entidades;
* atributos;
* tipos;
* relacionamentos;
* regras;
* restrições.

> **TODO:** adicionar diagrama ER do Aloya.

---

# 8. Regras

Algumas informações podem possuir restrições.

Exemplo:

```text
email → deve ser único
password → obrigatória
userId → deve existir
```

Essas regras podem ser aplicadas em diferentes camadas:

```text
Frontend
Backend
Database
```

---

# 9. Migrations

Migration representa uma alteração na estrutura do banco.

Por exemplo:

```text
Banco inicial
      ↓
Adicionar tabela User
      ↓
Migration
      ↓
Adicionar tabela Cycle
      ↓
Migration
```

As migrations permitem acompanhar a evolução do banco ao longo do desenvolvimento.

---

# 10. Segurança

Informações sensíveis não devem ser armazenadas de maneira insegura.

Especialmente:

```text
senhas
tokens
credenciais
DATABASE_URL
```

Senhas devem ser armazenadas utilizando hashing apropriado.

Credenciais do banco devem permanecer em variáveis de ambiente.

---