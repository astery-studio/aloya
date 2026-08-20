# Aloya — Configuração

## 1. Requisitos

Para executar o projeto, é necessário possuir:

* Node.js;
* npm;
* Git;
* Expo;
* PostgreSQL.

---

# 2. Clonando o projeto

```bash
git clone git@github.com:astery-studio/aloya.git
```

Entrar na pasta:

```bash
cd ALOYA
```

---

# 3. Frontend

Entrar na pasta:

```bash
cd frontend
```

Instalar dependências:

```bash
npm install
```

Executar:

```bash
npx expo start
```

---

# 4. Backend

Abrir outro terminal.

```bash
cd backend
```

Instalar:

```bash
npm install
```

Executar:

```bash
npm run dev
```

> **TODO:** definir os scripts definitivos no `package.json`.

---

# 5. Banco de dados

Configurar o PostgreSQL.

Depois configurar:

```text
backend/.env
```

Exemplo:

```env
DATABASE_URL="..."
```

---

# 6. Prisma

Depois de configurar o banco:

```bash
npx prisma migrate dev
```

---

# 7. Prisma Studio

Para visualizar os dados:

```bash
npx prisma studio
```

---

# 8. Ordem para iniciar o projeto

A ordem recomendada é:

```text
1. Banco de dados
       ↓
2. Backend
       ↓
3. Frontend
```

O backend precisa estar funcionando para que o aplicativo consiga realizar requisições reais.

---

# 9. Problemas comuns

### `npm install` não funciona

Verificar:

```bash
node --version
npm --version
```

---

### Banco não conecta

Verificar:

```text
DATABASE_URL
```

no `.env`.

---

### Frontend não conecta na API

Verificar:

* backend está executando?
* endereço da API está correto?
* porta está correta?
* celular/emulador consegue acessar o servidor?

---

# 10. Configuração futura

> **TODO:** adicionar instruções específicas para Android, iOS, emulador e dispositivo físico.

---