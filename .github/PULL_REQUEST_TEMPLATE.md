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

| Área | Arquivo/módulo | Responsabilidade da mudança |
|---|---|---|
| | | |

## Contratos e dados

### API

<!-- Informe método, rota, autenticação, request, response e códigos HTTP. Use "Não se aplica" se necessário. -->

| Método e rota | Autenticação | Alteração | Compatibilidade |
|---|---|---|---|
| | | | |

<details>
<summary>Exemplo de requisição/resposta</summary>

```json
{}
```

</details>

### Banco de dados

- [ ] Não altera schema nem dados
- [ ] Altera `schema.prisma`
- [ ] Inclui migração versionada
- [ ] Inclui atualização de seed
- [ ] A migração foi testada em banco limpo
- [ ] A migração foi testada sobre dados existentes
- [ ] Há estratégia de rollback ou *forward fix*

**Impacto, compatibilidade e estratégia de implantação:**

<!-- Considere nulabilidade, valores padrão, índices, volume e ordem entre backend e migração. -->

### Configuração e dependências

<!-- Liste novas variáveis de ambiente, pacotes ou mudanças no .env.example. Nunca cole segredos. -->

| Item | Obrigatório? | Valor seguro/padrão | Motivo |
|---|---|---|---|
| | | | |

## Segurança, privacidade e linguagem inclusiva

- [ ] Nenhum segredo ou dado real foi incluído em código, logs, fixtures ou screenshots
- [ ] Entradas são validadas e normalizadas antes do uso
- [ ] Autenticação e autorização foram verificadas no backend
- [ ] Respostas e erros não permitem enumeração de contas nem vazam dados
- [ ] Rate limit, expiração e uso único foram considerados quando aplicável
- [ ] Senhas/tokens permanecem em armazenamento seguro e não aparecem em logs
- [ ] O princípio de menor privilégio foi respeitado
- [ ] Dados de saúde, ciclo, idade e consentimento recebem tratamento mínimo necessário
- [ ] Textos preservam a comunicação agênero, acolhedora e inclusiva do Aloya

**Riscos identificados e mitigação:**

## Acessibilidade e experiência

- [ ] Não há mudança visual/interativa
- [ ] Elementos interativos têm rótulo, papel e estado acessíveis
- [ ] Ordem e destino do foco foram verificados, inclusive em modal/bottom sheet
- [ ] Leitor de tela anuncia erros, instruções e mudanças relevantes
- [ ] Contraste, tamanho de toque e redimensionamento de texto foram considerados
- [ ] Fluxos de teclado e botão Voltar do Android foram testados
- [ ] Estados de carregamento, vazio, erro, offline e sucesso foram tratados
- [ ] A interface foi verificada em tamanhos de tela relevantes

## Guia de testes

### Pré-requisitos

<!-- Informe sistema/plataforma, branch, banco/seed, variáveis e contas fictícias necessárias. -->

1.
2.

### Teste automatizado — backend

```bash
cd backend
npm test
```

- [ ] Suíte completa do backend aprovada
- [ ] Foram adicionados/atualizados testes de validator
- [ ] Foram adicionados/atualizados testes de middleware/rota/controller
- [ ] Foram adicionados/atualizados testes de service e regras de negócio
- [ ] Casos de segurança e regressão foram cobertos

### Teste automatizado — frontend

```bash
cd frontend
npm test
npm run test:coverage
```

- [ ] Suíte completa do frontend aprovada
- [ ] Cobertura global continua em pelo menos 90% para branches, functions, lines e statements
- [ ] Componentes/hooks/services alterados possuem testes de comportamento
- [ ] Estados assíncronos, falhas de API e interações foram cobertos

### Teste manual / exploratório

| ID | Cenário | Preparação e passos | Resultado esperado | Plataforma | Resultado |
|---|---|---|---|---|---|
| T01 | Fluxo principal | 1. ... | ... | Android/iOS/Web/API | ✅/❌ |
| T02 | Entrada inválida | 1. ... | ... | | ✅/❌ |
| T03 | Falha/indisponibilidade | 1. ... | ... | | ✅/❌ |
| T04 | Limite/permissão | 1. ... | ... | | ✅/❌ |

### Regressão executada

<!-- Liste fluxos existentes próximos da mudança que foram retestados. -->

- [ ] Cadastro, login e recuperação de senha (se afetados)
- [ ] Consentimento parental (se afetado)
- [ ] Navegação e persistência de sessão (se afetadas)
- [ ] Fluxo do ciclo e onboarding (se afetados)
- [ ] Erros e operação sem conexão (se afetados)

### Evidências
