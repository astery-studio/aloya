//Mostra meses virtualizados do calendário sem renderizar todo o histórico.
import {
    memo,
    useCallback,
    useMemo,
    useRef,
    useState
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
            style={inicial ? estilos.carregamentoInicial : estilos.carregamentoPaginacao}
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
    const [hoje] = useState(obterHojeLocal)
    const posicionamentoInicialConcluido = useRef(false)
    const usuarioInteragiu = useRef(false)
    const solicitouAnteriores = useRef(false)
    const solicitouPosteriores = useRef(false)

    const mesesNormalizados = useMemo(
        () => normalizarMeses(meses, hoje),
        [hoje, meses]
    )

    const indiceMesAtual = useMemo(() => {
        const chaveAtual = hoje.slice(0, 7)
        const indiceExato = mesesNormalizados.findIndex((mes) => mes.chave === chaveAtual)

        if (indiceExato >= 0) return indiceExato

        for (let indice = mesesNormalizados.length - 1; indice >= 0; indice -= 1) {
            if (mesesNormalizados[indice].chave <= chaveAtual) return indice
        }

        return mesesNormalizados.length > 0 ? 0 : -1
    }, [hoje, mesesNormalizados])

    const layoutsMeses = useMemo(() => {
        let deslocamento = 0

        return mesesNormalizados.map((mes, index) => {
            const comprimento = 58.982 + mes.semanas.length * 53.99
            const layout = {index, length: comprimento, offset: deslocamento}
            deslocamento += comprimento
            return layout
        })
    }, [mesesNormalizados])

    const obterLayoutMes = useCallback(
        (_, index) => layoutsMeses[index],
        [layoutsMeses]
    )

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
        if (posicionamentoInicialConcluido.current || indiceMesAtual < 0) return

        posicionamentoInicialConcluido.current = true
        listaRef.current?.scrollToIndex({
            index: indiceMesAtual,
            animated: false,
            viewPosition: 1
        })
    }, [indiceMesAtual])

    const registrarInteracao = useCallback(() => {
        usuarioInteragiu.current = true
        solicitouAnteriores.current = false
        solicitouPosteriores.current = false
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
                getItemLayout={obterLayoutMes}
                style={estilos.lista}
                contentContainerStyle={estilos.conteudoLista}
                ListHeaderComponent={carregandoAnteriores ? (
                    <IndicadorCarregamento rotulo="Carregando meses anteriores" />
                ) : null}
                ListFooterComponent={carregandoPosteriores ? (
                    <IndicadorCarregamento rotulo="Carregando próximos meses" />
                ) : null}
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