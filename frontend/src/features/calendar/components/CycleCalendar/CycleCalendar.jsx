//Mostra meses virtualizados do calendário sem renderizar todo o histórico.
import {memo, useCallback, useMemo, useRef, useState} from 'react'
import {ActivityIndicator, FlatList, Platform, Text, View} from 'react-native'
import {cores} from '../../../../shared/theme'
import {criarNormalizadorMeses, obterHojeLocal} from '../../utils/cycleCalendar.utils'
import {CycleMonth} from './CycleMonth'
import {estilos} from './CycleCalendar.styles'

const DIAS_SEMANA = Object.freeze(['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'])
const CONFIGURACAO_POSICAO = Object.freeze({minIndexForVisible: 0})
const LIMIAR_FINAL = 0.15

function IndicadorCarregamento({rotulo, inicial = false}) {
    return (
        <View accessibilityRole="progressbar" accessibilityLabel={rotulo} style={inicial ? estilos.carregamentoInicial : estilos.carregamentoPaginacao}>
            <ActivityIndicator color={cores.marca.primaria} size={inicial ? 'large' : 'small'} />
        </View>
    )
}

function CycleCalendar({
    meses,
    carregando = false,
    carregandoAnteriores = false,
    carregandoPosteriores = false,
    aoCarregarAnteriores,
    aoCarregarPosteriores,
    aoPressionarDia
}) {
    const listaRef = useRef(null)
    const [hoje] = useState(obterHojeLocal)
    const usuarioInteragiu = useRef(false)
    const solicitouAnteriores = useRef(null)
    const solicitouPosteriores = useRef(null)

    const normalizar = useMemo(() => criarNormalizadorMeses(hoje), [hoje])
    const mesesNormalizados = useMemo(() => normalizar(meses), [normalizar, meses])
    const primeiroMes = mesesNormalizados[0]?.chave
    const ultimoMes = mesesNormalizados[mesesNormalizados.length - 1]?.chave

    const indiceMesAtual = useMemo(() => {
        const chaveAtual = hoje.slice(0, 7)
        const indiceExato = mesesNormalizados.findIndex((mes) => mes.chave === chaveAtual)

        if (indiceExato >= 0) return indiceExato

        for (let indice = mesesNormalizados.length - 1; indice >= 0; indice -= 1) {
            if (mesesNormalizados[indice].chave <= chaveAtual) return indice
        }

        return mesesNormalizados.length > 0 ? 0 : undefined
    }, [hoje, mesesNormalizados])

    const layoutsMeses = useMemo(() => {
        //O cabeçalho integra o conteúdo rolável e precisa entrar nos offsets.
        let deslocamento = carregandoAnteriores ? estilos.carregamentoPaginacao.height : 0
        const layouts = []

        for (const [index, mes] of mesesNormalizados.entries()) {
            const comprimento = 58.982 + mes.semanas.length * 53.99
            layouts.push({index, length: comprimento, offset: deslocamento})
            deslocamento += comprimento
        }

        return layouts
    }, [carregandoAnteriores, mesesNormalizados])

    const obterLayoutMes = useCallback((_, index) => layoutsMeses[index], [layoutsMeses])

    const renderizarMes = useCallback(({item}) => (
        <CycleMonth mes={item} aoPressionarDia={aoPressionarDia} />
    ), [aoPressionarDia])

    const extrairChave = useCallback((item) => item.chave, [])

    const verificarInicio = useCallback((evento) => {
        const deslocamento = evento.nativeEvent.contentOffset.y

        if (
            deslocamento > 96
            || !usuarioInteragiu.current
            || carregandoAnteriores
            || !primeiroMes
            || solicitouAnteriores.current === primeiroMes
            || typeof aoCarregarAnteriores !== 'function'
        ) return

        solicitouAnteriores.current = primeiroMes
        aoCarregarAnteriores()
    }, [aoCarregarAnteriores, carregandoAnteriores, primeiroMes])

    const verificarFinal = useCallback(() => {
        if (
            !usuarioInteragiu.current
            || carregandoPosteriores
            || !ultimoMes
            || solicitouPosteriores.current === ultimoMes
            || typeof aoCarregarPosteriores !== 'function'
        ) return

        solicitouPosteriores.current = ultimoMes
        aoCarregarPosteriores()
    }, [aoCarregarPosteriores, carregandoPosteriores, ultimoMes])

    const verificarFinalPorPosicao = useCallback((evento) => {
        const medidas = evento?.nativeEvent
        const alturaConteudo = medidas?.contentSize?.height
        const alturaVisivel = medidas?.layoutMeasurement?.height
        const deslocamento = medidas?.contentOffset?.y

        if (!Number.isFinite(alturaConteudo) || !Number.isFinite(alturaVisivel)
            || !Number.isFinite(deslocamento) || alturaVisivel <= 0) return

        if (alturaConteudo - alturaVisivel - deslocamento <= alturaVisivel * LIMIAR_FINAL) {
            verificarFinal()
        }
    }, [verificarFinal])

    const registrarInteracao = useCallback((evento) => {
        usuarioInteragiu.current = true
        solicitouAnteriores.current = null
        solicitouPosteriores.current = null
        //onEndReached pode ter sido consumido antes da primeira interação.
        verificarFinalPorPosicao(evento)
    }, [verificarFinalPorPosicao])

    const verificarRolagem = useCallback((evento) => {
        verificarInicio(evento)
        verificarFinalPorPosicao(evento)
    }, [verificarInicio, verificarFinalPorPosicao])

    if (carregando && mesesNormalizados.length === 0) {
        return (
            <View style={estilos.calendario}>
                <IndicadorCarregamento inicial rotulo="Carregando calendário" />
            </View>
        )
    }

    return (
        <View style={estilos.calendario}>
            <View accessible accessibilityRole="header" accessibilityLabel="Dias da semana" style={estilos.cabecalhoSemana}>
                {DIAS_SEMANA.map((dia) => (
                    <Text key={dia} style={estilos.nomeDiaSemana}>{dia}</Text>
                ))}
            </View>

            <FlatList
                ref={listaRef}
                testID="cycle-calendar-list"
                data={mesesNormalizados}
                renderItem={renderizarMes}
                keyExtractor={extrairChave}
                getItemLayout={obterLayoutMes}
                initialScrollIndex={indiceMesAtual}
                style={estilos.lista}
                contentContainerStyle={estilos.conteudoLista}
                //Mantém o índice da âncora nativa estável ao mostrar/esconder o indicador.
                ListHeaderComponent={
                    <View collapsable={false}>
                        {carregandoAnteriores ? <IndicadorCarregamento rotulo="Carregando meses anteriores" /> : null}
                    </View>
                }
                ListFooterComponent={carregandoPosteriores ? <IndicadorCarregamento rotulo="Carregando próximos meses" /> : null}
                initialNumToRender={2}
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={50}
                windowSize={3}
                removeClippedSubviews={Platform.OS === 'android'}
                maintainVisibleContentPosition={CONFIGURACAO_POSICAO}
                onScrollBeginDrag={registrarInteracao}
                onScroll={verificarRolagem}
                scrollEventThrottle={32}
                onEndReached={verificarFinal}
                onEndReachedThreshold={LIMIAR_FINAL}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

const CycleCalendarMemorizado = memo(CycleCalendar)

export {
    CycleCalendarMemorizado as CycleCalendar
}

export default CycleCalendarMemorizado
