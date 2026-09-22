//Mostra um calendário para escolher uma única data
import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {FlatList, Platform, Pressable, Text, View, VirtualizedList} from 'react-native'

import {CaretLeftIcon} from 'phosphor-react-native/src/icons/CaretLeft'
import {CaretRightIcon} from 'phosphor-react-native/src/icons/CaretRight'
import {CaretDownIcon} from 'phosphor-react-native/src/icons/CaretDown'

import {BottomSheet} from '../Bottomsheet/BottomSheet'
import {BottomSheetLayout} from '../../../layouts/BottomSheet/BottomSheetLayout'
import {getMonthDays} from '../../../utils/getMonthDays'
import {estilos,corSeta} from './DatePickerSheet.style'

const nomesDosMeses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const nomesDosDias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const meses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const anoMinimoPermitido = 1900
const anoMaximoPermitido = 2100

const intervaloDosAnos = Object.freeze({
    anoInicial: anoMinimoPermitido,
    quantidade: anoMaximoPermitido - anoMinimoPermitido + 1
})

const mensagemDeErro = 'Não foi possível salvar a data. Tente novamente.'

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
        ano < anoMinimoPermitido || ano > anoMaximoPermitido || mes < 1 || mes > 12
    ) {
        return null
    }

    const ultimoDia =
        new Date(
            ano,
            mes,
            0
        ).getDate()

    if (
        dia < 1 || dia > ultimoDia
    ) {
        return null
    }

    return {
        ano,
        mes,
        dia,
        texto: data
    }
}

function obterDataInicial(valorSelecionado) {
    const dataSelecionada = lerData(valorSelecionado)

    if (dataSelecionada) {
        return {
            ano: dataSelecionada.ano,
            mes: dataSelecionada.mes
        }
    }

    const hoje = new Date()

    return {
        ano: hoje.getFullYear(),
        mes: hoje.getMonth() + 1
    }
}

function obterInicioDoMes(ano, mes) {
    return (
        `${ano}-` + `${String(mes).padStart(2, '0')}-` + '01'
    )
}

function obterFimDoMes(ano, mes) {
    const ultimoDia =
        new Date(
            ano,
            mes,
            0
        ).getDate()

    return (
        `${ano}-` + `${String(mes).padStart(2, '0')}-` + String(ultimoDia).padStart(2, '0')
    )
}

function deslocarMes(ano, mes, deslocamento) {
    const total = ano * 12 + (mes - 1) + deslocamento

    return {
        ano: Math.floor(total / 12),
        mes: (total % 12) + 1
    }
}

function obterChaveDoAno(ano) {
    return String(ano)
}

function obterChaveDoMes(mes) {
    return String(mes)
}

function obterAno(intervalo, indice) {
    return (
        intervalo.anoInicial + indice
    )
}

function obterQuantidadeDeAnos(intervalo) {
    return intervalo.quantidade
}

function medirAno(_, indice) {
    return {
        length: 48,
        offset: 48 * indice,
        index: indice
    }
}

function DiaCalendario({ casa, nomeDoMes, ano, selecionado, habilitado, salvando, onSelecionar }) {
    function selecionarDia() {
        onSelecionar(casa.data)
    }

    return (
        <View style={estilos.casaDia}>
            <Pressable
                onPress={selecionarDia}
                disabled={!habilitado || salvando}
                accessibilityRole="button"
                accessibilityLabel={`Dia ${casa.dia} de ` + `${nomeDoMes} de ${ano}`}
                accessibilityState={{
                    selected: selecionado,
                    disabled: !habilitado || salvando
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

const DiaCalendarioMemorizado = memo(DiaCalendario)

function LinhaCalendario({ linha, indiceDaLinha, nomeDoMes, ano, valorSelecionado, salvando, podeSelecionarDia, onSelecionar }) {
    return (
        <View
            key={`linha-${indiceDaLinha}`}
            style={estilos.linhaCalendario}
        >
            {linha.map(
                (casa, indiceDaCasa) => {
                    if (!casa) {
                        return (
                            <View
                                key={`vazio-` + `${indiceDaLinha}-` + indiceDaCasa}
                                style={estilos.casaDia}
                            />
                        )
                    }

                    return (
                        <DiaCalendarioMemorizado
                            key={casa.data}
                            casa={casa}
                            nomeDoMes={nomeDoMes}
                            ano={ano}
                            selecionado={casa.data === valorSelecionado}
                            habilitado={podeSelecionarDia(casa.data)}
                            salvando={salvando}
                            onSelecionar={onSelecionar}
                        />
                    )
                }
            )}
        </View>
    )
}

const LinhaCalendarioMemorizada = memo(LinhaCalendario)

function DatePickerSheet({visivel, titulo = 'Selecionar data', valorSelecionado = null, onSelecionar, onFechar, dataMinima = null, dataMaxima = null}) {
    const [dataVisivel, setDataVisivel] = useState(() => obterDataInicial(valorSelecionado))
    const [listaAberta, setListaAberta] = useState(null)
    const [salvando, setSalvando] = useState(false)
    const [erroSalvar, setErroSalvar] = useState('')

    const salvamentoEmAndamento = useRef(false)

    const anoVisivel = dataVisivel.ano
    const mesVisivel = dataVisivel.mes

    const limiteMinimoValido = useMemo(() => lerData(dataMinima),[dataMinima])
    const limiteMaximoValido = useMemo(() => lerData(dataMaxima),[dataMaxima])

    useEffect(() => {
        if (!visivel) {
            return
        }

        setDataVisivel(
            obterDataInicial(
                valorSelecionado
            )
        )

        setListaAberta(null)
        setErroSalvar('')
    }, [
        visivel
    ])

    const podeMostrarMes = useCallback((ano, mes) => {
        if (
            ano < anoMinimoPermitido || ano > anoMaximoPermitido
        ) {
            return false
        }

        const inicioDoMes = obterInicioDoMes(ano, mes)
        const fimDoMes = obterFimDoMes(ano, mes)

        const antesDoMinimo = limiteMinimoValido && fimDoMes < limiteMinimoValido.texto
        const depoisDoMaximo = limiteMaximoValido && inicioDoMes > limiteMaximoValido.texto

        return (
            !antesDoMinimo && !depoisDoMaximo
        )
    }, [limiteMinimoValido, limiteMaximoValido])

    const encontrarMesDisponivel = useCallback((ano) => {
        if (podeMostrarMes(ano, mesVisivel)) {
            return mesVisivel
        }

        for (let mes = 1; mes <= 12; mes += 1) {
            if (podeMostrarMes(ano, mes)) {
                return mes
            }
        }

        return null
    }, [mesVisivel, podeMostrarMes])

    const mudarMes = useCallback((direcao) => {
        const proximo = deslocarMes(anoVisivel, mesVisivel, direcao)

        if (!podeMostrarMes(proximo.ano, proximo.mes)) {
            return
        }

        setDataVisivel(proximo)
    }, [anoVisivel, mesVisivel, podeMostrarMes])

    const voltarMes = useCallback(() => {
        mudarMes(-1)
    }, [mudarMes])

    const avancarMes = useCallback(() => {
        mudarMes(1)
    }, [mudarMes])

    const abrirListaDeMeses = useCallback(() => {
        if (!salvando) {
            setListaAberta('mes')
        }
    }, [salvando])

    const abrirListaDeAnos = useCallback(() => {
        if (!salvando) {
            setListaAberta('ano')
        }
    }, [salvando])

    const podeSelecionarDia = useCallback((data) => {
        const depoisDoMinimo = !limiteMinimoValido || data >= limiteMinimoValido.texto
        const antesDoMaximo = !limiteMaximoValido || data <= limiteMaximoValido.texto

        return (
            depoisDoMinimo && antesDoMaximo
        )
    }, [limiteMinimoValido, limiteMaximoValido])

    const selecionarDia =
        useCallback(
            async (data) => {
                if (
                    salvamentoEmAndamento
                        .current
                ) {
                    return
                }

                if (
                    typeof onSelecionar
                    !== 'function'
                ) {
                    setErroSalvar(
                        mensagemDeErro
                    )
                    return
                }

                salvamentoEmAndamento
                    .current = true

                setSalvando(true)
                setErroSalvar('')

                let salvou = false

                try {
                    const resultado =
                        await onSelecionar(
                            data
                        )

                    if (
                        resultado === false
                    ) {
                        setErroSalvar(
                            mensagemDeErro
                        )
                        return
                    }

                    salvou = true
                } catch {
                    setErroSalvar(
                        mensagemDeErro
                    )
                } finally {
                    salvamentoEmAndamento
                        .current = false

                    setSalvando(false)
                }

                if (salvou) {
                    onFechar?.()
                }
            },
            [
                onSelecionar,
                onFechar
            ]
        )

    const casasDoMes =
        useMemo(
            () =>
                getMonthDays(
                    anoVisivel,
                    mesVisivel
                ),
            [
                anoVisivel,
                mesVisivel
            ]
        )

    const linhasDoMes =
        useMemo(() => {
            const novasLinhas = []

            for (
                let indice = 0;
                indice
                    < casasDoMes.length;
                indice += 7
            ) {
                novasLinhas.push(
                    casasDoMes.slice(
                        indice,
                        indice + 7
                    )
                )
            }

            return novasLinhas
        }, [
            casasDoMes
        ])

    const renderizarMes =
        useCallback(
            ({item: mes}) => {
                const habilitado =
                    podeMostrarMes(
                        anoVisivel,
                        mes
                    )

                function escolherMes() {
                    if (
                        !habilitado
                        || salvando
                    ) {
                        return
                    }

                    setDataVisivel({
                        ano: anoVisivel,
                        mes
                    })

                    setListaAberta(null)
                }

                return (
                    <Pressable
                        onPress={
                            escolherMes
                        }
                        disabled={
                            !habilitado
                            || salvando
                        }
                        accessibilityRole="button"
                        accessibilityLabel={
                            `${nomesDosMeses[
                                mes - 1
                            ]} de ${anoVisivel}`
                        }
                        accessibilityState={{
                            selected:
                                mes
                                === mesVisivel,
                            disabled:
                                !habilitado
                                || salvando
                        }}
                        style={
                            estilos.opcaoLista
                        }
                    >
                        <Text
                            style={[
                                estilos.textoOpcao,
                                mes
                                    === mesVisivel
                                && estilos
                                    .textoOpcaoSelecionada,
                                !habilitado
                                && estilos
                                    .textoOpcaoDesabilitada
                            ]}
                        >
                            {
                                nomesDosMeses[
                                    mes - 1
                                ]
                            }
                        </Text>
                    </Pressable>
                )
            },
            [
                anoVisivel,
                mesVisivel,
                podeMostrarMes,
                salvando
            ]
        )

    const renderizarAno =
        useCallback(
            ({item: ano}) => {
                const mesDisponivel =
                    encontrarMesDisponivel(
                        ano
                    )

                const habilitado =
                    mesDisponivel
                    !== null

                function escolherAno() {
                    if (
                        !habilitado
                        || salvando
                    ) {
                        return
                    }

                    setDataVisivel({
                        ano,
                        mes: mesDisponivel
                    })

                    setListaAberta(null)
                }

                return (
                    <Pressable
                        onPress={
                            escolherAno
                        }
                        disabled={
                            !habilitado
                            || salvando
                        }
                        accessibilityRole="button"
                        accessibilityLabel={
                            `Ano ${ano}`
                        }
                        accessibilityState={{
                            selected:
                                ano
                                === anoVisivel,
                            disabled:
                                !habilitado
                                || salvando
                        }}
                        style={
                            estilos.opcaoLista
                        }
                    >
                        <Text
                            style={[
                                estilos.textoOpcao,
                                ano
                                    === anoVisivel
                                && estilos
                                    .textoOpcaoSelecionada,
                                !habilitado
                                && estilos
                                    .textoOpcaoDesabilitada
                            ]}
                        >
                            {ano}
                        </Text>
                    </Pressable>
                )
            },
            [
                anoVisivel,
                encontrarMesDisponivel,
                salvando
            ]
        )

    const anterior =
        useMemo(
            () =>
                deslocarMes(
                    anoVisivel,
                    mesVisivel,
                    -1
                ),
            [
                anoVisivel,
                mesVisivel
            ]
        )

    const proximo =
        useMemo(
            () =>
                deslocarMes(
                    anoVisivel,
                    mesVisivel,
                    1
                ),
            [
                anoVisivel,
                mesVisivel
            ]
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

    const nomeDoMes =
        nomesDosMeses[
            mesVisivel - 1
        ]

    const chaveDaListaDeAnos =
        `${anoVisivel}-`
        + `${mesVisivel}-`
        + String(salvando)

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            bloquearFechamento={
                salvando
            }
        >
            <BottomSheetLayout
                titulo={titulo}
                onFechar={onFechar}
                bloquearFechamento={
                    salvando
                }
            >
                <View
                    style={
                        estilos.calendario
                    }
                >
                    <View
                        style={
                            estilos.navegacao
                        }
                    >
                        <Pressable
                            onPress={
                                voltarMes
                            }
                            disabled={
                                !anteriorDisponivel
                                || salvando
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Mês anterior"
                            accessibilityState={{
                                disabled:
                                    !anteriorDisponivel
                                    || salvando
                            }}
                            style={
                                estilos
                                    .botaoNavegacao
                            }
                        >
                            <CaretLeftIcon
                                size={24}
                                color={corSeta}
                                weight="regular"
                            />
                        </Pressable>

                        <View
                            style={
                                estilos.tituloData
                            }
                        >
                            <Pressable
                                onPress={
                                    abrirListaDeMeses
                                }
                                disabled={
                                    salvando
                                }
                                accessibilityRole="button"
                                accessibilityLabel="Escolher mês"
                                style={
                                    estilos
                                        .botaoTitulo
                                }
                            >
                                <Text
                                    style={
                                        estilos
                                            .tituloMes
                                    }
                                >
                                    {nomeDoMes}
                                </Text>

                                <CaretDownIcon
                                    size={14}
                                    color={corSeta}
                                    weight="regular"
                                />
                            </Pressable>

                            <Pressable
                                onPress={
                                    abrirListaDeAnos
                                }
                                disabled={
                                    salvando
                                }
                                accessibilityRole="button"
                                accessibilityLabel="Escolher ano"
                                style={
                                    estilos
                                        .botaoTitulo
                                }
                            >
                                <Text
                                    style={
                                        estilos
                                            .tituloMes
                                    }
                                >
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
                            onPress={
                                avancarMes
                            }
                            disabled={
                                !proximoDisponivel
                                || salvando
                            }
                            accessibilityRole="button"
                            accessibilityLabel="Próximo mês"
                            accessibilityState={{
                                disabled:
                                    !proximoDisponivel
                                    || salvando
                            }}
                            style={
                                estilos
                                    .botaoNavegacao
                            }
                        >
                            <CaretRightIcon
                                size={24}
                                color={corSeta}
                                weight="regular"
                            />
                        </Pressable>
                    </View>

                    {
                        listaAberta
                        === 'mes'
                        ? (
                            <FlatList
                                data={meses}
                                renderItem={
                                    renderizarMes
                                }
                                keyExtractor={
                                    obterChaveDoMes
                                }
                                extraData={
                                    mesVisivel
                                }
                                initialNumToRender={
                                    12
                                }
                                style={
                                    estilos
                                        .listaOpcoes
                                }
                            />
                        )
                        : listaAberta
                            === 'ano'
                            ? (
                                <VirtualizedList
                                    data={
                                        intervaloDosAnos
                                    }
                                    getItem={
                                        obterAno
                                    }
                                    getItemCount={
                                        obterQuantidadeDeAnos
                                    }
                                    renderItem={
                                        renderizarAno
                                    }
                                    keyExtractor={
                                        obterChaveDoAno
                                    }
                                    getItemLayout={
                                        medirAno
                                    }
                                    initialScrollIndex={
                                        anoVisivel
                                        - anoMinimoPermitido
                                    }
                                    initialNumToRender={
                                        8
                                    }
                                    maxToRenderPerBatch={
                                        8
                                    }
                                    updateCellsBatchingPeriod={
                                        50
                                    }
                                    windowSize={3}
                                    removeClippedSubviews={
                                        Platform.OS
                                        === 'android'
                                    }
                                    extraData={
                                        chaveDaListaDeAnos
                                    }
                                    style={
                                        estilos
                                            .listaOpcoes
                                    }
                                />
                            )
                            : (
                                <>
                                    <View
                                        style={
                                            estilos
                                                .linhaSemana
                                        }
                                    >
                                        {
                                            nomesDosDias.map(
                                                (
                                                    nome
                                                ) => (
                                                    <View
                                                        key={
                                                            nome
                                                        }
                                                        style={
                                                            estilos
                                                                .casaSemana
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                estilos
                                                                    .textoSemana
                                                            }
                                                        >
                                                            {
                                                                nome
                                                            }
                                                        </Text>
                                                    </View>
                                                )
                                            )
                                        }
                                    </View>

                                    <View
                                        style={
                                            estilos
                                                .grade
                                        }
                                    >
                                        {
                                            linhasDoMes.map(
                                                (
                                                    linha,
                                                    indice
                                                ) => (
                                                    <LinhaCalendarioMemorizada
                                                        key={
                                                            `linha-${indice}`
                                                        }
                                                        linha={
                                                            linha
                                                        }
                                                        indiceDaLinha={
                                                            indice
                                                        }
                                                        nomeDoMes={
                                                            nomeDoMes
                                                        }
                                                        ano={
                                                            anoVisivel
                                                        }
                                                        valorSelecionado={
                                                            valorSelecionado
                                                        }
                                                        salvando={
                                                            salvando
                                                        }
                                                        podeSelecionarDia={
                                                            podeSelecionarDia
                                                        }
                                                        onSelecionar={
                                                            selecionarDia
                                                        }
                                                    />
                                                )
                                            )
                                        }
                                    </View>
                                </>
                            )
                    }

                    {
                        salvando
                        ? (
                            <Text
                                style={
                                    estilos.mensagem
                                }
                                accessibilityLiveRegion="polite"
                            >
                                Salvando data...
                            </Text>
                        )
                        : null
                    }

                    {
                        erroSalvar
                        ? (
                            <Text
                                style={
                                    estilos
                                        .mensagemErro
                                }
                                accessibilityLiveRegion="polite"
                            >
                                {erroSalvar}
                            </Text>
                        )
                        : null
                    }
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    )
}

export { DatePickerSheet }