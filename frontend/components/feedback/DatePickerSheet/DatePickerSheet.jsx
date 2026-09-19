//Mostra um calendário para escolher uma única data
import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft'
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight'

import { BottomSheet } from '../Bottomsheet/BottomSheet'
import { BottomSheetLayout } from '../../../layouts/BottomSheet/BottomSheetLayout'
import { getMonthDays } from '../../../utils/getMonthDays'

import {estilos,corSeta} from './DatePickerSheet.style'

const nomesDosMeses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
]

const nomesDosDias = [
    'Dom',
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sáb'
]

function lerData(data) {
    if (typeof data !== 'string') {
        return null
    }

    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data)

    if (!partes) {
        return null
    }

    const ano = Number(partes[1])
    const mes = Number(partes[2])
    const dia = Number(partes[3])

    if (
        ano < 1000
        || ano > 9999
        || mes < 1
        || mes > 12
    ) {
        return null
    }

    const ultimoDia =
        new Date(ano, mes, 0).getDate()

    if (dia < 1 || dia > ultimoDia) {
        return null
    }

    return { ano, mes, dia }
}

function obterInicioDoMes(ano, mes) {
    return (
        `${ano}-${String(mes).padStart(2, '0')}-01`
    )
}

function obterFimDoMes(ano, mes) {
    const ultimoDia =
        new Date(ano, mes, 0).getDate()

    return (
        `${ano}-${String(mes).padStart(2, '0')}-`
        + String(ultimoDia).padStart(2, '0')
    )
}

function deslocarMes(ano, mes, deslocamento) {
    const total =
        ano * 12 + (mes - 1) + deslocamento

    return {
        ano: Math.floor(total / 12),
        mes: (total % 12) + 1
    }
}

function DatePickerSheet({ visivel, titulo = 'Selecionar data', valorSelecionado = null, onSelecionar, onFechar, dataMinima = null, dataMaxima = null }) {
    const hoje = new Date()

    const dataInicial =
        lerData(valorSelecionado) ?? {
            ano: hoje.getFullYear(),
            mes: hoje.getMonth() + 1
        }

    const [anoVisivel, setAnoVisivel] = useState(dataInicial.ano)
    const [mesVisivel, setMesVisivel] = useState(dataInicial.mes)

    const limiteMinimoValido = lerData(dataMinima) ? dataMinima : null
    const limiteMaximoValido = lerData(dataMaxima) ? dataMaxima : null

    useEffect(() => {
        if (!visivel) {
            return
        }

        const dataAoAbrir =
            lerData(valorSelecionado)

        const dataDeHoje = new Date()

        setAnoVisivel(
            dataAoAbrir?.ano ?? dataDeHoje.getFullYear()
        )

        setMesVisivel(
            dataAoAbrir?.mes ?? dataDeHoje.getMonth() + 1
        )
    }, [visivel])

    function podeMostrarMes(ano, mes) {
        if (ano < 1000 || ano > 9999) {
            return false
        }

        const antesDoMinimo = limiteMinimoValido && (obterFimDoMes(ano, mes) < limiteMinimoValido)
        const depoisDoMaximo = limiteMaximoValido && (obterInicioDoMes(ano, mes) > limiteMaximoValido)

        return !antesDoMinimo && !depoisDoMaximo
    }

    function mudarMes(direcao) {
        const proximo =
            deslocarMes(
                anoVisivel,
                mesVisivel,
                direcao
            )

        if (!podeMostrarMes(
            proximo.ano,
            proximo.mes
        )) {
            return
        }

        setAnoVisivel(proximo.ano)
        setMesVisivel(proximo.mes)
    }

    function voltarMes() {
        mudarMes(-1)
    }

    function avancarMes() {
        mudarMes(1)
    }

    function podeSelecionarDia(data) {
        return (
            (!limiteMinimoValido || data >= limiteMinimoValido)
            && (!limiteMaximoValido || data <= limiteMaximoValido)
        )
    }

    function renderizarNomeDoDia(nome) {
        return (
            <View
                key={nome}
                style={estilos.casaSemana}
            >
                <Text style={estilos.textoSemana}>
                    {nome}
                </Text>
            </View>
        )
    }

    function renderizarCasa(casa, indice) {
        if (!casa) {
            return (
                <View
                    key={`vazio-${indice}`}
                    style={estilos.casaDia}
                />
            )
        }

        const selecionado =
            casa.data === valorSelecionado

        const habilitado =
            podeSelecionarDia(casa.data)

        function selecionarEsteDia() {
            if (habilitado) {
                onSelecionar?.(casa.data)
            }
        }

        return (
            <View
                key={casa.data}
                style={estilos.casaDia}
            >
                <Pressable
                    onPress={selecionarEsteDia}
                    disabled={!habilitado}
                    accessibilityRole="button"
                    accessibilityLabel={ `Dia ${casa.dia} de ` + nomesDosMeses[mesVisivel - 1] + ` de ${anoVisivel}` }
                    accessibilityState={{
                        selected: selecionado,
                        disabled: !habilitado
                    }}
                    style={[
                        estilos.botaoDia,
                        selecionado && estilos.botaoDiaSelecionado
                    ]}
                >
                    <Text
                        style={[
                            estilos.textoDia,
                            !habilitado && estilos.textoDiaDesabilitado,
                            selecionado && estilos.textoDiaSelecionado
                        ]}
                    >
                        {casa.dia}
                    </Text>
                </Pressable>
            </View>
        )
    }

    const anterior =
        deslocarMes(
            anoVisivel,
            mesVisivel,
            -1
        )

    const proximo =
        deslocarMes(
            anoVisivel,
            mesVisivel,
            1
        )

    const anteriorDisponivel =
        podeMostrarMes(
            anterior.ano,
            anterior.mes
        )

    const proximoDisponivel =
        podeMostrarMes(
            proximo.ano,
            proximo.mes
        )

    const casas =
        getMonthDays(
            anoVisivel,
            mesVisivel
        )

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
        >
            <BottomSheetLayout
                titulo={titulo}
                onFechar={onFechar}
            >
                <View style={estilos.calendario}>
                    <View style={estilos.navegacao}>
                        <Pressable
                            onPress={voltarMes}
                            disabled={
                                !anteriorDisponivel
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Mês anterior"
                            accessibilityState={{
                                disabled: !anteriorDisponivel
                            }}
                            style={estilos.botaoNavegacao}
                        >
                            <CaretLeftIcon
                                size={24}
                                color={corSeta}
                                weight="regular"
                            />
                        </Pressable>

                        <Text
                            style={estilos.tituloMes}
                            accessibilityRole="header"
                        >
                            {
                                nomesDosMeses[
                                    mesVisivel - 1
                                ]
                            } {anoVisivel}
                        </Text>

                        <Pressable
                            onPress={avancarMes}
                            disabled={
                                !proximoDisponivel
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Próximo mês"
                            accessibilityState={{
                                disabled: !proximoDisponivel
                            }}
                            style={estilos.botaoNavegacao}
                        >
                            <CaretRightIcon
                                size={24}
                                color={corSeta}
                                weight="regular"
                            />
                        </Pressable>
                    </View>

                    <View style={estilos.linhaSemana}>
                        {nomesDosDias.map(
                            renderizarNomeDoDia
                        )}
                    </View>

                    <View style={estilos.grade}>
                        {casas.map(
                            renderizarCasa
                        )}
                    </View>
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    )
}

export { DatePickerSheet }