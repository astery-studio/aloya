//Mostra um dia do calendário com fase, previsão e interação acessível.
import {memo} from 'react'
import {Pressable, Text, View} from 'react-native'
import {DropIcon} from 'phosphor-react-native/src/icons/Drop'
import {PlantIcon} from 'phosphor-react-native/src/icons/Plant'
import {SunIcon} from 'phosphor-react-native/src/icons/Sun'
import {WaveSineIcon} from 'phosphor-react-native/src/icons/WaveSine'

import {NOMES_MESES, TIPOS_DIA} from '../../utils/cycleCalendar.utils'
import {
    estilos,
    estilosTipos,
    estilosTiposPrevistos
} from './CycleCalendar.styles'

const iconesPorTipo = Object.freeze({
    [TIPOS_DIA.menstruacao]: DropIcon,
    [TIPOS_DIA.folicular]: PlantIcon,
    [TIPOS_DIA.ovulacao]: SunIcon,
    [TIPOS_DIA.lutea]: WaveSineIcon
})

const rotulosPorTipo = Object.freeze({
    [TIPOS_DIA.menstruacao]: 'menstruação',
    [TIPOS_DIA.folicular]: 'fase folicular',
    [TIPOS_DIA.ovulacao]: 'ovulação',
    [TIPOS_DIA.lutea]: 'fase lútea'
})

function criarRotuloAcessibilidade(dia) {
    const [ano, mes] = dia.data.split('-').map(Number)
    const partes = [`Dia ${dia.dia} de ${NOMES_MESES[mes - 1].toLowerCase()} de ${ano}`]

    if (dia.registroCicloId) {
        partes.push('menstruação registrada')
    } else if (dia.tipo) {
        partes.push(`${dia.previsto ? 'provável ' : ''}${rotulosPorTipo[dia.tipo]}`)
    }

    if (dia.janelaFertil) partes.push(dia.janelaFertilPrevista ? 'provável janela fértil' : 'janela fértil')
    if (dia.futuro && !dia.tipo) partes.push('data futura')

    return partes.join(', ')
}

function ConteudoDia({dia}) {
    const Icone = dia.tipo ? iconesPorTipo[dia.tipo] : null

    return (
        <>
            {Icone ? (
                <View style={estilos.iconeDia}>
                    <Icone
                        size={15}
                        color="#FFFFFF"
                        weight="regular"
                    />
                </View>
            ) : null}

            <Text
                style={[
                    estilos.numeroDia,
                    dia.tipo && estilos.numeroDiaMarcado,
                    dia.futuro && !dia.tipo && estilos.numeroDiaFuturo
                ]}
            >
                {dia.dia}
            </Text>
        </>
    )
}

function CycleDay({dia, aoPressionarDia}) {
    if (!dia) return <View style={estilos.celulaDia} />

    const interativo = Boolean(dia.registroCicloId && typeof aoPressionarDia === 'function')
    const estiloTipo = dia.previsto
        ? estilosTiposPrevistos[dia.tipo]
        : estilosTipos[dia.tipo]
    const rotuloAcessibilidade = criarRotuloAcessibilidade(dia)

    function pressionar() {
        if (!interativo) return

        aoPressionarDia({
            data: dia.data,
            registroCicloId: dia.registroCicloId
        })
    }

    return (
        <View style={estilos.celulaDia}>
            {dia.tipo ? (
                <View
                    testID={`fundo-dia-${dia.data}`}
                    pointerEvents="none"
                    style={[
                        estilos.segmentoDia,
                        estiloTipo,
                        dia.inicioSegmento && estilos.inicioSegmento,
                        dia.fimSegmento && estilos.fimSegmento,
                        !dia.fimSegmento && estilos.separadorSegmento
                    ]}
                />
            ) : null}

            {interativo ? (
                <Pressable
                    onPress={pressionar}
                    accessibilityRole="button"
                    accessibilityLabel={rotuloAcessibilidade}
                    style={({pressed}) => [
                        estilos.conteudoDia,
                        pressed && estilos.pressionado
                    ]}
                >
                    <ConteudoDia dia={dia} />
                </Pressable>
            ) : (
                <View
                    accessible
                    accessibilityLabel={rotuloAcessibilidade}
                    style={estilos.conteudoDia}
                >
                    <ConteudoDia dia={dia} />
                </View>
            )}
        </View>
    )
}

const CycleDayMemorizado = memo(CycleDay)

export {CycleDayMemorizado as CycleDay}