//Agrupa sete dias e desenha trechos contínuos da janela fértil.
import { memo, useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { CycleDay } from './CycleDay';
import { estilosTemaClaro } from './CycleCalendar.styles';

const ESPESSURA_CONTORNO = 2;
const RECUO_CONTORNO = ESPESSURA_CONTORNO / 2;

function ContornoFertil({ trecho, estilosTema }) {
    const { estilos, coresJanelaFertil } = estilosTema;
    const [medidas, setMedidas] = useState(null);
    const areaValida = medidas?.width > ESPESSURA_CONTORNO && medidas?.height > ESPESSURA_CONTORNO;

    return (
        <View
            testID={`janela-fertil-${trecho.chave}`}
            pointerEvents="none"
            onLayout={({ nativeEvent: { layout } }) => {
                setMedidas((atual) =>
                    atual?.width === layout.width && atual?.height === layout.height
                        ? atual
                        : { width: layout.width, height: layout.height }
                );
            }}
            style={[
                estilos.trechoJanelaFertil,
                {
                    left: `${(trecho.inicio / 7) * 100}%`,
                    width: `${(trecho.quantidade / 7) * 100}%`
                }
            ]}
        >
            {areaValida ? (
                <Svg width="100%" height="100%">
                    <Rect
                        testID={`pontilhado-fertil-${trecho.chave}`}
                        x={RECUO_CONTORNO}
                        y={RECUO_CONTORNO}
                        width={medidas.width - ESPESSURA_CONTORNO}
                        height={medidas.height - ESPESSURA_CONTORNO}
                        rx={15}
                        fill="none"
                        stroke={
                            trecho.previsto ? coresJanelaFertil.prevista : coresJanelaFertil.atual
                        }
                        strokeWidth={ESPESSURA_CONTORNO}
                        strokeDasharray="2 4"
                        strokeLinecap="round"
                    />
                </Svg>
            ) : null}
        </View>
    );
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
    const { estilos } = estilosTema;
    const trechosFerteis = useMemo(() => obterTrechosFerteis(semana), [semana]);

    return (
        <View style={estilos.semana}>
            {semana.map((dia, indice) => (
                <CycleDay
                    key={dia?.data ?? `vazio-${indice}`}
                    dia={dia}
                    aoPressionarDia={aoPressionarDia}
                    estilosTema={estilosTema}
                />
            ))}

            {trechosFerteis.map((trecho) => (
                <ContornoFertil key={trecho.chave} trecho={trecho} estilosTema={estilosTema} />
            ))}
        </View>
    );
}

const CycleWeekMemorizada = memo(CycleWeek);

export { CycleWeekMemorizada as CycleWeek, obterTrechosFerteis };
