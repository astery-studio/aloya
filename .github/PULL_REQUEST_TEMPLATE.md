<!--
Obrigado por contribuir com o Aloya!

Antes de abrir o PR:
- use um título no padrão Conventional Commits, por exemplo:
  feat(ciclo): adiciona previsão da fase lútea
  fix(auth): impede reuso de token expirado
- mantenha o PR focado em uma única mudança;
- substitua os exemplos e remova as seções que realmente não se aplicam;
- nunca inclua tokens, senhas, dados pessoais ou dados de saúde reais.

Marque com [x] somente as opções e verificações aplicáveis ao PR.
-->

## Resumo

<!-- Explique em poucas frases o problema e a solução entregue. -->

## Origem da mudança

<!--
Escolha a origem correspondente. Histórias de Usuário do documento de requisitos
não precisam de Issue nem de justificativa adicional: basta identificá-las abaixo.
-->

- [ ] História de Usuário prevista no documento de requisitos
- [ ] Issue relacionada: Closes #
- [ ] Correção ou manutenção técnica sem Issue
- [ ] Mudança não prevista no documento de requisitos

### História de Usuário entregue

<!--
Preencha para uma HU planejada. Use o identificador e o título exatamente como
aparecem no documento de requisitos. Não é necessário repetir sua justificativa.
-->

- **ID da HU:** HU-
- **Título:**
- **Referência no documento de requisitos:**
- **Entrega:** [ ] Backend  [ ] Frontend  [ ] Backend e frontend

### Contexto adicional

<!--
Opcional para uma HU prevista. Para mudanças não previstas, explique brevemente
a necessidade. Para Issue relacionada, o link acima pode ser suficiente.
-->

## Tipo de mudança

- [ ] `feat`: nova funcionalidade
- [ ] `fix`: correção de defeito
- [ ] `refactor`: alteração interna sem mudança de comportamento
- [ ] `test`: criação ou manutenção de testes
- [ ] `docs`: documentação
- [ ] `build` / `ci`: dependências, build ou automação
- [ ] `chore`: manutenção
- [ ] Mudança incompatível (*breaking change*)

## Áreas afetadas

- [ ] Frontend (React Native / Expo)
- [ ] Backend (Node.js / Express)
- [ ] API / contrato HTTP
- [ ] Banco de dados / Prisma / migração
- [ ] Autenticação / autorização / consentimento parental
- [ ] E-mail / comunicação externa
- [ ] Armazenamento local / SecureStore
- [ ] UI / design system
- [ ] Acessibilidade
- [ ] Documentação
- [ ] Dependências / configuração / ambiente

## Contexto e motivação

### Problema anterior

<!-- Como o sistema se comportava? Quem era afetado? Inclua evidências sem expor dados sensíveis. -->

### Solução adotada

<!-- Descreva as decisões técnicas e o fluxo principal. -->

### Alternativas consideradas

<!-- Registre alternativas descartadas e o motivo. -->

## Escopo

### Incluído

-

### Fora do escopo

-

## Detalhes da implementação

<!--
Explique apenas o necessário para orientar a revisão. Quando aplicável, descreva:
- Frontend: screens, components, hooks, services, estados e navegação;
- Backend: route -> middleware -> controller -> service -> Prisma;
- dados: modelos, índices, restrições, seed e migração;
- integrações: contratos, timeouts, repetição e tratamento de falhas.
-->

### Fluxo alterado

```text
Usuário
  -> Tela / componente
  -> Serviço do frontend
  -> API
  -> Rota / middleware / controller / service
  -> Prisma / banco
```

### Arquivos ou módulos principais
