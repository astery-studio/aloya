//Mostra provisoriamente o resumo e todas as variantes do histórico de ciclos para validação no Expo.
import {Alert, FlatList, Text, View} from 'react-native'

import {CycleHistoryCard} from '../components/CycleHistoryCard/CycleHistoryCard'
import {CycleSummaryCard} from '../components/CycleSummaryCard/CycleSummaryCard'
import {MainLayout} from '../../../shared/layouts/MainLayout/MainLayout'
import {estilos} from './CyclesScreen.styles'

const ciclosDeTeste = Object.freeze([
    Object.freeze({
        id: 'ciclo-05',
        numero: 5,
        periodo: '04 Set até hoje',
        diasMenstruais: 4,
        duracaoDias: null,
        status: 'emAndamento'
    }),
    Object.freeze({
        id: 'ciclo-04',
        numero: 4,
        periodo: '07 Ago até 03 Set',
        diasMenstruais: 5,
        duracaoDias: 27,
        status: 'concluido'
    }),
    Object.freeze({
        id: 'ciclo-03',
        numero: 3,
        periodo: '08 Jul até 06 Ago',
        diasMenstruais: 6,
        duracaoDias: 29,
        status: 'incerto'
    }),
    Object.freeze({
        id: 'ciclo-02',
        numero: 2,
        periodo: '10 Jun até 07 Jul',
        diasMenstruais: 4,
        duracaoDias: 27,
        status: 'concluido'
    }),
    Object.freeze({
        id: 'ciclo-01',
        numero: 1,
        periodo: '12 Mai até 09 Jun',
        diasMenstruais: 5,
        duracaoDias: 28,
        status: 'concluido'
    })
])

function mostrarAcao(acao, ciclo) {
    Alert.alert(
        `${acao} ciclo`,
        `${acao} o ciclo ${String(ciclo.numero).padStart(2, '0')}.`
    )
}

function editarCiclo(ciclo) {
    mostrarAcao('Editar', ciclo)
}

function excluirCiclo(ciclo) {
    mostrarAcao('Excluir', ciclo)
}

function obterChaveDoCiclo(ciclo) {
    return ciclo.id
}

function renderizarCiclo({item}) {
    return (
        <View style={estilos.item}>
            <CycleHistoryCard
                ciclo={item}
                aoEditar={editarCiclo}
                aoExcluir={excluirCiclo}
            />
        </View>
    )
}

function CabecalhoDaLista() {
    return (
        <View style={estilos.cabecalhoDaLista}>
            <View style={estilos.apresentacao}>
                <Text style={estilos.titulo}>
                    Teste do histórico de ciclos
                </Text>

                <Text style={estilos.descricao}>
                    Confira o resumo e os ciclos em andamento, concluído e com estimativa incerta.
                </Text>
            </View>

            <CycleSummaryCard
                cicloMedioDias={28}
                menstruacaoMediaDias={5}
                quantidadeCiclos={5}
                confianca="alta"
            />

            <Text style={estilos.tituloDaSecao}>
                Ciclos registrados
            </Text>
        </View>
    )
}

function CyclesScreen({onSelecionarAba}) {
    return (
        <MainLayout
            titulo="Ciclos"
            abaAtiva="ciclos"
            onSelecionarAba={onSelecionarAba}
        >
            <FlatList
                data={ciclosDeTeste}
                renderItem={renderizarCiclo}
                keyExtractor={obterChaveDoCiclo}
                ListHeaderComponent={CabecalhoDaLista}
                contentContainerStyle={estilos.conteudo}
                showsVerticalScrollIndicator={false}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={3}
            />
        </MainLayout>
    )
}

export {CyclesScreen}