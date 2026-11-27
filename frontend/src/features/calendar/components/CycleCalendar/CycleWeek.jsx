//Agrupa sete dias e desenha as faixas de fase e da janela fértil.
import { memo, useMemo } from 'react';
import { View } from 'react-native';

import { CycleDay } from './CycleDay';
import { estilosTemaClaro } from './CycleCalendar.styles';

function obterFaixasFase(semana) {
    const faixas = [];

    semana.forEach((dia, indice) => {
        if (!dia?.tipo) return;

        const faixa = faixas.at(-1);
        if (
            faixa?.fim === indice - 1 &&
            faixa.diaInicial.tipo === dia.tipo &&
            faixa.diaInicial.previsto === dia.previsto
        ) {
            faixa.fim = indice;
            return;
        }

        faixas.push({ inicio: indice, fim: indice, diaInicial: dia });
    });

    return faixas;
}

function obterTrechosFerteis(semana) {
    const trechos = [];
    let inicio = null;
    let previsto = false;

    function concluirTrecho(fim) {
        if (inicio === null) return;

        const primeiroDia = semana[inicio];
        const ultimoDia = semana[fim];

        trechos.push({
            inicio,
            quantidade: fim - inicio + 1,
            previsto,
            chave: `${primeiroDia.data}-${ultimoDia.data}`
        });

        inicio = null;
    }

    for (let indice = 0; indice < semana.length; indice += 1) {
        const dia = semana[indice];
        const pertence = dia?.janelaFertil === true;
        const previsaoMudou = inicio !== null && pertence && previsto !== dia.janelaFertilPrevista;

        if (previsaoMudou) concluirTrecho(indice - 1);

        if (pertence && inicio === null) {
            inicio = indice;
            previsto = dia.janelaFertilPrevista;
        }

        if (!pertence) concluirTrecho(indice - 1);
    }

    concluirTrecho(semana.length - 1);

    return trechos;
}

function CycleWeek({ semana, aoPressionarDia, estilosTema = estilosTemaClaro }) {
    const { estilos, estilosTipos, estilosTiposPrevistos } = estilosTema;
    const faixasFase = useMemo(() => obterFaixasFase(semana), [semana]);
    const trechosFerteis = useMemo(() => obterTrechosFerteis(semana), [semana]);

    return (
        <View style={estilos.semana}>
            {faixasFase.map(({ inicio, fim, diaInicial }) => {
                const diaFinal = semana[fim];
                const cores = diaInicial.previsto ? estilosTiposPrevistos : estilosTipos;

                return (
                    <View
                        key={diaInicial.data}
                        testID={`faixa-fase-${diaInicial.data}-${diaFinal.data}`}
                        pointerEvents="none"
                        style={[
                            estilos.faixaFase,
                            cores[diaInicial.tipo],
                            diaInicial.inicioSegmento && estilos.inicioSegmento,
                            diaFinal.fimSegmento && estilos.fimSegmento,
                            {
                                left: `${(inicio / 7) * 100}%`,
                                right: `${((6 - fim) / 7) * 100}%`
                            }
                        ]}
                    />
                );
            })}
            {semana.map((dia, indice) => (
                <CycleDay
                    key={dia?.data ?? `vazio-${indice}`}
                    dia={dia}
                    aoPressionarDia={aoPressionarDia}
                    estilosTema={estilosTema}
                />
            ))}

            {trechosFerteis.map((trecho) => (
                <View
                    key={trecho.chave}
                    testID={`janela-fertil-${trecho.chave}`}
                    pointerEvents="none"
                    style={[
                        estilos.trechoJanelaFertil,
                        trecho.previsto ? estilos.janelaFertilPrevista : estilos.janelaFertilAtual,
                        {
                            left: `${(trecho.inicio / 7) * 100}%`,
                            width: `${(trecho.quantidade / 7) * 100}%`
                        }
                    ]}
                />
            ))}
        </View>
    );
}

const CycleWeekMemorizada = memo(CycleWeek);

export { CycleWeekMemorizada as CycleWeek, obterTrechosFerteis };
