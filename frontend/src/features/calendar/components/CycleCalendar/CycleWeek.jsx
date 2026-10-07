//Agrupa sete dias e desenha trechos contínuos da janela fértil.
import {memo, useMemo} from 'react'
import {View} from 'react-native'

import {CycleDay} from './CycleDay'
import {estilos} from './CycleCalendar.styles'

function obterTrechosFerteis(semana) {
    const trechos = []
    let inicio = null
    let previsto = false

    function concluirTrecho(fim) {
        if (inicio === null) return

        const primeiroDia = semana[inicio]
        const ultimoDia = semana[fim]

        trechos.push({
            inicio,
            quantidade: fim - inicio + 1,
            previsto,
            chave: `${primeiroDia.data}-${ultimoDia.data}`
        })

        inicio = null
    }

    for (let indice = 0; indice < semana.length; indice += 1) {
        const dia = semana[indice]
        const pertence = dia?.janelaFertil === true
        const previsaoMudou = inicio !== null
            && pertence
            && previsto !== dia.janelaFertilPrevista

        if (previsaoMudou) concluirTrecho(indice - 1)

        if (pertence && inicio === null) {
            inicio = indice
            previsto = dia.janelaFertilPrevista
        }

        if (!pertence) concluirTrecho(indice - 1)
    }

    concluirTrecho(semana.length - 1)

    return trechos
}

function CycleWeek({semana, aoPressionarDia}) {
    const trechosFerteis = useMemo(
        () => obterTrechosFerteis(semana),
        [semana]
    )

    return (
        <View style={estilos.semana}>
            {semana.map((dia, indice) => (
                <CycleDay
                    key={dia?.data ?? `vazio-${indice}`}
                    dia={dia}
                    aoPressionarDia={aoPressionarDia}
                />
            ))}

            {trechosFerteis.map((trecho) => (
                <View
                    key={trecho.chave}
                    testID={`janela-fertil-${trecho.chave}`}
                    pointerEvents="none"
                    style={[
                        estilos.trechoJanelaFertil,
                        trecho.previsto
                            ? estilos.janelaFertilPrevista
                            : estilos.janelaFertilAtual,
                        {
                            left: `${(trecho.inicio / 7) * 100}%`,
                            width: `${(trecho.quantidade / 7) * 100}%`
                        }
                    ]}
                />
            ))}
        </View>
    )
}

const CycleWeekMemorizada = memo(CycleWeek)

export {
    CycleWeekMemorizada as CycleWeek,
    obterTrechosFerteis
}