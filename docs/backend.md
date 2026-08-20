# Aloya — Backend

## 1. O que é o backend?

Backend é a parte do sistema responsável pelo processamento das informações.

Enquanto o frontend apresenta a interface, o backend:

* recebe requisições;
* processa informações;
* aplica regras de negócio;
* acessa o banco;
* autentica usuários;
* retorna respostas.

---

# 2. Tecnologias

O backend será desenvolvido utilizando:

* Node.js;
* Express;
* Prisma;
* PostgreSQL.

---

# 3. Estrutura

A estrutura planejada:

```text
backend/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   ├── config/
│   └── server.js
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── .env
├── .env.example
├── package.json
└── README.md
```

---

# 4. Inicialização

Entrar na pasta:

```bash
cd backend
```

Inicializar o Node:

```bash
npm init -y
```

Instalar Express:

```bash
npm install express
```

Instalar outras dependências:

```bash
npm install cors dotenv
```

Para desenvolvimento:

```bash
npm install -D nodemon
```

---

# 5. Server

O arquivo:

```text
src/server.js
```

será responsável por iniciar o servidor.

O servidor deverá:

1. criar a aplicação Express;
2. configurar middlewares;
3. registrar rotas;
4. iniciar a aplicação.

---

# 6. Routes

Routes definem os caminhos da API.

Exemplo:

```text
routes/
├── authRoutes.js
├── userRoutes.js
├── cycleRoutes.js
└── communityRoutes.js
```

Uma rota pode ser:

```text
POST /auth/login
```

---

# 7. Controllers

Controllers recebem as requisições.

Exemplo:

```text
authController.js
```

Pode possuir funções como:

```text
register()
login()
logout()
```

O controller não deve concentrar toda a regra de negócio.

---

# 8. Services

Services possuem a lógica de negócio.

Exemplo:

```text
authService.js
```

Pode ser responsável por:

* procurar usuário;
* verificar senha;
* gerar token;
* criar usuário.

---

# 9. Validators

Validators verificam se os dados recebidos estão corretos.

Por exemplo:

```text
email é válido?
senha foi informada?
nome foi informado?
```

A validação deve ocorrer antes de tentar executar operações desnecessárias.

---

# 10. Middlewares

Middlewares são funções executadas durante o processamento de uma requisição.

Exemplo:

```text
Request
   ↓
Auth Middleware
   ↓
Controller
```

Um middleware de autenticação pode verificar se o usuário está autenticado antes de permitir acesso a uma rota.

---

# 11. Fluxo

A estrutura principal será:

```text
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Prisma
   ↓
Database
```

E:

```text
Database
   ↓
Prisma
   ↓
Service
   ↓
Controller
   ↓
Response
```

---