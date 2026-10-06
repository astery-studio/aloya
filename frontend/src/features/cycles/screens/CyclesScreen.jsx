//Mostra provisoriamente os estados preenchido e vazio do resumo de ciclos para validação visual no Expo.
import {ScrollView, Text, View} from 'react-native'

import {CycleSummaryCard} from '../components/CycleSummaryCard/CycleSummaryCard'
import {MainLayout} from '../../../shared/layouts/MainLayout/MainLayout'
import {estilos} from './CyclesScreen.styles'

function CyclesScreen({onSelecionarAba}) {
    return (
        <MainLayout
            titulo="Ciclos"
            abaAtiva="ciclos"
            onSelecionarAba={onSelecionarAba}
        >
            <ScrollView
                contentContainerStyle={estilos.conteudo}
                showsVerticalScrollIndicator={false}
            >
                <View style={estilos.apresentacao}>
                    <Text style={estilos.titulo}>
                        Teste do resumo de ciclos
                    </Text>

                    <Text style={estilos.descricao}>
                        Compare o card com métricas e o estado sem ciclos registrados.
                    </Text>
                </View>

                <View style={estilos.exemplo}>
                    <Text style={estilos.nome}>
                        Com métricas
                    </Text>

                    <CycleSummaryCard
                        cicloMedioDias={28}
                        menstruacaoMediaDias={5}
                        quantidadeCiclos={5}
                        confianca="alta"
                    />
                </View>

                <View style={estilos.exemplo}>
                    <Text style={estilos.nome}>
                        Sem métricas
                    </Text>

                    <CycleSummaryCard
                        quantidadeCiclos={0}
                        confianca="baixa"
                    />
                </View>
            </ScrollView>
        </MainLayout>
    )
}

export {CyclesScreen}
