# Motor térmico — modo sombra

Modo sombra significa calcular sem interferir na experiência ou nas previsões
usadas pela pessoa.

## O que o backend faz

- recebe e preserva a temperatura e os metadados de perturbação;
- executa a regra A1/B1 de forma determinística;
- guarda estado, sequência, configuração e versão do algoritmo;
- marca como provisório o ciclo que ainda não possui ciclo seguinte;
- recalcula quando medições ou fronteiras menstruais mudam.

## O que o backend não faz

- não retorna a análise térmica pelas APIs públicas do Diário;
- não mostra confirmação, insuficiência ou ambiguidade no calendário;
- não escolhe nem altera uma data de ovulação;
- não aumenta ou reduz a confiança da HU-013;
- não muda menstruação, janela fértil ou fases previstas;
- não emite diagnóstico nem recomendação contraceptiva;
- não transforma o resultado em evidência aplicada.

`evidenciaAplicada` permanece `false` no banco e
`aplicarEvidenciaNaConfianca` permanece `false` na configuração. Assim, um
resultado armazenado não afeta silenciosamente a previsão atual.

Mesmo `ELEVACAO_DETECTADA` significa somente que os dados satisfizeram a regra
matemática configurada. Não significa confirmação clínica de ovulação.

O primeiro dia elevado e o terceiro dia possuem significados distintos: o
primeiro inicia a elevação observada; o terceiro torna o padrão detectável. O
produto não apresenta nenhum deles como data exata da ovulação.

## Saída do modo sombra

O modo sombra só pode ser encerrado por decisão explícita e versionada. Exibir
resultados ou aplicar evidência exige, em conjunto:

1. validação prospectiva contra referência independente;
2. protocolo e critérios estatísticos definidos antes da análise;
3. revisão por profissional de ginecologia ou medicina reprodutiva;
4. revisão de produto, privacidade, segurança e ética;
5. texto que fale em padrão observado, sem alegar precisão clínica;
6. nova versão do algoritmo e do produto.

Sem ultrassom, LH, progesterona ou PdG independentes, o modo sombra permite
avaliar disponibilidade, estabilidade e qualidade dos dados, mas não permite
estimar sensibilidade, especificidade ou acurácia clínica.
