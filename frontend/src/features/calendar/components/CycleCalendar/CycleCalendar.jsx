//Mostra meses virtualizados do calendário sem renderizar todo o histórico.
import {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef
} from 'react'
import {
    ActivityIndicator,
    FlatList,
    Platform,
    Text,
    View
} from 'react-native'

import {cores} from '../../../../shared/theme'
import {
    normalizarMeses,
    obterHojeLocal
} from '../../utils/cycleCalendar.utils'
import {CycleMonth} from './CycleMonth'
import {estilos} from './CycleCalendar.styles'

const DIAS_SEMANA = Object.freeze([
    'Dom',
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sáb'
])

const CONFIGURACAO_POSICAO = Object.freeze({
    minIndexForVisible: 0
})

function IndicadorCarregamento({rotulo, inicial = false}) {
    return (
        <View
            accessibilityRole="progressbar"
            accessibilityLabel={rotulo}
            style={inicial
                ? estilos.carregamentoInicial
                : estilos.carregamentoPaginacao}
        >
            <ActivityIndicator
                color={cores.marca.primaria}
                size={inicial ? 'large' : 'small'}
            />
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
    const hojeRef = useRef(obterHojeLocal())
    const posicionamentoInicialConcluido = useRef(false)
    const usuarioInteragiu = useRef(false)
    const solicitouAnteriores = useRef(false)
    const solicitouPosteriores = useRef(false)

    const mesesNormalizados = useMemo(
        () => normalizarMeses(meses, hojeRef.current),
        [meses]
    )

    useEffect(() => {
        if (mesesNormalizados.length === 0) {
            posicionamentoInicialConcluido.current = false
        }

        solicitouAnteriores.current = false
        solicitouPosteriores.current = false
    }, [mesesNormalizados.length])

    useEffect(() => {
        if (!carregandoAnteriores) solicitouAnteriores.current = false
    }, [carregandoAnteriores])

    useEffect(() => {
        if (!carregandoPosteriores) solicitouPosteriores.current = false
    }, [carregandoPosteriores])

    const renderizarMes = useCallback(({item}) => (
        <CycleMonth
            mes={item}
            aoPressionarDia={aoPressionarDia}
        />
    ), [aoPressionarDia])

    const extrairChave = useCallback(
        (item) => item.chave,
        []
    )

    const posicionarNoMesAtual = useCallback(() => {
        if (
            posicionamentoInicialConcluido.current
            || mesesNormalizados.length === 0
        ) {
            return
        }

        posicionamentoInicialConcluido.current = true

        listaRef.current?.scrollToEnd({
            animated: false
        })
    }, [mesesNormalizados.length])

    const registrarInteracao = useCallback(() => {
        usuarioInteragiu.current = true
    }, [])

    const verificarInicio = useCallback((evento) => {
        const deslocamento = evento.nativeEvent.contentOffset.y

        if (
            deslocamento > 96
            || !usuarioInteragiu.current
            || carregandoAnteriores
            || solicitouAnteriores.current
            || typeof aoCarregarAnteriores !== 'function'
        ) {
            return
        }

        solicitouAnteriores.current = true
        aoCarregarAnteriores()
    }, [aoCarregarAnteriores, carregandoAnteriores])

    const verificarFinal = useCallback(() => {
        if (
            !usuarioInteragiu.current
            || carregandoPosteriores
            || solicitouPosteriores.current
            || typeof aoCarregarPosteriores !== 'function'
        ) {
            return
        }

        solicitouPosteriores.current = true
        aoCarregarPosteriores()
    }, [aoCarregarPosteriores, carregandoPosteriores])

    if (carregando && mesesNormalizados.length === 0) {
        return (
            <View style={estilos.calendario}>
                <IndicadorCarregamento
                    inicial
                    rotulo="Carregando calendário"
                />
            </View>
        )
    }

    return (
        <View style={estilos.calendario}>
            <View
                accessible
                accessibilityRole="header"
                accessibilityLabel="Dias da semana"
                style={estilos.cabecalhoSemana}
            >
                {DIAS_SEMANA.map((dia) => (
                    <Text
                        key={dia}
                        style={estilos.nomeDiaSemana}
                    >
                        {dia}
                    </Text>
                ))}
            </View>

            <FlatList
                ref={listaRef}
                testID="cycle-calendar-list"
                data={mesesNormalizados}
                renderItem={renderizarMes}
                keyExtractor={extrairChave}
                style={estilos.lista}
                contentContainerStyle={estilos.conteudoLista}
                ListHeaderComponent={carregandoAnteriores
                    ? (
                        <IndicadorCarregamento
                            rotulo="Carregando meses anteriores"
                        />
                    )
                    : null}
                ListFooterComponent={carregandoPosteriores
                    ? (
                        <IndicadorCarregamento
                            rotulo="Carregando próximos meses"
                        />
                    )
                    : null}
                initialNumToRender={2}
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={50}
                windowSize={3}
                removeClippedSubviews={Platform.OS === 'android'}
                maintainVisibleContentPosition={CONFIGURACAO_POSICAO}
                onContentSizeChange={posicionarNoMesAtual}
                onScrollBeginDrag={registrarInteracao}
                onScroll={verificarInicio}
                scrollEventThrottle={32}
                onEndReached={verificarFinal}
                onEndReachedThreshold={0.15}
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