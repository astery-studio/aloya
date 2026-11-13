# ALOYA — Motor térmico experimental

Versão 0.5 · 9 de novembro de 2026

## Estado e finalidade

O motor opera exclusivamente em modo sombra. Ele observa temperaturas basais,
calcula padrões e persiste resultados internos, mas não foi validado
clinicamente. Não diagnostica ovulação, não deve orientar contracepção e não
altera datas ou confiança da HU-013.

Matriz experimental vigente:

- A1: média exata das seis anteriores mais `0,2 °C`;
- A2: mesma média mais `0,3 °C`;
- A4-C: maior das seis anteriores mais `0,2 °C`, causal;
- B1: seis dias anteriores consecutivos e válidos;
- B2: seis medições válidas dentro dos nove dias anteriores;
- A3 e A4-R: somente em ciclo concluído e em processadores retrospectivos;
- confirmação: três temperaturas elevadas em dias consecutivos;
- `aplicarEvidenciaNaConfianca = false`.

## Medições

O valor calculável é armazenado como inteiro em décimos de grau Celsius. O
registro também preserva valor original, unidade, precisão e estado de uso. O intervalo
técnico aceito é `32,0–42,0 °C`; ele não representa normalidade fisiológica.
Não há arredondamento durante o cálculo.

A leitura atual nunca participa de sua própria referência. Dia ausente ou
perturbado interrompe a continuidade. Uma medição perturbada permanece no
Diário, mas não entra no cálculo.

O aplicativo deve orientar a medição após acordar, antes de atividade,
alimentação ou bebida e, idealmente, depois de pelo menos três horas de sono.
Febre, doença, álcool, sono interrompido e mudança de horário ou método podem
perturbar a leitura.

## Aritmética causal

Para um dia candidato `D`, seja `T` sua temperatura em décimos e `S` a soma das
seis temperaturas anteriores. A leitura alcança o limite quando:

```text
6 × T ≥ S + 12
```

A soma `S` é congelada. `D`, `D+1` e `D+2` devem alcançar o mesmo limite. O
motor registra `D` como início da elevação observada e `D+2` como o momento em
que o padrão se tornou detectável. Nenhuma das datas é tratada como dia exato
da ovulação.

Para A2, usa-se `6 × T ≥ S + 18`. A4-C compara cada leitura com a maior
referência mais dois décimos. A leitura atual e dados futuros nunca constroem
sua referência; a detecção só existe quando o terceiro dia já está disponível.

## Estados internos

- `ELEVACAO_DETECTADA`: a regra matemática foi satisfeita;
- `INCONCLUSIVO`: existem padrões múltiplos ou precondição retrospectiva ausente;
- `MEDICAO_NAO_UTILIZADA`: leitura preservada, mas excluída do cálculo;
- `NENHUMA_ELEVACAO_IDENTIFICADA`: houve janela avaliável, sem confirmação;
- `DADOS_INSUFICIENTES`: nenhuma janela completa pôde ser avaliada;

Resultados do ciclo atual são provisórios. Consulte também:

- [Modo sombra](motor-termico-modo-sombra.md);
- [Recálculo determinístico](motor-termico-recalculo.md);
- [Decisões conservadoras e validação](motor-termico-validacao.md).
