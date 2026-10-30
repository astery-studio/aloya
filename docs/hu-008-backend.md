# HU-008 — Backend do registro menstrual

Branch: `feat/adicionar-registro-menstruacao`, criada de `origin/develop`.

## Registro e sincronização

`POST /api/cycles/registrations`, autenticado com o mesmo Bearer token das demais rotas.
Enviar `Idempotency-Key` de 8 a 128 caracteres (`A-Z`, `a-z`, números, `.`, `_`, `:`, `-`).
O app deve gerar uma chave por operação e persistir essa chave junto da marcação offline.

Corpo para um dia (inclusive o atalho de hoje):

```json
{ "data": "2026-10-29" }
```

