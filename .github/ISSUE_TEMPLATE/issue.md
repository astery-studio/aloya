---
name: Relatar problema
about: Registre bug, regressão, falha técnica ou comportamento inesperado com dados reproduzíveis
title: "[BUG] "
labels: bug, triage
assignees: ""
---

<!--
Antes de enviar:
1. procure issues abertas e fechadas para evitar duplicidade;
2. remova qualquer senha, token, e-mail, nome ou dado de saúde real;
3. preencha todos os campos aplicáveis;
4. para propor uma capacidade nova, use o template "Nova funcionalidade".
-->

## Resumo do problema

<!-- Em uma frase: o que ocorreu, onde e qual foi o impacto? -->

## Classificação inicial

**Natureza:**

- [ ] Bug funcional
- [ ] Regressão (algo que funcionava deixou de funcionar)
- [ ] Segurança ou privacidade
- [ ] Acessibilidade
- [ ] Desempenho
- [ ] Dados / migração
- [ ] Interface / conteúdo
- [ ] Instabilidade de testes ou build
- [ ] Documentação

**Área:**

- [ ] Frontend / Expo
- [ ] Backend / API
- [ ] Banco / Prisma
- [ ] Autenticação / sessão
- [ ] Consentimento parental
- [ ] E-mail
- [ ] Onboarding
- [ ] Ciclo menstrual
- [ ] Infraestrutura / configuração

## Severidade e impacto

<!--
Crítica: exposição/perda de dados, falha de segurança ou sistema indisponível.
Alta: fluxo essencial bloqueado sem contorno.
Média: fluxo degradado, mas existe contorno.
Baixa: impacto limitado ou cosmético.
-->

- **Severidade sugerida:** crítica / alta / média / baixa
- **Frequência:** sempre / frequente / ocasional / uma vez
- **Abrangência:** todas as pessoas / grupo específico / uma conta / desconhecida
- **Existe contorno?** sim / não — descreva:
- **Impacto para a pessoa usuária:**
- **Impacto técnico ou operacional:**

## Ambiente

| Item | Valor |
|---|---|
| Versão/commit/branch | |
| Ambiente | local / desenvolvimento / homologação / produção |
| Plataforma | Android / iOS / Web / API |
| Dispositivo ou emulador | |
| Versão do sistema operacional | |
| Versão do Expo/Node.js | |
| Navegador (se aplicável) | |
| Tipo/versão do banco | |
| Conexão | Wi-Fi / móvel / offline / instável |

## Pré-condições

<!-- Estado inicial, permissões, sessão, dados fictícios e configurações necessárias. -->

-

## Passos mínimos para reproduzir

<!-- Use uma conta e dados fictícios. Seja preciso o suficiente para outra pessoa repetir. -->

1.
2.
3.

## Resultado observado

<!-- Inclua mensagem e código de status exatos quando úteis, sem dados sensíveis. -->

## Resultado esperado

## Taxa de reprodução

<!-- Exemplo: 4 de 5 tentativas. Informe também quando começou a ocorrer. -->

- **Tentativas com falha / total:**
- **Primeira versão ou data observada:**
- **Última versão conhecida como funcional:**

## Evidências sanitizadas

<!-- Screenshots, vídeo, stack trace, request ID e logs. Oculte PII, tokens e dados de saúde. -->

<details>
<summary>Logs / stack trace</summary>

```text
Cole apenas o trecho relevante e sanitizado.
```

</details>

<details>
<summary>Requisição e resposta da API</summary>

```http
# Método, rota, headers não sensíveis e corpo fictício
```

```json
{}
```

</details>

## Investigação inicial

<!-- Opcional: hipótese, módulo suspeito, commit provável ou análise já realizada. Diferencie fatos de hipóteses. -->

### Linha do tempo

| Data/hora e fuso | Evento/observação |
|---|---|
| | |

### Possível causa

### Arquivos/módulos relacionados

-

## Dados, segurança e privacidade

- [ ] Não há indício de exposição ou perda de dados
- [ ] Pode envolver dados pessoais ou de saúde
- [ ] Pode permitir acesso sem autorização
- [ ] Pode expor existência de conta, token ou segredo
- [ ] Pode afetar consentimento parental ou pessoa menor de idade
- [ ] Pode permitir abuso, repetição excessiva ou ausência de rate limit

**Detalhes seguros para triagem:**

<!-- Se houver risco ativo, não publique detalhes exploráveis; informe apenas impacto e condições gerais. -->

## Acessibilidade

- [ ] Não se aplica
- [ ] Leitor de tela
- [ ] Ordem/retorno de foco
- [ ] Rótulo, papel ou estado acessível
- [ ] Contraste / percepção visual
- [ ] Redimensionamento de texto
- [ ] Área de toque / mobilidade
- [ ] Teclado / botão Voltar

**Tecnologia assistiva e comportamento:**

## Critérios para considerar resolvido

- [ ] A causa raiz foi identificada ou documentada
- [ ] O cenário mínimo acima não apresenta mais a falha
- [ ] Foi criado teste automatizado de regressão
- [ ] Casos limítrofes e entradas inválidas foram verificados
- [ ] Fluxos relacionados continuam funcionando
- [ ] Logs e respostas não expõem dados sensíveis
- [ ] Documentação/contrato foi atualizado, se necessário

## Guia de verificação da correção

### Preparação

1.
2.

### Casos a executar

| ID | Cenário | Passos/dados fictícios | Resultado esperado |
|---|---|---|---|
| V01 | Regressão principal | | |
| V02 | Caso limítrofe | | |
| V03 | Entrada inválida/falha externa | | |
| V04 | Fluxo relacionado | | |

### Suítes recomendadas

```bash
# Backend
cd backend
npm test

# Frontend (execute a partir da raiz em outro terminal)
cd frontend
npm test
npm run test:coverage
```

## Risco de correção

<!-- Quais fluxos podem sofrer regressão? Há migração, contrato de API ou versão antiga do app envolvida? -->

## Informações adicionais

<!-- Links relacionados, dependências, duplicatas ou observações. -->
