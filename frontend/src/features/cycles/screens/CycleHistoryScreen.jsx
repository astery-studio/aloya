//Compõe o resumo, a lista e os estados de carregamento, vazio e erro do histórico de ciclos.
import {ActivityIndicator, FlatList, Pressable, Text, View} from 'react-native'

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen'
import {MainLayout} from '../../../shared/layouts/MainLayout/MainLayout'
import {tema} from '../../../shared/theme'
import {CycleHistoryCard} from '../components/CycleHistoryCard/CycleHistoryCard'
import {CycleSummaryCard} from '../components/CycleSummaryCard/CycleSummaryCard'
import {estilos} from './CycleHistoryScreen.styles'

const confiancasPermitidas = Object.freeze([
    'alta',
    'media',
    'baixa'
])

function normalizarResumo(resumo) {
    const resumoSeguro = resumo && typeof resumo === 'object' ? resumo : {}

    return {
        cicloMedioDias: resumoSeguro.cicloMedioDias,
        menstruacaoMediaDias: resumoSeguro.menstruacaoMediaDias,
        quantidadeCiclos: resumoSeguro.quantidadeCiclos,
        confianca: confiancasPermitidas.includes(resumoSeguro.confianca) ? resumoSeguro.confianca : 'baixa'
    }
}

function obterChaveDoCiclo(ciclo, indice) {
    if (ciclo?.id !== undefined && ciclo?.id !== null) {
        return String(ciclo.id)
    }

    if (ciclo?.numero !== undefined && ciclo?.numero !== null) {
        return `ciclo-${ciclo.numero}`
    }

    return `ciclo-${indice}`
}

function DivisorDaLista() {
    return (
        <View accessible accessibilityRole="header" accessibilityLabel="Todos os ciclos" style={estilos.divisorDaLista}>
            <View style={estilos.linhaDoDivisor} />

            <Text style={estilos.textoDoDivisor}>
                TODOS OS CICLOS
            </Text>

            <View style={estilos.linhaDoDivisor} />
        </View>
    )
}

function RodapeDaLista({carregando, erro, aoTentarNovamente}) {
    if (carregando) {
        return (
            <View testID="cycle-history-loading-more" accessibilityLiveRegion="polite" style={estilos.rodapeDaLista}>
                <ActivityIndicator size="small" color={tema.cores.marca.secundaria} />

                <Text style={estilos.textoDoRodape}>
                    Carregando mais ciclos...
                </Text>
            </View>
        )
    }

    if (erro) {
        const podeTentarNovamente = typeof aoTentarNovamente === 'function'

        return (
            <View accessible accessibilityRole="alert" accessibilityLabel="Não foi possível carregar mais ciclos." style={estilos.rodapeDaLista}>
                <Text style={estilos.textoDoRodape}>
                    Não foi possível carregar mais ciclos.
                </Text>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Tentar carregar mais ciclos novamente"
                    disabled={!podeTentarNovamente}
                    onPress={aoTentarNovamente}
                    style={({pressed}) => [
                        estilos.botaoDoRodape,
                        pressed && podeTentarNovamente && estilos.botaoDoRodapePressionado,
                        !podeTentarNovamente && estilos.botaoDoRodapeDesabilitado
                    ]}
                >
                    <Text style={estilos.textoDoBotaoDoRodape}>
                        Tentar novamente
                    </Text>
                </Pressable>
            </View>
        )
    }

    return null
}

function CycleHistoryScreen({
    ciclos = [],
    resumo,
    carregando = false,
    carregandoMais = false,
    erro,
    erroCarregarMais,
    temMais = false,
    aoTentarNovamente,
    aoCarregarMais,
    aoTentarCarregarMais,
    aoAbrirCalendario,
    aoEditarCiclo,
    aoExcluirCiclo,
    onSelecionarAba
}) {
    const ciclosSeguros = Array.isArray(ciclos) ? ciclos.filter(ciclo => ciclo && typeof ciclo === 'object') : []
    const resumoSeguro = normalizarResumo(resumo)
    const possuiErro = typeof erro === 'string' && erro.trim().length > 0
    const possuiErroCarregarMais = typeof erroCarregarMais === 'string' && erroCarregarMais.trim().length > 0
    const estaVazio = ciclosSeguros.length === 0
    const podeCarregarMais = temMais && !carregandoMais && !possuiErroCarregarMais && typeof aoCarregarMais === 'function'

    const resumoDosCiclos = (
        <CycleSummaryCard
            cicloMedioDias={resumoSeguro.cicloMedioDias}
            menstruacaoMediaDias={resumoSeguro.menstruacaoMediaDias}
            quantidadeCiclos={resumoSeguro.quantidadeCiclos}
            confianca={resumoSeguro.confianca}
        />
    )

    function renderizarCiclo({item}) {
        return (
            <View style={estilos.itemDaLista}>
                <CycleHistoryCard ciclo={item} aoEditar={aoEditarCiclo} aoExcluir={aoExcluirCiclo} />
            </View>
        )
    }

    let conteudo

    if (carregando) {
        conteudo = (
            <View style={estilos.conteudoEstatico}>
                {resumoDosCiclos}

                <View testID="cycle-history-loading" accessibilityLiveRegion="polite" style={estilos.estadoCentralizado}>
                    <ActivityIndicator size="small" color={tema.cores.marca.secundaria} />

                    <Text style={estilos.mensagemDoEstado}>
                        Carregando histórico de ciclos...
                    </Text>
                </View>
            </View>
        )
    } else if (possuiErro) {
        conteudo = (
            <View style={estilos.conteudoEstatico}>
                {resumoDosCiclos}

                <View
                    accessible
                    accessibilityRole="alert"
                    accessibilityLabel="Ocorreu um erro. Não foi possível carregar seu histórico de ciclos. Tente novamente."
                    style={estilos.estadoCentralizado}
                >
                    <Text style={estilos.tituloDoEstado}>
                        Ocorreu um erro
                    </Text>

                    <Text style={estilos.mensagemDoEstado}>
                        Não foi possível carregar seu histórico de ciclos. Tente novamente.
                    </Text>

                    <View style={estilos.botaoDoEstado}>
                        <ButtonScreen texto="Tentar Novamente" variante="preto" aoPressionar={aoTentarNovamente} />
                    </View>
                </View>
            </View>
        )
    } else if (estaVazio) {
        conteudo = (
            <View style={estilos.conteudoEstatico}>
                {resumoDosCiclos}

                <View style={estilos.estadoCentralizado}>
                    <Text style={estilos.tituloDoEstado}>
                        Nenhum ciclo registrado
                    </Text>

                    <Text style={estilos.mensagemDoEstado}>
                        Comece registrando seu primeiro ciclo pelo calendário.
                    </Text>

                    <View style={estilos.botaoDoEstado}>
                        <ButtonScreen texto="Ir para o Calendário" variante="laranja" aoPressionar={aoAbrirCalendario} />
                    </View>
                </View>
            </View>
        )
    } else {
        conteudo = (
            <FlatList
                testID="cycle-history-list"
                data={ciclosSeguros}
                renderItem={renderizarCiclo}
                keyExtractor={obterChaveDoCiclo}
                ListHeaderComponent={
                    <View style={estilos.cabecalhoDaLista}>
                        {resumoDosCiclos}
                        <DivisorDaLista />
                    </View>
                }
                ListFooterComponent={
                    <RodapeDaLista
                        carregando={carregandoMais}
                        erro={possuiErroCarregarMais}
                        aoTentarNovamente={aoTentarCarregarMais}
                    />
                }
                onEndReached={podeCarregarMais ? aoCarregarMais : undefined}
                onEndReachedThreshold={0.35}
                contentContainerStyle={estilos.conteudoDaLista}
                showsVerticalScrollIndicator={false}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={50}
                windowSize={5}
            />
        )
    }

    return (
        <MainLayout titulo="Histórico de Ciclos" abaAtiva="ciclos" onSelecionarAba={onSelecionarAba}>
            {conteudo}
        </MainLayout>
    )
}

export {CycleHistoryScreen}