//Mostra um calendário para escolher uma única data
import { useEffect, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'

import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft'
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight'
import { CaretDownIcon } from 'phosphor-react-native/src/icons/CaretDown'

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

const meses = [
    1, 2, 3, 4, 5, 6,
    7, 8, 9, 10, 11, 12
]

const anos = []

for (let ano = 1000; ano <= 9999; ano += 1) {
    anos.push(ano)
}

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

/**
 * Recebe um ano da lista.
 * Retorna um texto único para identificar esse item.
 */
function obterChaveDoAno(ano) {
    return String(ano)
}

/**
 * Recebe um mês da lista.
 * Retorna um texto único para identificar esse item.
 */
function obterChaveDoMes(mes) {
    return String(mes)
}

/**
 * Recebe a posição de um ano na lista.
 * Informa o tamanho fixo de cada item para a lista abrir no ano certo.
 * Retorna comprimento e posição do item.
 */
function medirAno(_, indice) {
    return {
        length: 48,
        offset: 48 * indice,
        index: indice
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
    const [listaAberta, setListaAberta] = useState(null)

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

        setListaAberta(null)
    }, [visivel])

    function podeMostrarMes(ano, mes) {
        if (ano < 1000 || ano > 9999) {
            return false
        }

        const antesDoMinimo = limiteMinimoValido && (obterFimDoMes(ano, mes) < limiteMinimoValido)
        const depoisDoMaximo = limiteMaximoValido && (obterInicioDoMes(ano, mes) > limiteMaximoValido)

        return !antesDoMinimo && !depoisDoMaximo
    }

    /**
     * Recebe um ano.
     * Procura um mês permitido nesse ano, dando preferência ao mês aberto.
     * Retorna o mês encontrado ou null.
     */
    function encontrarMesDisponivel(ano) {
        if (podeMostrarMes(ano, mesVisivel)) {
            return mesVisivel
        }

        for (let mes = 1; mes <= 12; mes += 1) {
            if (podeMostrarMes(ano, mes)) {
                return mes
            }
        }

        return null
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

    /**
     * Não recebe dados.
     * Mostra a lista dos doze meses dentro do painel.
     * Não retorna valor.
     */
    function abrirListaDeMeses() {
        setListaAberta('mes')
    }

    /**
     * Não recebe dados.
     * Mostra a lista de anos dentro do painel.
     * Não retorna valor.
     */
    function abrirListaDeAnos() {
        setListaAberta('ano')
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

    /**
     * Recebe uma linha com sete posições.
     * Mostra os dias na mesma divisão das colunas da semana.
     * Retorna uma linha completa do calendário.
     */
    function renderizarLinha(linha, indice) {
        return (
            <View
                key={`linha-${indice}`}
                style={estilos.linhaCalendario}
            >
                {linha.map(renderizarCasa)}
            </View>
        )
    }

    /**
     * Recebe um mês da lista.
     * Mostra o nome do mês e permite escolhê-lo.
     * Retorna a opção desse mês.
     */
    function renderizarMes({ item: mes }) {
        const habilitado =
            podeMostrarMes(anoVisivel, mes)

        /**
         * Não recebe dados.
         * Abre o mês escolhido e volta ao calendário.
         * Não retorna valor.
         */
        function escolherMes() {
            if (!habilitado) {
                return
            }

            setMesVisivel(mes)
            setListaAberta(null)
        }

        return (
            <Pressable
                onPress={escolherMes}
                disabled={!habilitado}
                accessibilityRole="button"
                accessibilityLabel={
                    `${nomesDosMeses[mes - 1]} de ${anoVisivel}`
                }
                accessibilityState={{
                    selected: mes === mesVisivel,
                    disabled: !habilitado
                }}
                style={estilos.opcaoLista}
            >
                <Text
                    style={[
                        estilos.textoOpcao,
                        mes === mesVisivel && estilos.textoOpcaoSelecionada,
                        !habilitado && estilos.textoOpcaoDesabilitada
                    ]}
                >
                    {nomesDosMeses[mes - 1]}
                </Text>
            </Pressable>
        )
    }

    /**
     * Recebe um ano da lista.
     * Mostra o ano e permite escolhê-lo.
     * Retorna a opção desse ano.
     */
    function renderizarAno({ item: ano }) {
        const mesDisponivel =
            encontrarMesDisponivel(ano)

        const habilitado =
            mesDisponivel !== null

        /**
         * Não recebe dados.
         * Abre o ano escolhido em um mês permitido.
         * Não retorna valor.
         */
        function escolherAno() {
            if (!habilitado) {
                return
            }

            setAnoVisivel(ano)
            setMesVisivel(mesDisponivel)
            setListaAberta(null)
        }

        return (
            <Pressable
                onPress={escolherAno}
                disabled={!habilitado}
                accessibilityRole="button"
                accessibilityLabel={`Ano ${ano}`}
                accessibilityState={{
                    selected: ano === anoVisivel,
                    disabled: !habilitado
                }}
                style={estilos.opcaoLista}
            >
                <Text
                    style={[
                        estilos.textoOpcao,
                        ano === anoVisivel && estilos.textoOpcaoSelecionada,
                        !habilitado && estilos.textoOpcaoDesabilitada
                    ]}
                >
                    {ano}
                </Text>
            </Pressable>
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

    const linhas = []

    for (
        let indice = 0;
        indice < casas.length;
        indice += 7
    ) {
        linhas.push(
            casas.slice(indice, indice + 7)
        )
    }

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
                            disabled={!anteriorDisponivel}
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

                        <View style={estilos.tituloData}>
                            <Pressable
                                onPress={abrirListaDeMeses}
                                accessibilityRole="button"
                                accessibilityLabel="Escolher mês"
                                style={estilos.botaoTitulo}
                            >
                                <Text style={estilos.tituloMes}>
                                    {nomesDosMeses[mesVisivel - 1]}
                                </Text>

                                <CaretDownIcon
                                    size={14}
                                    color={corSeta}
                                    weight="regular"
                                />
                            </Pressable>

                            <Pressable
                                onPress={abrirListaDeAnos}
                                accessibilityRole="button"
                                accessibilityLabel="Escolher ano"
                                style={estilos.botaoTitulo}
                            >
                                <Text style={estilos.tituloMes}>
                                    {anoVisivel}
                                </Text>

                                <CaretDownIcon
                                    size={14}
                                    color={corSeta}
                                    weight="regular"
                                />
                            </Pressable>
                        </View>

                        <Pressable
                            onPress={avancarMes}
                            disabled={!proximoDisponivel}
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

                    {listaAberta === 'mes' ? (
                        <FlatList
                            data={meses}
                            renderItem={renderizarMes}
                            keyExtractor={obterChaveDoMes}
                            style={estilos.listaOpcoes}
                            initialNumToRender={12}
                        />
                    ) : listaAberta === 'ano' ? (
                        <FlatList
                            data={anos}
                            renderItem={renderizarAno}
                            keyExtractor={obterChaveDoAno}
                            getItemLayout={medirAno}
                            initialScrollIndex={
                                anoVisivel - 1000
                            }
                            initialNumToRender={10}
                            windowSize={5}
                            style={estilos.listaOpcoes}
                        />
                    ) : (
                        <>
                            <View style={estilos.linhaSemana}>
                                {nomesDosDias.map(
                                    renderizarNomeDoDia
                                )}
                            </View>

                            <View style={estilos.grade}>
                                {linhas.map(
                                    renderizarLinha
                                )}
                            </View>
                        </>
                    )}
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    )
}

export { DatePickerSheet }