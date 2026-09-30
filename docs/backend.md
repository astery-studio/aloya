# Aloya — Backend

## 1. Visão geral

O backend do Aloya é uma API REST responsável por:

- receber e validar requisições;
- aplicar as regras de negócio;
- autenticar pessoas usuárias;
- controlar sessões;
- persistir dados;
- proteger rotas;
- devolver respostas JSON;
- tratar erros de forma centralizada.

## 2. Tecnologias

O backend utiliza:

- Node.js;
- Express 5;
- Prisma ORM 7;
- SQLite;
- `@prisma/adapter-better-sqlite3`;
- JSON Web Token;
- bcrypt;
- Nodemailer;
- Helmet;
- Express Rate Limit.

## 3. Estrutura principal

```text
backend/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── controllers/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── validators/
│   │   └── contraceptives/
│   ├── routes/
│   ├── services/
│   ├── shared/
│   │   ├── config/
│   │   ├── errors/
│   │   ├── middleware/
│   │   └── utils/
│   ├── validators/
│   └── server.js
├── test/
├── .env.example
├── package.json
└── prisma.config.ts
```

## 4. Responsabilidades das camadas

### Routes

As rotas definem os caminhos e métodos HTTP disponíveis.

Exemplos:

```text
POST /auth/login
GET /users/me
PATCH /users/me
GET /api/anticoncepcionais
```

As rotas também aplicam middlewares de autenticação e limites de requisições.

### Controllers

Os controllers:

- recebem a requisição;
- chamam os validators;
- delegam a operação aos services;
- escolhem o status HTTP;
- devolvem a resposta.

Controllers não devem concentrar regras de negócio ou acesso direto ao banco.

### Services

Os services implementam:

- regras de negócio;
- operações com o Prisma;
- transações;
- autenticação;
- controle de sessões;
- integração com e-mail;
- formatação dos resultados.

### Validators

Os validators verificam:

- campos obrigatórios;
- tipos;
- formatos;
- limites;
- campos desconhecidos;
- consistência entre valores.

Dados inválidos normalmente resultam em `422 Unprocessable Entity`.

### Middlewares

O backend possui middlewares para:

- autenticação;
- tratamento global de erros;
- rotas inexistentes;
- rate limiting;
- regras relacionadas ao consentimento parental.

### Shared

A pasta `shared` reúne recursos usados por mais de uma funcionalidade:

- configuração das variáveis de ambiente;
- instância compartilhada do Prisma;
- erros da aplicação;
- middlewares;
- utilitários.

## 5. Fluxo de uma requisição

```text
Aplicativo mobile
        ↓
      Route
        ↓
    Middleware
        ↓
    Controller
        ↓
     Validator
        ↓
      Service
        ↓
      Prisma
        ↓
      SQLite
```

A resposta percorre o fluxo inverso:

```text
SQLite
   ↓
Prisma
   ↓
Service
   ↓
Controller
   ↓
Resposta HTTP
   ↓
Aplicativo mobile
```

## 6. Inicialização do servidor

A entrada principal é:

```text
src/server.js
```

O arquivo:

1. cria a aplicação Express;
2. desativa o cabeçalho `X-Powered-By`;
3. habilita o Helmet;
4. configura JSON com limite de 32 KB;
5. registra as rotas;
6. registra o tratamento de rota inexistente;
7. registra o middleware global de erros;
8. inicia o servidor.

Para executar:

```bash
npm start
```

Para desenvolvimento com reinício automático:

```bash
npm run dev
```

A porta padrão é `3000`.

## 7. Rotas atualmente registradas

Os grupos ativos são:

```text
/auth
/users
/api/anticoncepcionais
```

A relação detalhada dos endpoints está em:

```text
docs/api.md
```

Uma entidade existente no Prisma não está automaticamente disponível pela API. Para isso, é necessário registrar suas rotas em `src/server.js`.

## 8. Banco de dados

O backend utiliza SQLite por meio do Prisma ORM e do adaptador `@prisma/adapter-better-sqlite3`.

A conexão é configurada pela variável:

```env
DATABASE_URL="file:./prisma/aloya-dev.db"
```

O arquivo local do banco não deve ser enviado ao Git porque contém dados do ambiente de desenvolvimento.

As migrations, por outro lado, devem permanecer versionadas.

## 9. Tratamento de erros

O middleware global converte falhas conhecidas em respostas JSON seguras:

```json
{
  "erro": {
    "codigo": "ERRO_APLICACAO",
    "mensagem": "Descrição pública do erro."
  }
}
```

Rotas inexistentes retornam:

```json
{
  "erro": {
    "codigo": "ROTA_NAO_ENCONTRADA",
    "mensagem": "Recurso não encontrado."
  }
}
```

Erros inesperados não devem expor:

- stack trace;
- credenciais;
- tokens;
- hashes;
- detalhes internos do banco.

## 10. Segurança

O backend aplica:

- hash de senhas com bcrypt;
- sessões autenticadas com JWT;
- persistência somente do hash do token de sessão;
- revogação de sessões;
- rate limiting;
- Helmet;
- validação dos dados;
- mensagens neutras em fluxos sensíveis;
- variáveis de ambiente para credenciais;
- proteção contra campos não permitidos.

O arquivo `.env` nunca deve ser versionado.

## 11. Testes

Para executar todos os testes:

```bash
npm test
```

Para acompanhar alterações:

```bash
npm run test:watch
```

Para gerar cobertura:

```bash
npm run test:coverage
```

Os testes abrangem controllers, services, validators, rotas, autenticação, segurança e integração com SQLite.

## 12. Documentos relacionados

- `docs/api.md`: contratos HTTP;
- `docs/banco-de-dados.md`: persistência e modelagem;
- `docs/configuracao.md`: preparação do ambiente;
- `docs/arquitetura.md`: visão arquitetural;
- `docs/frontend.md`: aplicação mobile.