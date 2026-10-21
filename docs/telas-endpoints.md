# Aloya — Matriz de Telas, Funcionalidades e Endpoints

## 1. Objetivo

Este documento relaciona as telas do aplicativo mobile às funcionalidades disponíveis e aos endpoints da API REST.

A matriz permite identificar:

- quais telas já estão integradas ao backend;
- quais operações são apenas locais;
- quais endpoints existem, mas ainda não são utilizados por telas;
- quais telas dependem de endpoints ainda não registrados;
- quais fluxos continuam apenas na prototipação.

## 2. Legenda

| Situação | Significado |
|---|---|
| Integrado | A tela chama um endpoint registrado no backend |
| Local | A funcionalidade não precisa acessar a API |
| Parcial | Parte do fluxo está integrada, mas há uma lacuna |
| Backend sem tela | O endpoint existe, mas não está ligado a uma tela atual |
| Frontend sem backend | O frontend tenta chamar uma rota não registrada |
| Planejado | Existe no protótipo ou nos requisitos, mas não na aplicação atual |

## 3. Visão geral do fluxo atual

```text
Boas-vindas
├── Entrar
│   ├── Login
│   └── Recuperar senha
│       └── Redefinir senha
└── Criar conta
    └── Onboarding

Sessão autenticada
└── Configurações
    ├── Configurações de perfil
    │   ├── Editar perfil
    │   ├── Alterar senha
    │   ├── Excluir conta
    │   └── Encerrar sessão
    ├── Anticoncepcionais
    │   ├── Listar anticoncepcionais
    │   └── Cadastrar anticoncepcional
    └── Membros
        └── Nova categoria de permissão
```

No estado atual, a área autenticada começa na tela de Configurações.

As telas de Home, Calendário, Diário e Histórico do Ciclo aparecem na prototipação, mas ainda não estão registradas no fluxo atual de `App.js`.

## 4. Matriz principal

| Tela | Funcionalidade | Método | Endpoint | Autenticação | Situação |
|---|---|---:|---|---:|---|
| Boas-vindas | Abrir login | — | — | Não | Local |
| Boas-vindas | Abrir criação de conta | — | — | Não | Local |
| Login | Autenticar pessoa usuária | `POST` | `/auth/login` | Não | Integrado |
| Login | Abrir recuperação de senha | — | — | Não | Local |
| Login | Abrir criação de conta | — | — | Não | Local |
| Recuperar senha | Solicitar e-mail de recuperação | `POST` | `/auth/password-recovery/request` | Não | Integrado |
| Redefinir senha | Validar token antes da redefinição | `GET` | `/auth/password-recovery/:token` | Não | Parcial |
| Redefinir senha | Salvar nova senha | `POST` | `/auth/password-recovery/reset` | Não | Integrado |
| Onboarding | Verificar disponibilidade do e-mail | `POST` | `/auth/email-availability` | Não | Integrado |
| Onboarding | Criar conta e ciclo inicial | `POST` | `/auth/register` | Não | Integrado |
| Onboarding | Informar e-mail de responsável no cadastro | `POST` | `/auth/register` | Não | Integrado |
| Configurações | Abrir configurações de perfil | — | — | Sim | Local |
| Configurações | Abrir anticoncepcionais | — | — | Sim | Local |
| Configurações | Alternar modo visual | — | — | Sim | Local no estado atual |
| Configurações de perfil | Carregar dados da conta | `GET` | `/users/me` | Sim | Integrado |
| Configurações de perfil | Atualizar dados da conta | `PATCH` | `/users/me` | Sim | Integrado |
| Configurações de perfil | Verificar senha antes de excluir | `POST` | `/users/me/account-deletion/verify-password` | Sim | Integrado |
| Configurações de perfil | Excluir permanentemente a conta | `DELETE` | `/users/me` | Sim | Integrado |
| Configurações de perfil | Encerrar sessão | `POST` | `/auth/logout` | Sim | Integrado |
| Alterar senha | Alterar senha da conta | `PATCH` | `/users/me/password` | Sim | Integrado |
| Anticoncepcionais | Listar anticoncepcionais | `GET` | `/api/anticoncepcionais` | Sim | Integrado |
| Novo anticoncepcional | Cadastrar anticoncepcional | `POST` | `/api/anticoncepcionais` | Sim | Integrado |
| Membros | Exibir área da Rede de Apoio | — | — | Sim | Local/parcial |
| Nova categoria | Criar categoria de permissão | `POST` | `/support-network/permission-categories` | Sim | Frontend sem backend |

## 5. Detalhamento por tela

### 5.1. Boas-vindas

Arquivo principal:

```text
frontend/src/features/auth/screens/WelcomeScreen.jsx
```

Responsabilidades:

- apresentar a entrada do aplicativo;
- abrir o fluxo de login;
- abrir o fluxo de criação de conta.

Não acessa diretamente a API.

Fluxo:

```text
Boas-vindas
├── Entrar → Login
└── Criar conta → Onboarding
```

### 5.2. Login

Arquivo principal:

```text
frontend/src/features/auth/screens/LoginScreen.jsx
```

Serviço:

```text
frontend/src/features/auth/services/authService.js
```

Operação:

```http
POST /auth/login
```

Corpo resumido:

```json
{
  "email": "pessoa@example.com",
  "senha": "senha-segura"
}
```

Em caso de sucesso:

1. a API devolve o token;
2. o token é armazenado no dispositivo;
3. a sessão passa ao estado autenticado;
4. o aplicativo carrega o perfil;
5. a pessoa é direcionada para a área interna.

Situação: **Integrado**.

### 5.3. Recuperar senha

Arquivo principal:

```text
frontend/src/features/auth/screens/ForgotPasswordScreen.jsx
```

Operação:

```http
POST /auth/password-recovery/request
```

Corpo:

```json
{
  "email": "pessoa@example.com"
}
```

A tela também permite reenviar a solicitação utilizando o mesmo endpoint.

Situação: **Integrado**.

### 5.4. Redefinir senha

Arquivo principal:

```text
frontend/src/features/auth/screens/ResetPasswordScreen.jsx
```

Operação usada pela tela:

```http
POST /auth/password-recovery/reset
```

Corpo:

```json
{
  "token": "token-de-recuperacao",
  "senha": "nova-senha-segura"
}
```

O serviço de autenticação também possui suporte para:

```http
GET /auth/password-recovery/:token
```

Entretanto, no fluxo atual de `App.js`, a função `validarTokenRecuperacao` não é repassada à tela. A tela recebe o token do deep link e tenta diretamente a redefinição.

Situação:

- redefinição da senha: **Integrado**;
- validação prévia do token: **Parcial**.

Melhoria futura:

- chamar `GET /auth/password-recovery/:token` ao abrir a tela;
- exibir imediatamente se o link estiver inválido ou expirado;
- permitir solicitar um novo link sem tentar alterar a senha.

### 5.5. Onboarding e criação de conta

Arquivo principal:

```text
frontend/src/features/onboarding/screens/OnboardingScreen.jsx
```

O fluxo utiliza dois endpoints.

#### Verificar e-mail

```http
POST /auth/email-availability
```

Corpo:

```json
{
  "email": "pessoa@example.com"
}
```

#### Criar conta

```http
POST /auth/register
```

O cadastro envia:

- nome;
- data de nascimento;
- e-mail;
- senha;
- início da última menstruação;
- fim opcional da última menstruação;
- parâmetros opcionais do ciclo;
- e-mail opcional de responsável legal.

Após o cadastro:

1. a API cria a pessoa usuária;
2. a API cria o registro inicial do ciclo;
3. a API cria a sessão;
4. o aplicativo armazena o token;
5. o fluxo passa para a área autenticada.

Situação: **Integrado**.

### 5.6. Configurações

Arquivo principal:

```text
frontend/src/features/settings/screens/SettingsScreen.jsx
```

Responsabilidades atuais:

- abrir o perfil;
- abrir o fluxo de anticoncepcionais;
- alternar entre áreas internas;
- exibir opções planejadas.

A navegação entre telas é local e não exige requisição.

Algumas opções visuais ainda não possuem persistência própria na API.

Situação: **Local/parcial**.

### 5.7. Configurações de perfil

Arquivo principal:

```text
frontend/src/features/settings/screens/ProfileSettingsScreen.jsx
```

Serviço:

```text
frontend/src/features/settings/services/accountService.js
```

#### Carregar perfil

```http
GET /users/me
```

A operação ocorre:

- ao restaurar uma sessão;
- ao abrir o perfil sem dados carregados;
- ao tentar novamente após uma falha.

#### Atualizar perfil

```http
PATCH /users/me
```

Campos aceitos pelo frontend:

```json
{
  "nome": "Novo Nome",
  "email": "novo@example.com",
  "dataNascimento": "2000-05-15",
  "identidadeGenero": "Não-binário"
}
```

#### Verificar senha para exclusão

```http
POST /users/me/account-deletion/verify-password
```

Corpo:

```json
{
  "senhaAtual": "senha-atual"
}
```

Essa operação não exclui dados. Ela somente valida a senha antes de mostrar a confirmação final.

#### Excluir conta

```http
DELETE /users/me
```

Corpo enviado pelo serviço:

```json
{
  "senhaAtual": "senha-atual",
  "confirmarExclusao": true
}
```

Depois da exclusão, o token local é removido e a aplicação retorna ao login.

#### Encerrar sessão

```http
POST /auth/logout
```

O aplicativo tenta encerrar a sessão no backend e remove a credencial local.

Situação: **Integrado**.

### 5.8. Alterar senha

Arquivo principal:

```text
frontend/src/features/settings/screens/ChangePasswordScreen.jsx
```

Operação:

```http
PATCH /users/me/password
```

Corpo:

```json
{
  "senhaAtual": "senha-atual",
  "novaSenha": "nova-senha-segura",
  "confirmacaoNovaSenha": "nova-senha-segura"
}
```

Após a alteração:

- a sessão atual permanece ativa;
- outras sessões podem ser encerradas;
- links antigos de recuperação são revogados.

Situação: **Integrado**.

### 5.9. Lista de anticoncepcionais

Arquivos principais:

```text
frontend/src/features/contraceptives/ContraceptiveFlow.jsx
frontend/src/features/contraceptives/screens/ContraceptivesScreen.jsx
```

Operação:

```http
GET /api/anticoncepcionais
```

A listagem é carregada quando o fluxo de anticoncepcionais é aberto.

A API retorna somente os registros pertencentes à pessoa autenticada.

Situação: **Integrado**.

### 5.10. Novo anticoncepcional

Arquivo principal:

```text
frontend/src/features/contraceptives/screens/NewContraceptiveScreen.jsx
```

Operação:

```http
POST /api/anticoncepcionais
```

O corpo pode conter:

```json
{
  "nome": "Meu anticoncepcional",
  "tipo": "pilula",
  "intensidadeAlerta": "critico",
  "horarios": [
    "08:00"
  ],
  "frequenciaId": "pilula_continuo",
  "dataPrimeiroUso": "2026-09-30",
  "dataValidade": null
}
```

Após o cadastro, o novo item é acrescentado à lista exibida.

Situação: **Integrado**.

### 5.11. Membros da Rede de Apoio

Arquivo principal:

```text
frontend/src/features/support-network/screens/MembersScreen.jsx
```

Responsabilidades atuais:

- apresentar a área de membros;
- abrir a criação de categoria;
- permitir a navegação entre abas.

A tela ainda não carrega membros ou categorias do backend.

Situação: **Local/parcial**.

### 5.12. Nova categoria de permissão

Arquivo principal:

```text
frontend/src/features/support-network/screens/NewSupportCategoryScreen.jsx
```

Serviço:

```text
frontend/src/features/support-network/services/supportCategoryService.js
```

O frontend está preparado para chamar:

```http
POST /support-network/permission-categories
```

Corpo:

```json
{
  "nome": "Profissionais de saúde",
  "dadosVisiveis": [
    "geral.fase_atual",
    "geral.historico_ciclo",
    "corpo.sintomas_fisicos",
    "saude.consultas"
  ]
}
```

Porém, no estado atual do backend:

- a rota não está registrada em `src/shared/http/server.js`;
- não existe um grupo `/support-network` montado no servidor atual;
- uma tentativa real de cadastro receberá `404 ROTA_NAO_ENCONTRADA`.

Situação: **Frontend sem backend**.

A correção exige restaurar ou implementar no backend:

- route;
- controller;
- service;
- validator;
- registro no container;
- montagem da rota em `server.js`;
- testes de integração.

Até isso ser feito, o endpoint não deve ser apresentado como funcional na demonstração.

## 6. Endpoints sem tela integrada

A API possui endpoints de consentimento parental que não estão ligados diretamente a telas específicas no fluxo atual.

| Método | Endpoint | Estado |
|---|---|---|
| `GET` | `/auth/parental-consent/status` | Backend sem tela |
| `POST` | `/auth/parental-consent/request` | Backend sem tela |
| `POST` | `/auth/parental-consent/resend` | Backend sem tela |
| `GET` | `/auth/parental-consent/:token` | Aberto pelo navegador do responsável |

O cadastro pode enviar o e-mail do responsável por meio de `POST /auth/register`, mas ainda não há uma tela interna completa para consultar, solicitar ou reenviar consentimento após o cadastro.

## 7. Funcionalidades apenas planejadas

O protótipo possui fluxos que ainda não estão registrados no aplicativo atual.

| Tela ou fluxo | Situação atual da API |
|---|---|
| Home do ciclo | Sem endpoint registrado |
| Calendário menstrual | Sem endpoint registrado |
| Cadastro de menstruação | Sem endpoint registrado |
| Histórico de ciclos | Sem endpoint registrado |
| Diário | Sem endpoint registrado |
| Histórico do diário | Sem endpoint registrado |
| Previsões do ciclo | Sem endpoint registrado |
| Notificações | Sem endpoint registrado |
| Listagem de membros da Rede de Apoio | Sem endpoint registrado |
| Convite de membro | Sem endpoint registrado |
| Edição de categoria de permissão | Sem endpoint registrado |
| Exclusão de categoria de permissão | Sem endpoint registrado |

Essas telas podem ser apresentadas como parte da idealização e do planejamento, mas não devem ser demonstradas como integrações concluídas.

## 8. Cobertura dos métodos HTTP exigidos

A API atual oferece os métodos mínimos solicitados no trabalho.

| Método | Exemplo |
|---|---|
| `GET` | `/users/me` |
| `POST` | `/auth/login` |
| `PATCH` | `/users/me` |
| `DELETE` | `/users/me` |

Assim, o requisito de disponibilizar operações `GET`, `POST`, `PUT` ou `PATCH` e `DELETE` está atendido.

## 9. Fluxos recomendados para demonstração

### Fluxo 1 — Cadastro

```text
Boas-vindas
→ Criar conta
→ Verificar disponibilidade do e-mail
→ Concluir onboarding
→ POST /auth/register
→ Receber token
→ Entrar na área autenticada
```

### Fluxo 2 — Login e perfil

```text
Login
→ POST /auth/login
→ Armazenar token
→ GET /users/me
→ Abrir configurações de perfil
→ PATCH /users/me
```

### Fluxo 3 — Anticoncepcionais

```text
Configurações
→ Anticoncepcionais
→ GET /api/anticoncepcionais
→ Cadastrar novo
→ POST /api/anticoncepcionais
→ Atualizar lista
```

### Fluxo 4 — Alteração de senha

```text
Configurações
→ Perfil
→ Alterar senha
→ PATCH /users/me/password
→ Exibir confirmação
```

### Fluxo 5 — Exclusão de conta

```text
Configurações
→ Perfil
→ Excluir conta
→ POST /users/me/account-deletion/verify-password
→ Confirmar exclusão
→ DELETE /users/me
→ Remover token local
→ Voltar ao login
```

Não utilize a criação de categoria da Rede de Apoio na demonstração enquanto a rota correspondente não estiver registrada no backend.

## 10. Arquivos de referência

### Frontend

```text
frontend/src/App.js
frontend/src/shared/services/api/endpoints.js
frontend/src/features/auth/services/authService.js
frontend/src/features/settings/services/accountService.js
frontend/src/features/contraceptives/services/contraceptiveService.js
frontend/src/features/support-network/services/supportCategoryService.js
```

### Backend

```text
backend/src/shared/http/server.js
backend/src/features/auth/routes/auth.routes.js
backend/src/features/settings/routes/account.routes.js
backend/src/features/auth/routes/logout.routes.js
backend/src/features/contraceptives/contraceptive.routes.js
```

### Documentação relacionada

```text
docs/api.md
docs/backend.md
docs/banco-de-dados.md
docs/configuracao.md
```

## 11. Regra de manutenção

Esta matriz deve ser atualizada quando:

- uma tela for adicionada ou removida;
- um endpoint for adicionado ou removido;
- uma tela começar a consumir uma nova rota;
- o método HTTP de uma operação mudar;
- uma funcionalidade deixar de ser planejada e passar a ser implementada;
- uma integração parcial for concluída.