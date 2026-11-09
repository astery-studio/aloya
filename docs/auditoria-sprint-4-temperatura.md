# Auditoria da matriz térmica experimental

Data da auditoria: 9 de novembro de 2026.

## Matriz implementada

| Variante | Natureza | Execução | Situação |
| --- | --- | --- | --- |
| A1/B1 | Causal | Ciclo aberto ou concluído | Experimental |
| A1/B2 | Causal | Ciclo aberto ou concluído | Experimental |
| A2/B1 | Causal | Ciclo aberto ou concluído | Experimental |
| A2/B2 | Causal | Ciclo aberto ou concluído | Experimental |
| A4-C/B1 | Causal | Ciclo aberto ou concluído | Experimental |
| A4-C/B2 | Causal | Ciclo aberto ou concluído | Experimental |
| A3 | Retrospectiva | Somente ciclo concluído | Parcialmente disponível |
| A4-R | Retrospectiva | Somente ciclo concluído | Experimental |

A3 permanece inconclusiva na execução real enquanto não houver uma fonte independente
para encerrar a janela folicular. O algoritmo existe e está testado, mas o sistema não
fabrica esse limite a partir da própria detecção que pretende avaliar.

## Propriedades comprovadas

- A1, A2 e A4-C nunca consultam temperaturas posteriores ao dia avaliado.
- A3 e A4-R só são acrescentadas após o encerramento do ciclo.
- A4-R usa apenas os 14 dias finais do próprio ciclo e aceita cinco leituras válidas
  nas seis posições de referência.
- B1 exige continuidade diária; B2 usa seis leituras válidas em até nove dias.
- Lacuna ou medição perturbada não é silenciosamente tratada como leitura normal.
- Média e comparação usam inteiros escalados, sem arredondamento decisório.
- A confirmação causal surge somente quando o terceiro dia elevado já existe.
- Três leituras consecutivas na linha de base rearmam a busca experimental.
- Sem retorno completo, uma elevação posterior não vira uma segunda sequência.
- Duas elevações separadas por retorno válido tornam o ciclo inconclusivo.
- Edição retroativa reconstrói o resultado do ciclo inteiro de forma determinística.

## Isolamento do modo sombra

- Uma feature flag pode impedir toda execução da matriz.
- Os resultados ficam em armazenamento interno, identificados por ciclo e versão.
- Não existe endpoint público de conclusão térmica.
- A persistência força `evidenciaAplicada` como falsa em todos os estados.
- Nenhum resultado altera previsão, janela fértil ou confiança da HU-013.
- O frontend permanece sem consumo ou exibição desses resultados.

## Decisões ainda pendentes

- Validar sensibilidade, especificidade e calibração em dados com referência independente.
- Definir e registrar previamente o protocolo estatístico da comparação entre variantes.
- Obter revisão de produto e profissional de saúde antes de qualquer exibição.
- Confirmar clinicamente o retorno à linha de base e o tratamento de elevações múltiplas.
- Integrar uma fonte independente e auditável para o limite folicular usado por A3.

Até essas decisões serem concluídas, a matriz é adequada para observação técnica em
modo sombra, mas não para diagnóstico, contracepção ou confirmação clínica de ovulação.
