# Aloya — API

## 1. O que é uma API?

API significa:

> Application Programming Interface

No Aloya, a API permite que o aplicativo mobile converse com o backend.

Exemplo:

```text
Frontend
   ↓
GET /cycles/current
   ↓
Backend
   ↓
Dados
```

---

# 2. REST

A API seguirá o padrão REST.

Os principais métodos HTTP são:

| Método | Utilização           |
| ------ | -------------------- |
| GET    | Buscar informações   |
| POST   | Criar informação     |
| PUT    | Atualizar informação |
| PATCH  | Atualização parcial  |
| DELETE | Excluir informação   |

---

# 3. Exemplo

Para buscar o usuário:

```text
GET /users/me
```

Para criar usuário:

```text
POST /auth/register
```

Para criar um ciclo:

```text
POST /cycles
```

---

# 4. JSON

As informações serão normalmente enviadas em JSON.

Exemplo:

```json
{
  "email": "usuario@email.com",
  "password": "senha"
}
```

---

# 5. Status HTTP

A API utiliza códigos HTTP para indicar o resultado.

### `200 OK`

Operação realizada com sucesso.

### `201 Created`

Novo recurso criado.

### `400 Bad Request`

Dados enviados incorretamente.

### `401 Unauthorized`

Usuário não autenticado.

### `403 Forbidden`

Usuário não possui permissão.

### `404 Not Found`

Recurso não encontrado.

### `500 Internal Server Error`

Erro interno do servidor.

---

# 6. Documentação dos endpoints

Todo endpoint criado deve ser documentado.

Modelo:

```text
## POST /auth/login

Descrição:

Realiza login.

Autenticação:

Não.

Body:

{
  "email": "string",
  "password": "string"
}

Resposta:

200 OK

{
  "token": "string",
  "user": {}
}
```

---

# 7. Endpoints

> **TODO:** preencher conforme as rotas forem implementadas.

| Método | Endpoint          | Descrição       |
| ------ | ----------------- | --------------- |
| POST   | `/auth/register`  | Cadastro        |
| POST   | `/auth/login`     | Login           |
| GET    | `/users/me`       | Usuário atual   |
| GET    | `/cycles/current` | Ciclo atual     |
| POST   | `/cycles`         | Criar ciclo     |
| GET    | `/symptoms`       | Listar sintomas |

---

# 8. Comunicação

O frontend não deve conhecer detalhes do banco.

Ele apenas conhece a API:

```text
React Native
     ↓
API
     ↓
Backend
     ↓
Prisma
     ↓
PostgreSQL
```

---