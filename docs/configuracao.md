# Aloya — Configuração do Ambiente

## 1. Pré-requisitos

Para executar o projeto, instale:

- Git;
- Node.js;
- npm;
- Expo Go, emulador Android ou simulador iOS, caso queira executar o aplicativo mobile.

O backend utiliza SQLite. Não é necessário instalar um servidor de banco de dados separado.

## 2. Clonar o repositório

```bash
git clone git@github.com:astery-studio/aloya.git
cd aloya
```

## 3. Estrutura do projeto

```text
aloya/
├── backend/
├── docs/
├── frontend/
├── README.md
└── package.json
```

Backend e frontend possuem dependências e comandos próprios.

## 4. Configurar o backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm ci
```

Se o `package-lock.json` ainda estiver sendo atualizado durante o desenvolvimento, também é possível usar:

```bash
npm install
```

Crie o arquivo local `.env` a partir do exemplo.

No PowerShell:

```powershell
Copy-Item .env.example .env
```

No Bash:

```bash
cp .env.example .env
```

O arquivo `.env` não deve ser enviado ao Git.

## 5. Variáveis do backend

Exemplo mínimo baseado em `.env.example`:

```env
PORT=3000
DATABASE_URL="file:./prisma/aloya-dev.db"

JWT_SECRET=troque-por-uma-chave-com-pelo-menos-32-caracteres
JWT_EXPIRES_IN=90d
BCRYPT_ROUNDS=12

PARENTAL_CONSENT_BASE_URL=http://localhost:3000/auth/parental-consent
PASSWORD_RESET_BASE_URL=aloya://reset-password

SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=usuario_smtp
SMTP_PASSWORD=senha_smtp
SMTP_FROM="ALOYA <no-reply@aloya.com>"

CADASTRO_RATE_LIMIT_JANELA_MS=900000
CADASTRO_RATE_LIMIT_MAXIMO=20

EMAIL_RATE_LIMIT_JANELA_MS=900000
EMAIL_RATE_LIMIT_MAXIMO=3

LOGIN_RATE_LIMIT_JANELA_MS=900000
LOGIN_RATE_LIMIT_MAXIMO=5

CONFIGURACOES_CONTA_RATE_LIMIT_JANELA_MS=900000
CONFIGURACOES_CONTA_RATE_LIMIT_MAXIMO=20

ALTERACAO_SENHA_RATE_LIMIT_JANELA_MS=900000
ALTERACAO_SENHA_RATE_LIMIT_MAXIMO=5

EXCLUSAO_CONTA_RATE_LIMIT_JANELA_MS=900000
EXCLUSAO_CONTA_RATE_LIMIT_MAXIMO=5
```

### Regras importantes

- `JWT_SECRET` deve possuir pelo menos 32 bytes;
- `BCRYPT_ROUNDS` deve ser um inteiro entre 10 e 15;
- valores de rate limit devem ser inteiros positivos;
- configurações SMTP são necessárias para fluxos que enviam e-mail;
- segredos reais não devem ser adicionados ao `.env.example`.

## 6. Preparar o SQLite

O banco utilizado é SQLite e sua URL local é:

```env
DATABASE_URL="file:./prisma/aloya-dev.db"
```

Valide o schema:

```bash
npx prisma validate
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Aplique as migrations existentes:

```bash
npx prisma migrate deploy
```

Durante o desenvolvimento, se for necessário criar uma nova migration:

```bash
npx prisma migrate dev --name nome_da_alteracao
```

Consulte o estado das migrations:

```bash
npx prisma migrate status
```

O arquivo SQLite será criado localmente e não deve ser versionado.

## 7. Executar o backend

Modo normal:

```bash
npm start
```

Modo de desenvolvimento:

```bash
npm run dev
```

A API estará disponível em:

```text
http://localhost:3000
```

Para interromper o servidor, pressione:

```text
Ctrl+C
```

## 8. Testar o backend

Em outro terminal:

```bash
cd backend
npm test
```

Para cobertura:

```bash
npm run test:coverage
```

Para conferir rapidamente se o servidor responde, use uma rota pública.

PowerShell:

```powershell
$body = @{
    email = "teste@example.com"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:3000/auth/email-availability" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

Resposta esperada:

```json
{
  "disponivel": true
}
```

O valor pode ser `false` se o e-mail já estiver cadastrado.

## 9. Configurar o frontend

Abra outro terminal e entre na pasta:

```bash
cd frontend
```

Instale as dependências:

```bash
npm ci
```

O aplicativo utiliza a variável:

```env
EXPO_PUBLIC_API_URL
```

Crie `frontend/.env` quando precisar sobrescrever a URL padrão:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

## 10. Endereço da API por ambiente

### Emulador Android

Use:

```text
http://10.0.2.2:3000
```

Esse é o endereço padrão de desenvolvimento presente no aplicativo.

### Simulador iOS

Normalmente:

```text
http://localhost:3000
```

### Navegador no mesmo computador

Use:

```text
http://localhost:3000
```

### Celular físico

Use o IP local do computador:

```text
http://192.168.x.x:3000
```

O celular e o computador devem estar na mesma rede.

O firewall precisa permitir o acesso à porta `3000`.

## 11. Executar o frontend

Inicie o Expo:

```bash
npm start
```

Ou:

```bash
npx expo start
```

Comandos disponíveis:

```bash
npm run android
npm run ios
npm run web
```

A disponibilidade de iOS depende do sistema operacional e das ferramentas instaladas.

## 12. Testar o frontend

```bash
npm test -- --runInBand
```

Para cobertura:

```bash
npm run test:coverage
```

## 13. Ordem recomendada

```text
1. Instalar as dependências do backend
2. Criar backend/.env
3. Validar e gerar o Prisma Client
4. Aplicar as migrations SQLite
5. Iniciar o backend
6. Testar uma rota pública
7. Instalar as dependências do frontend
8. Configurar EXPO_PUBLIC_API_URL, se necessário
9. Iniciar o Expo
```

## 14. Problemas comuns

### `DATABASE_URL não foi configurada`

Confirme a existência de:

```text
backend/.env
```

E a configuração:

```env
DATABASE_URL="file:./prisma/aloya-dev.db"
```

### `JWT_SECRET deve possuir pelo menos 32 caracteres`

Troque o valor de `JWT_SECRET` por uma chave longa e aleatória.

### Erro nas configurações SMTP

Preencha as variáveis `SMTP_*` com credenciais válidas para testar envio de e-mail.

Não publique essas credenciais.

### O frontend não encontra a API

Confira:

- se o backend está executando;
- se a porta é `3000`;
- se `EXPO_PUBLIC_API_URL` está correta;
- se o emulador está usando `10.0.2.2`;
- se o celular e o computador estão na mesma rede;
- se o firewall permite a conexão.

### Erro nas migrations

Execute:

```bash
npx prisma validate
npx prisma migrate status
```

Não apague migrations que já tenham sido compartilhadas.

### Dependências inconsistentes

Prefira:

```bash
npm ci
```

Esse comando instala as versões registradas no `package-lock.json`.

## 15. Arquivos que não devem ser enviados

Não versione:

```text
.env
node_modules/
.expo/
coverage/
*.db
*.db-journal
*.db-shm
*.db-wal
```

Os arquivos `.env.example`, migrations e schemas devem ser versionados.