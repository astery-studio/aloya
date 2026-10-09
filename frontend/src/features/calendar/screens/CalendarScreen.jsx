// Orquestra calendário, cabeçalho, legenda e estados de erro ou vazio.
import {useEffect, useState} from 'react'
import {Pressable, Text, View} from 'react-native'

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen'
import {ConfidenceBadge} from '../../../shared/components/common/ConfidenceBadge/ConfidenceBadge'
import {ArrowLeftIcon, InfoIcon} from '../../../shared/components/icons/AppIcons'
import AlertModal from '../../../shared/components/feedback/Modal/AlertModal/AlertModal'
import {BottomTabBar} from '../../../shared/components/navigation/BottomTab/BottomTabBar/BottomTabBar'
import {CycleCalendar} from '../components/CycleCalendar/CycleCalendar'
import {CycleLegendSheet} from '../components/CycleLegendSheet/CycleLegendSheet'
import {estilos} from './CalendarScreen.styles'

const ITENS_LEGENDA = Object.freeze([
    {id: 'menstruacao-real', tipo: 'menstruacao', titulo: 'Menstruação', descricao: 'Dias de menstruação', prevista: false},
    {id: 'folicular-real', tipo: 'folicular', titulo: 'Fase Folicular', descricao: 'Período de fase folicular', prevista: false},
    {id: 'ovulacao-real', tipo: 'ovulacao', titulo: 'Ovulação', descricao: 'Período de ovulação', prevista: false},
    {id: 'lutea-real', tipo: 'lutea', titulo: 'Fase Lútea', descricao: 'Período de fase lútea', prevista: false},
    {id: 'janela-real', tipo: 'janelaFertil', titulo: 'Janela Fértil', descricao: 'Dias com maior probabilidade de engravidar', prevista: false},
    {id: 'menstruacao-prevista', tipo: 'menstruacao', titulo: 'Provável Menstruação', descricao: 'Previsão dos dias de menstruação', prevista: true},
    {id: 'folicular-prevista', tipo: 'folicular', titulo: 'Provável Fase Folicular', descricao: 'Previsão do período de fase folicular', prevista: true},
    {id: 'ovulacao-prevista', tipo: 'ovulacao', titulo: 'Provável Ovulação', descricao: 'Previsão do período de ovulação', prevista: true},
    {id: 'lutea-prevista', tipo: 'lutea', titulo: 'Provável Fase Lútea', descricao: 'Previsão de fase lútea', prevista: true},
    {id: 'janela-prevista', tipo: 'janelaFertil', titulo: 'Provável Janela Fértil', descricao: 'Previsão da janela fértil', prevista: true}
])

function normalizarConfianca(valor) {
    if (typeof valor !== 'string') return null

    const nivel = valor.trim().toLocaleLowerCase('pt-BR')

    if (nivel === 'alta' || nivel === 'media' || nivel === 'média' || nivel === 'baixa') {
        return nivel === 'média' ? 'media' : nivel
    }

    return null
}

function CalendarScreen({
    meses = [],
    confianca,
    carregando = false,
    carregandoAnteriores = false,
    carregandoPosteriores = false,
    erro,
    aoCarregarAnteriores,
    aoCarregarPosteriores,
    aoTentarNovamente,
    aoVoltar,
    aoCadastrarMenstruacao,
    onSelecionarAba
}) {
    const [legendaVisivel, setLegendaVisivel] = useState(false)
    const [erroFechado, setErroFechado] = useState(false)

    const mesesValidos = Array.isArray(meses) ? meses : []
    const confiancaValida = normalizarConfianca(confianca)
    const existeErro = typeof erro === 'string' && erro.trim().length > 0
    const possuiCiclos = mesesValidos.some(mes => (
        mes?.possuiCiclos === true
        || mes?.calendario?.possuiCiclos === true
    ))
    const estadoVazio = !carregando && !existeErro && mesesValidos.length > 0 && !possuiCiclos

    useEffect(() => {
        setErroFechado(false)
    }, [erro])

    function tentarNovamente() {
        if (typeof aoTentarNovamente === 'function') {
            setErroFechado(false)
            aoTentarNovamente()
            return
        }

        setErroFechado(true)
    }

    return (
        <View style={estilos.tela}>
            <View testID="cabecalho-calendario" style={estilos.cabecalho}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    accessibilityState={{disabled: typeof aoVoltar !== 'function'}}
                    disabled={typeof aoVoltar !== 'function'}
                    onPress={aoVoltar}
                    style={estilos.acaoCabecalho}
                >
                    <ArrowLeftIcon size={24} color={estilos.corIconeCabecalho} />
                </Pressable>

                <View style={estilos.caixaCalendario}>
                    <View testID="titulo-e-confianca" style={estilos.tituloEConfianca}>
                        <Text accessibilityRole="header" style={estilos.titulo}>
                            Calendário
                        </Text>
                        {!estadoVazio && confiancaValida ? (
                            <ConfidenceBadge nivel={confiancaValida} variante="simples" />
                        ) : null}
                    </View>
                </View>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Abrir legenda do calendário"
                    onPress={() => setLegendaVisivel(true)}
                    hitSlop={8}
                    style={estilos.acaoCabecalho}
                >
                    <InfoIcon size={20} color={estilos.corIconeCabecalho} />
                </Pressable>
            </View>

            <View style={estilos.conteudo}>
                {estadoVazio ? (
                    <View accessibilityRole="alert" style={estilos.avisoVazio}>
                        <Text style={estilos.textoVazio}>
                            Você ainda não possui nenhum ciclo registrado. Toque em um dia no Calendário para começar.
                        </Text>
                    </View>
                ) : null}

                <View style={estilos.areaCalendario}>
                    <CycleCalendar
                        meses={mesesValidos}
                        carregando={carregando}
                        carregandoAnteriores={carregandoAnteriores}
                        carregandoPosteriores={carregandoPosteriores}
                        aoCarregarAnteriores={aoCarregarAnteriores}
                        aoCarregarPosteriores={aoCarregarPosteriores}
                    />
                </View>

                {estadoVazio ? (
                    <View style={estilos.areaAcao}>
                        <ButtonScreen
                            texto="Cadastrar Menstruação"
                            aoPressionar={aoCadastrarMenstruacao}
                        />
                    </View>
                ) : null}
            </View>

            <BottomTabBar
                abaAtiva="diario"
                onSelecionar={onSelecionarAba}
            />

            <CycleLegendSheet
                visivel={legendaVisivel}
                itens={ITENS_LEGENDA}
                aoFechar={() => setLegendaVisivel(false)}
            />

            <AlertModal
                visivel={existeErro && !erroFechado}
                titulo="Não foi possível carregar o calendário"
                mensagem={erro || 'Não foi possível carregar os dados do calendário. Tente novamente.'}
                acaoPrincipal={{
                    texto: typeof aoTentarNovamente === 'function' ? 'Tentar novamente' : 'Fechar',
                    aoPressionar: tentarNovamente
                }}
                aoFechar={() => setErroFechado(true)}
            />
        </View>
    )
}

export {CalendarScreen, ITENS_LEGENDA, normalizarConfianca}
export default CalendarScreen
