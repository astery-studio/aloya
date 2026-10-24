# Aloya — Documentação da API REST

## 1. Visão geral

A API do Aloya permite que o aplicativo mobile se comunique com o backend para realizar autenticação, gerenciamento da conta, recuperação de senha, consentimento parental e gerenciamento de anticoncepcionais.

A aplicação utiliza:

- Node.js;
- Express;
- Prisma ORM;
- SQLite;
- JSON para entrada e saída de dados;
- autenticação com token Bearer.

## 2. URL base

Em ambiente local:

```text
http://localhost:3000
```

Exemplo:

```text
POST http://localhost:3000/auth/login
```

## 3. Formato das requisições

As requisições que possuem corpo devem utilizar:

```http
Content-Type: application/json
```

Exemplo:

```json
{
  "email": "pessoa@example.com",
  "senha": "senha-segura"
}
```

O servidor limita o corpo JSON a 32 KB.

## 4. Autenticação

As rotas protegidas exigem um token de sessão no cabeçalho `Authorization`:

```http
Authorization: Bearer <token>
```

O token é devolvido após um cadastro ou login bem-sucedido.

Exemplo de autenticação:

```json
{
  "autenticacao": {
    "token": "token-jwt",
    "tipo": "Bearer"
  }
}
```

Cadastro e login também aceitam opcionalmente o nome do dispositivo:

```http
X-Device-Name: Android da pessoa usuária
```

O valor é limitado a 120 caracteres.

## 5. Formato dos erros

Os erros controlados seguem este formato:

```json
{
  "erro": {
    "codigo": "ERRO_VALIDACAO",
    "mensagem": "Existem campos inválidos.",
    "detalhes": [
      {
        "campo": "email",
        "mensagem": "Informe um e-mail válido."
      }
    ]
  }
}
```

O campo `detalhes` aparece principalmente em erros de validação.

Erros não tratados retornam uma mensagem pública segura:

```json
{
  "erro": {
    "codigo": "ERRO_INTERNO",
    "mensagem": "Ocorreu um erro interno. Tente novamente."
  }
}
```

## 6. Códigos HTTP utilizados

| Código | Significado |
|---:|---|
| `200 OK` | Operação concluída com resposta JSON ou HTML |
| `201 Created` | Recurso criado |
| `204 No Content` | Operação concluída sem corpo de resposta |
| `400 Bad Request` | Token ou link inválido |
| `401 Unauthorized` | Credenciais ou sessão inválidas |
| `403 Forbidden` | Pessoa autenticada sem autorização para a operação |
| `404 Not Found` | Recurso ou rota não encontrado |
| `409 Conflict` | Conflito com o estado atual ou dado já existente |
| `410 Gone` | Link expirado ou indisponível |
| `422 Unprocessable Entity` | Dados recebidos não passaram pela validação |
| `429 Too Many Requests` | Limite de requisições excedido |
| `500 Internal Server Error` | Erro inesperado no servidor |
| `502 Bad Gateway` | Falha de integração, como envio de e-mail |

## 7. Resumo dos endpoints

### Autenticação e recuperação

| Método | Endpoint | Autenticação | Descrição |
|---|---|---:|---|
| `POST` | `/auth/register` | Não | Criar conta |
| `POST` | `/auth/login` | Não | Iniciar sessão |
| `POST` | `/auth/email-availability` | Não | Verificar disponibilidade de e-mail |
| `POST` | `/auth/password-recovery/request` | Não | Solicitar recuperação de senha |
| `GET` | `/auth/password-recovery/:token` | Não | Validar token de recuperação |
| `POST` | `/auth/password-recovery/reset` | Não | Redefinir senha |
| `POST` | `/auth/logout` | Sim | Encerrar a sessão atual |

### Consentimento parental

| Método | Endpoint | Autenticação | Descrição |
|---|---|---:|---|
| `GET` | `/auth/parental-consent/status` | Sim | Consultar situação do consentimento |
| `POST` | `/auth/parental-consent/request` | Sim | Solicitar consentimento |
| `POST` | `/auth/parental-consent/resend` | Sim | Reenviar pedido de consentimento |
| `GET` | `/auth/parental-consent/:token` | Não | Confirmar consentimento pelo link |

### Conta

| Método | Endpoint | Autenticação | Descrição |
|---|---|---:|---|
| `GET` | `/users/me` | Sim | Consultar dados da conta |
| `PATCH` | `/users/me` | Sim | Atualizar dados da conta |
| `PATCH` | `/users/me/password` | Sim | Alterar senha |
| `POST` | `/users/me/account-deletion/verify-password` | Sim | Verificar senha antes da exclusão |
| `DELETE` | `/users/me` | Sim | Excluir permanentemente a conta |

### Anticoncepcionais

| Método | Endpoint | Autenticação | Descrição |
|---|---|---:|---|
| `GET` | `/api/anticoncepcionais` | Sim | Listar anticoncepcionais |
| `POST` | `/api/anticoncepcionais` | Sim | Cadastrar anticoncepcional |

---

# 8. Autenticação

## 8.1. Criar conta

```http
POST /auth/register
```

### Autenticação

Não exigida.

### Cabeçalho opcional

```http
X-Device-Name: Android da pessoa usuária
```

### Corpo

```json
{
  "nome": "Pessoa Usuária",
  "dataNascimento": "2000-05-15",
  "email": "pessoa@example.com",
  "senha": "senha-segura",
  "dataInicioUltimaMenstruacao": "2026-09-20",
  "dataFimUltimaMenstruacao": "2026-09-24",
  "duracaoCicloInformada": 28,
  "duracaoMenstruacaoInformada": 5,
  "duracaoLuteaInformada": 14,
  "emailResponsavelLegal": null
}
```

### Campos

| Campo | Tipo | Obrigatório | Regra principal |
|---|---|---:|---|
| `nome` | string | Sim | Entre 3 e 120 caracteres; letras, espaços e hífens |
| `dataNascimento` | `YYYY-MM-DD` | Sim | Data válida e não futura |
| `email` | string | Sim | E-mail válido e único |
| `senha` | string | Sim | Entre 8 e 128 caracteres |
| `dataInicioUltimaMenstruacao` | `YYYY-MM-DD` | Sim | Data válida e não futura |
| `dataFimUltimaMenstruacao` | `YYYY-MM-DD` | Não | Deve ser igual ou posterior ao início e não futura |
| `duracaoCicloInformada` | inteiro | Não | Inteiro positivo |
| `duracaoMenstruacaoInformada` | inteiro | Não | Menor que a duração do ciclo |
| `duracaoLuteaInformada` | inteiro | Não | Compatível com as demais durações |
| `emailResponsavelLegal` | string ou `null` | Não | E-mail diferente do e-mail da pessoa titular |

### Resposta de sucesso

Status: `201 Created`

```json
{
  "usuario": {
    "id": 1,
    "nome": "Pessoa Usuária",
    "email": "pessoa@example.com",
    "papel": "principal",
    "statusConta": "ativa"
  },
  "autenticacao": {
    "token": "token-jwt",
    "tipo": "Bearer"
  },
  "cicloInicial": {
    "id": 1,
    "dataInicio": "2026-09-20T00:00:00.000Z",
    "dataFim": "2026-09-24T00:00:00.000Z"
  },
  "consentimentoParental": {
    "exigidoParaRedeApoio": false,
    "solicitado": false,
    "redeApoioBloqueada": false,
    "emailEnviado": false,
    "mensagemEnvio": null
  },
  "mensagem": "Boas-vindas ao ALOYA, Pessoa Usuária."
}
```

### Possíveis respostas

| Status | Código ou motivo |
|---:|---|
| `201` | Conta criada |
| `409` | `EMAIL_JA_CADASTRADO` |
| `422` | `ERRO_VALIDACAO` |
| `429` | Limite de cadastros excedido |
| `500` | Erro interno |

## 8.2. Realizar login

```http
POST /auth/login
```

### Autenticação

Não exigida.

### Corpo

```json
{
  "email": "pessoa@example.com",
  "senha": "senha-segura"
}
```

### Resposta de sucesso

Status: `200 OK`

```json
{
  "usuario": {
    "id": 1,
    "nome": "Pessoa Usuária",
    "email": "pessoa@example.com",
    "papel": "principal"
  },
  "autenticacao": {
    "token": "token-jwt",
    "tipo": "Bearer"
  }
}
```

### Possíveis respostas

| Status | Código ou motivo |
|---:|---|
| `200` | Login concluído |
| `401` | `CREDENCIAIS_INVALIDAS` |
| `422` | `ERRO_VALIDACAO` |
| `429` | Limite de tentativas excedido |
| `500` | Erro interno |

## 8.3. Verificar disponibilidade do e-mail

```http
POST /auth/email-availability
```

### Autenticação

Não exigida.

### Corpo

```json
{
  "email": "pessoa@example.com"
}
```

### Resposta

Status: `200 OK`

```json
{
  "disponivel": true
}
```

O valor será `false` quando o e-mail já pertencer a uma conta.

### Possíveis respostas

| Status | Motivo |
|---:|---|
| `200` | Consulta concluída |
| `422` | E-mail inválido |
| `429` | Limite de consultas excedido |

---

# 9. Recuperação de senha

## 9.1. Solicitar recuperação

```http
POST /auth/password-recovery/request
```

### Autenticação

Não exigida.

### Corpo

```json
{
  "email": "pessoa@example.com"
}
```

### Resposta

Status: `200 OK`

```json
{
  "mensagem": "Se este e-mail estiver cadastrado, você receberá as instruções em breve."
}
```

A resposta é intencionalmente neutra e não informa se o e-mail está cadastrado.

### Possíveis respostas

| Status | Motivo |
|---:|---|
| `200` | Solicitação processada |
| `422` | E-mail inválido |
| `429` | Limite de solicitações excedido |
| `500` | Erro interno |

## 9.2. Validar token de recuperação

```http
GET /auth/password-recovery/:token
```

### Autenticação

Não exigida.

### Parâmetro de URL

| Parâmetro | Descrição |
|---|---|
| `token` | Token recebido no fluxo de recuperação |

### Resposta de sucesso

Status: `200 OK`

```json
{
  "valido": true
}
```

### Possíveis respostas

| Status | Código |
|---:|---|
| `200` | Token válido |
| `400` | `LINK_RECUPERACAO_INVALIDO` |

## 9.3. Redefinir senha

```http
POST /auth/password-recovery/reset
```

### Autenticação

Não exigida.

### Corpo

```json
{
  "token": "token-de-recuperacao",
  "senha": "nova-senha-segura"
}
```

### Regras

- `token` é obrigatório;
- `senha` deve possuir entre 8 e 128 caracteres;
- após a redefinição, as sessões existentes são revogadas;
- o token é marcado como utilizado.

### Resposta de sucesso

Status: `200 OK`

```json
{
  "mensagem": "Senha redefinida com sucesso. Faça login com sua nova senha."
}
```

### Possíveis respostas

| Status | Código ou motivo |
|---:|---|
| `200` | Senha redefinida |
| `400` | `LINK_RECUPERACAO_INVALIDO` |
| `422` | `ERRO_VALIDACAO` |
| `429` | Limite de solicitações excedido |

---

# 10. Consentimento parental

## 10.1. Consultar situação do consentimento

```http
GET /auth/parental-consent/status
```

### Autenticação

Obrigatória.

```http
Authorization: Bearer <token>
```

### Corpo

Não possui.

### Exemplo de resposta pendente

Status: `200 OK`

```json
{
  "acessoLiberado": false,
  "motivo": "CONSENTIMENTO_NECESSARIO",
  "consentimentoNecessario": true,
  "emailResponsavelInformado": true,
  "emailResponsavelLegal": "responsavel@example.com",
  "statusConsentimento": "pendente"
}
```

### Exemplo de resposta liberada por idade

```json
{
  "acessoLiberado": true,
  "motivo": "MAIOR_DE_16_ANOS",
  "consentimentoNecessario": false,
  "emailResponsavelInformado": false,
  "emailResponsavelLegal": null,
  "statusConsentimento": "revogado"
}
```

## 10.2. Solicitar consentimento

```http
POST /auth/parental-consent/request
```

### Autenticação

Obrigatória.

### Corpo

```json
{
  "emailResponsavelLegal": "responsavel@example.com"
}
```

### Resposta de sucesso

Status: `200 OK`

```json
{
  "emailEnviado": true,
  "acessoRedeApoioLiberado": false,
  "statusConsentimento": "pendente",
  "mensagem": "Enviamos um pedido de autorização para o e-mail informado. Assim que o responsável confirmar, a Rede de Apoio será liberada."
}
```

### Possíveis respostas

| Status | Código ou motivo |
|---:|---|
| `200` | Solicitação enviada ou acesso já liberado |
| `404` | `USUARIO_NAO_ENCONTRADO` |
| `422` | Dados inválidos ou e-mail igual ao da pessoa titular |
| `502` | `FALHA_ENVIO_EMAIL` |

## 10.3. Reenviar consentimento

```http
POST /auth/parental-consent/resend
```

### Autenticação

Obrigatória.

### Corpo com novo e-mail

```json
{
  "emailResponsavelLegal": "novo-responsavel@example.com"
}
```

### Corpo para reutilizar o último e-mail

```json
{}
```

### Resposta de sucesso

Status: `200 OK`

```json
{
  "emailEnviado": true,
  "acessoRedeApoioLiberado": false,
  "statusConsentimento": "pendente",
  "mensagem": "Enviamos um pedido de autorização para o e-mail informado. Assim que o responsável confirmar, a Rede de Apoio será liberada."
}
```

### Possíveis respostas

| Status | Código |
|---:|---|
| `200` | Reenvio concluído |
| `409` | `CONSENTIMENTO_NAO_NECESSARIO` |
| `409` | `CONSENTIMENTO_NAO_PENDENTE` |
| `422` | `EMAIL_RESPONSAVEL_NECESSARIO` |
| `502` | `FALHA_ENVIO_EMAIL` |

## 10.4. Confirmar consentimento

```http
GET /auth/parental-consent/:token
```

### Autenticação

Não exigida. A rota é aberta pelo link enviado ao responsável legal.

### Resposta de sucesso

Status: `200 OK`

O endpoint retorna uma página HTML confirmando a autorização.

### Possíveis respostas

| Status | Código |
|---:|---|
| `200` | Consentimento confirmado ou já liberado |
| `400` | `LINK_CONSENTIMENTO_INVALIDO` |
| `410` | `LINK_CONSENTIMENTO_INDISPONIVEL` |
| `410` | `LINK_CONSENTIMENTO_EXPIRADO` |

---

# 11. Sessão

## 11.1. Encerrar sessão

```http
POST /auth/logout
```

### Autenticação

Obrigatória.

### Corpo

Não possui.

### Resposta de sucesso

Status: `204 No Content`

A resposta não possui corpo.

### Possíveis respostas

| Status | Código |
|---:|---|
| `204` | Sessão encerrada |
| `401` | `SESSAO_INVALIDA` |

---

# 12. Conta

## 12.1. Consultar configurações

```http
GET /users/me
```

### Autenticação

Obrigatória.

### Corpo

Não possui.

### Resposta de sucesso

Status: `200 OK`

```json
{
  "configuracoes": {
    "id": 1,
    "nome": "Pessoa Usuária",
    "email": "pessoa@example.com",
    "identidadeGenero": null,
    "dataNascimento": "2000-05-15",
    "atualizadoEm": "2026-09-30T12:00:00.000Z"
  }
}
```

### Possíveis respostas

| Status | Código |
|---:|---|
| `200` | Consulta concluída |
| `401` | Sessão inválida |
| `404` | `CONTA_NAO_ENCONTRADA` |

## 12.2. Atualizar configurações

```http
PATCH /users/me
```

### Autenticação

Obrigatória.

### Corpo

Todos os campos são opcionais, mas pelo menos um deve ser informado.

```json
{
  "nome": "Novo Nome",
  "email": "novo@example.com",
  "identidadeGenero": "Não-binário",
  "dataNascimento": "2000-05-15"
}
```

Campos internos, como `papel`, `statusConta` e `usuarioId`, não são aceitos.

### Resposta de sucesso

Status: `200 OK`

```json
{
  "mensagem": "Dados atualizados com sucesso.",
  "configuracoes": {
    "id": 1,
    "nome": "Novo Nome",
    "email": "novo@example.com",
    "identidadeGenero": "Não-binário",
    "dataNascimento": "2000-05-15",
    "atualizadoEm": "2026-09-30T12:10:00.000Z"
  },
  "consentimentoParentalNecessario": false
}
```

### Possíveis respostas

| Status | Código |
|---:|---|
| `200` | Dados atualizados |
| `404` | `CONTA_NAO_ENCONTRADA` |
| `409` | `EMAIL_JA_CADASTRADO` |
| `422` | `ERRO_VALIDACAO` ou `NENHUMA_ALTERACAO` |

## 12.3. Alterar senha

```http
PATCH /users/me/password
```

### Autenticação

Obrigatória.

### Corpo

```json
{
  "senhaAtual": "senha-atual",
  "novaSenha": "nova-senha-segura",
  "confirmacaoNovaSenha": "nova-senha-segura"
}
```

### Regras

- a senha atual é obrigatória;
- a nova senha deve possuir pelo menos 8 caracteres;
- a nova senha deve ser diferente da atual;
- a confirmação deve ser igual à nova senha;
- a sessão atual permanece ativa;
- outras sessões são encerradas.

### Resposta de sucesso

Status: `200 OK`

```json
{
  "mensagem": "Senha atualizada com sucesso.",
  "outrasSessoesEncerradas": 2
}
```

### Possíveis respostas

| Status | Código |
|---:|---|
| `200` | Senha atualizada |
| `401` | `SENHA_ATUAL_INCORRETA` ou sessão inválida |
| `409` | `SENHA_ALTERADA_CONCORRENTEMENTE` |
| `422` | `ERRO_VALIDACAO` ou `NOVA_SENHA_IGUAL_ATUAL` |

## 12.4. Verificar senha para exclusão

```http
POST /users/me/account-deletion/verify-password
```

### Autenticação

Obrigatória.

### Corpo

```json
{
  "senhaAtual": "senha-atual"
}
```

### Resposta de sucesso

Status: `204 No Content`

A resposta não possui corpo e não altera a conta.

### Possíveis respostas

| Status | Código |
|---:|---|
| `204` | Senha confirmada |
| `401` | Senha ou sessão inválida |
| `422` | `ERRO_VALIDACAO` |

## 12.5. Excluir conta

```http
DELETE /users/me
```

### Autenticação

Obrigatória.

### Corpo

```json
{
  "senhaAtual": "senha-atual",
  "confirmarExclusao": true
}
```

### Comportamento

- exige confirmação explícita;
- remove a conta autenticada;
- remove os dados relacionados por meio das relações configuradas;
- encerra os vínculos aplicáveis;
- não retorna senha, hash, token ou dados pessoais excluídos.

### Resposta de sucesso

Status: `200 OK`

```json
{
  "mensagem": "Sua conta foi excluída com sucesso."
}
```

### Possíveis respostas

| Status | Código |
|---:|---|
| `200` | Conta excluída |
| `401` | Senha ou sessão inválida |
| `403` | Papel sem permissão para a operação |
| `409` | `CONTA_ALTERADA_CONCORRENTEMENTE` |
| `422` | Confirmação ausente ou inválida |

---

# 13. Anticoncepcionais

Todas as rotas desta seção exigem autenticação.

## 13.1. Listar anticoncepcionais

```http
GET /api/anticoncepcionais
```

### Corpo

Não possui.

### Resposta de sucesso

Status: `200 OK`

```json
{
  "anticoncepcionais": [
    {
      "id": 1,
      "nome": "Meu anticoncepcional",
      "tipo": "pilula",
      "horarios": [
        "08:00"
      ],
      "frequenciaId": "pilula_continuo",
      "dataPrimeiroUso": "2026-09-30",
      "dataValidade": null,
      "intensidadeAlerta": "critico",
      "periodosPausa": [],
      "proximoUsoPrevisto": "2026-10-01T08:00:00.000Z",
      "criadoEm": "2026-09-30T12:00:00.000Z"
    }
  ]
}
```

A listagem contém somente os anticoncepcionais pertencentes à pessoa autenticada.

## 13.2. Cadastrar anticoncepcional

```http
POST /api/anticoncepcionais
```

### Exemplo para pílula

```json
{
  "nome": "Meu anticoncepcional",
  "tipo": "pilula",
  "frequenciaId": "pilula_continuo",
  "horarios": [
    "08:00"
  ],
  "dataPrimeiroUso": "2026-09-30",
  "intensidadeAlerta": "critico"
}
```

### Exemplo para DIU hormonal

```json
{
  "nome": "Meu DIU",
  "tipo": "diu_hormonal",
  "dataValidade": "2031-09-30",
  "intensidadeAlerta": "leve"
}
```

### Tipos aceitos

- `pilula`
- `injetavel`
- `adesivo`
- `anel_vaginal`
- `diu_hormonal`

### Intensidades de alerta

- `leve`
- `moderado`
- `critico`

Quando não informada, a intensidade padrão é `critico`.

### Frequências aceitas

#### Pílula

- `pilula_21_7`
- `pilula_24_4`
- `pilula_12_1`
- `pilula_continuo`

#### Injetável

- `injetavel_mensal`
- `injetavel_bimestral`
- `injetavel_trimestral`

#### Adesivo

- `adesivo_continuo`
- `adesivo_3_1`

#### Anel vaginal

- `anel_21`
- `anel_28`
- `anel_3_1`

### Regras principais

- `nome` é obrigatório e possui no máximo 120 caracteres;
- horários devem usar o formato `HH:mm`;
- são aceitos no máximo 24 horários;
- horários repetidos são rejeitados;
- tipos não diários aceitam exatamente um horário;
- frequências com pausa exigem `dataPrimeiroUso`;
- DIU hormonal não utiliza horários ou frequência;
- DIU hormonal exige `dataValidade` igual ou posterior à data atual.

### Resposta de sucesso

Status: `201 Created`

```json
{
  "mensagem": "Anticoncepcional cadastrado com sucesso.",
  "anticoncepcional": {
    "id": 1,
    "nome": "Meu anticoncepcional",
    "tipo": "pilula",
    "horarios": [
      "08:00"
    ],
    "frequenciaId": "pilula_continuo",
    "dataPrimeiroUso": "2026-09-30",
    "dataValidade": null,
    "intensidadeAlerta": "critico",
    "periodosPausa": [],
    "proximoUsoPrevisto": "2026-10-01T08:00:00.000Z",
    "criadoEm": "2026-09-30T12:00:00.000Z"
  }
}
```

### Possíveis respostas

| Status | Código ou motivo |
|---:|---|
| `201` | Anticoncepcional criado |
| `401` | Sessão inválida |
| `422` | Nome, tipo, frequência, horário ou data inválidos |
| `500` | Erro interno |

---

# 14. Rota inexistente

Uma rota não registrada retorna:

Status: `404 Not Found`

```json
{
  "erro": {
    "codigo": "ROTA_NAO_ENCONTRADA",
    "mensagem": "Recurso não encontrado."
  }
}
```

# 15. Recursos ainda não expostos pela API

O esquema do Prisma possui outras entidades do domínio, mas nem todas possuem endpoints registrados na versão atual.

No momento, não estão disponíveis rotas HTTP para:

- ciclos menstruais;
- previsões;
- diário;
- sintomas;
- histórico do ciclo;
- notificações;
- listagem ou edição da rede de apoio;
- categorias de permissão da rede de apoio.

A existência de uma entidade no banco não significa que ela esteja acessível pela API.

Esta documentação deve ser atualizada sempre que uma rota for adicionada, removida ou tiver seu contrato alterado.