---
name: Nova funcionalidade
about: Proponha uma capacidade nova com valor, escopo, critérios de aceite e estratégia de testes
title: "[FEATURE] "
labels: enhancement, triage
assignees: ""
---

<!--
Use este template para discutir o problema e o resultado desejado antes de implementar.
Não inclua dados pessoais, credenciais ou dados reais de saúde.
Procure propostas semelhantes antes de abrir uma nova.
-->

## Título orientado ao resultado

<!-- Exemplo: Permitir que a pessoa registre sintomas do ciclo diariamente. -->

## Resumo executivo

<!-- Em 3–5 frases: problema, público, proposta e benefício esperado. -->

## Problema e oportunidade

### Situação atual

<!-- Como a necessidade é atendida hoje? Quais limitações existem? -->

### Pessoas afetadas

<!-- Perfis, contexto e necessidades. Preserve a linguagem agênero e inclusiva do Aloya. -->

### Evidências

<!-- Pesquisa, feedback anonimizado, métricas ou padrões observados. Separe evidência de hipótese. -->

### Consequência de não fazer

## Objetivos e resultados

### Objetivo principal

### Resultados esperados

-

### Métricas de sucesso

| Métrica | Linha de base | Meta | Período | Como medir sem invadir privacidade |
|---|---:|---:|---|---|
| | | | | |

### Não objetivos

<!-- Declare explicitamente o que esta proposta não pretende resolver. -->

-

## História e cenários de uso

**Como** [tipo de pessoa], **quero** [capacidade], **para** [benefício].

### Cenário principal

```gherkin
Dado que [contexto]
Quando [ação]
Então [resultado observável]
```

### Cenários alternativos e de falha

```gherkin
Dado que [contexto alternativo ou falha]
Quando [ação]
Então [tratamento seguro e compreensível]
```

## Escopo

### MVP — incluído

-

### Fora do escopo

-

### Evoluções futuras

-

## Requisitos funcionais

| ID | Requisito | Prioridade | Dependência |
|---|---|---|---|
| RF01 | | Must / Should / Could | |

## Requisitos não funcionais

- **Segurança:**
- **Privacidade e minimização de dados:**
- **Acessibilidade:**
- **Desempenho/tempo de resposta:**
- **Disponibilidade e comportamento offline:**
- **Compatibilidade Android/iOS/Web:**
- **Observabilidade sem dados sensíveis:**
- **Localização, fuso e datas:**

## Critérios de aceite

<!-- Devem ser observáveis, independentes e testáveis. -->

- [ ] CA01 — Dado ..., quando ..., então ...
- [ ] CA02 — Dado ..., quando ..., então ...
- [ ] CA03 — Erros e indisponibilidade são apresentados de forma segura e acionável
- [ ] CA04 — O fluxo funciona com leitor de tela e navegação por foco
- [ ] CA05 — Nenhum log, evento ou resposta expõe dado sensível desnecessário

## Proposta de experiência

### Jornada

```text
Entrada
  -> ação da pessoa
  -> feedback/carregamento
  -> sucesso ou recuperação de erro
  -> próximo passo
```

### Estados da interface

- [ ] Inicial
- [ ] Carregando
- [ ] Vazio
- [ ] Sucesso
- [ ] Validação
- [ ] Erro recuperável
- [ ] Erro sem recuperação imediata
- [ ] Offline / conexão instável
- [ ] Sem permissão / sessão expirada

### Conteúdo e tom

<!-- Informe textos importantes. Evite pressupor gênero, identidade, parceria ou regularidade do ciclo. -->

### Wireframes/protótipos

<!-- Adicione links ou imagens e registre a versão usada. -->

## Acessibilidade

- [ ] Semântica, rótulos, papéis e estados definidos
- [ ] Ordem do foco e retorno após modal/bottom sheet definidos
- [ ] Mensagens dinâmicas e erros anunciados
- [ ] Contraste e escala de texto considerados
- [ ] Áreas de toque adequadas
- [ ] A experiência não depende apenas de cor, gesto ou animação
- [ ] Alternativas para teclado/botão Voltar foram previstas

**Comportamento esperado com tecnologia assistiva:**

## Proposta técnica

<!-- Preenchimento recomendado após refinamento técnico. -->

### Componentes afetados

- [ ] Frontend React Native / Expo
- [ ] Backend Node.js / Express
- [ ] API / contrato
- [ ] Prisma / banco de dados
- [ ] Armazenamento local / SecureStore
- [ ] E-mail / serviço externo
- [ ] Autenticação / autorização
- [ ] Documentação

### Fluxo entre camadas

```text
Screen -> Component/Hook -> Frontend Service -> HTTP
HTTP -> Route -> Middleware -> Controller -> Service -> Prisma -> Database
```

### API proposta

| Método | Rota | Autenticação | Request | Response | Erros esperados |
|---|---|---|---|---|---|
| | | | | | |

<details>
<summary>Contrato de exemplo</summary>

```json
{}
```

</details>

### Modelo de dados e migração

<!-- Entidades, relações, nulabilidade, restrições, índices, retenção e exclusão. -->

- **Mudança no schema:**
- **Migração de dados existentes:**
- **Compatibilidade com versões antigas do app:**
- **Rollback ou forward fix:**

### Regras de negócio e validação

| Regra | Camada responsável | Resposta ao descumprimento |
|---|---|---|
| | | |

### Alternativas técnicas consideradas

| Alternativa | Vantagens | Desvantagens | Decisão |
|---|---|---|---|
| | | | |

## Segurança, privacidade e consentimento

- [ ] Coleta somente os dados necessários
- [ ] Define finalidade, retenção, atualização e exclusão
- [ ] Aplica autorização no backend, não apenas na interface
- [ ] Considera dados de saúde como sensíveis
- [ ] Considera idade e consentimento parental quando aplicável
- [ ] Evita enumeração de contas e mensagens reveladoras
- [ ] Considera rate limit, abuso, replay e expiração
- [ ] Mantém segredos e tokens fora de logs e armazenamento inseguro
- [ ] Usa dados sintéticos em testes e demonstrações

### Ameaças e mitigações

| Ameaça/caso de abuso | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| | baixa/média/alta | baixo/médio/alto | |

## Dependências, riscos e dúvidas
