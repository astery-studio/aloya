# Aloya — Arquitetura

## 1. O que é arquitetura de software?

Arquitetura de software é a maneira como as diferentes partes de um sistema são organizadas e como elas se comunicam.

No Aloya, o sistema é dividido em:

1. Frontend;
2. Backend;
3. Banco de dados.

Essa separação evita que todas as responsabilidades fiquem misturadas.

---

# 2. Visão geral

```text
                    ┌─────────────────┐
                    │     USUÁRIO     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    FRONTEND     │
                    │ React Native    │
                    │     + Expo      │
                    └────────┬────────┘
                             │
                         HTTP/JSON
                             │
                             ▼
                    ┌─────────────────┐
                    │     BACKEND     │
                    │ Node.js         │
                    │ Express         │
                    │ REST API        │
                    └────────┬────────┘
                             │
                          Prisma
                             │
                             ▼
                    ┌─────────────────┐
                    │    DATABASE     │
                    │   PostgreSQL    │
                    └─────────────────┘
```

---

# 3. Frontend

O frontend é a parte do sistema que o usuário vê e utiliza.

No Aloya, ele será desenvolvido utilizando React Native e Expo.

Ele será responsável por:

* apresentar as telas;
* receber interações;
* mostrar informações;
* enviar requisições para o backend;
* receber respostas da API;
* controlar estados da interface;
* realizar navegação entre telas.

O frontend **não deve acessar diretamente o banco de dados**.

---

# 4. Backend

O backend funciona como intermediário entre o aplicativo e o banco.

Ele será responsável por:

* receber requisições;
* validar dados;
* autenticar usuários;
* executar regras de negócio;
* consultar o banco;
* cadastrar informações;
* atualizar informações;
* excluir informações;
* retornar respostas para o frontend.

---

# 5. Banco de dados

O banco armazena as informações persistentes do sistema.

Por exemplo:

```text
Usuário
Ciclo
Sintoma
Registro
Publicação
Relacionamento
```

O banco utilizado será PostgreSQL.

---

# 6. Prisma

O Prisma funciona como ORM.

ORM significa **Object-Relational Mapping**.

Ele permite que o backend trabalhe com o banco através de código, evitando que todas as consultas precisem ser escritas manualmente em SQL.

Fluxo:

```text
Backend
   ↓
Prisma
   ↓
PostgreSQL
```

---

# 7. Fluxo de uma requisição

Considere que o usuário queira visualizar seu ciclo atual.

```text
1. Usuário abre a tela do ciclo
                ↓
2. Frontend envia GET /cycles/current
                ↓
3. Backend recebe a requisição
                ↓
4. Middleware verifica autenticação
                ↓
5. Controller recebe a requisição
                ↓
6. Service executa a regra de negócio
                ↓
7. Prisma consulta o banco
                ↓
8. PostgreSQL retorna os dados
                ↓
9. Prisma entrega os dados ao backend
                ↓
10. Backend monta a resposta
                ↓
11. Frontend recebe JSON
                ↓
12. Interface é atualizada
```

---

# 8. Separação de responsabilidades

Cada camada possui uma responsabilidade.

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Prisma
   ↓
Database
```

### Routes

Define quais URLs existem.

### Controllers

Recebem requisições e devolvem respostas.

### Services

Contêm regras de negócio.

### Prisma

Realiza a comunicação com o banco.

### Database

Armazena os dados.

---

# 9. Por que separar?

Imagine que toda a lógica estivesse dentro de uma única função:

```text
receber requisição
↓
validar
↓
consultar banco
↓
calcular
↓
salvar
↓
responder
```

Isso rapidamente se tornaria difícil de manter.

Separando as responsabilidades, cada parte pode ser modificada de maneira mais independente.

---

# 10. Princípio utilizado

A principal ideia é:

> Cada parte do sistema deve ter uma responsabilidade clara.

Isso facilita:

* manutenção;
* testes;
* entendimento;
* colaboração entre desenvolvedores;
* identificação de erros;
* evolução do projeto.

---