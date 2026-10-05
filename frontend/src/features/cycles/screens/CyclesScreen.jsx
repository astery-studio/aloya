//Mostra provisoriamente todas as variantes do ConfidenceBadge para validação visual no Expo.
import {ScrollView, Text, View} from 'react-native'

import {ConfidenceBadge} from '../../../shared/components/common/ConfidenceBadge/ConfidenceBadge'
import {MainLayout} from '../../../shared/layouts/MainLayout/MainLayout'
import {estilos} from './CyclesScreen.styles'

const exemplos = Object.freeze([
    Object.freeze({
        id: 'alta-completa',
        nivel: 'alta',
        exibirRotulo: true,
        nome: 'Alta completa'
    }),
    Object.freeze({
        id: 'media-completa',
        nivel: 'media',
        exibirRotulo: true,
        nome: 'Média completa'
    }),
    Object.freeze({
        id: 'baixa-completa',
        nivel: 'baixa',
        exibirRotulo: true,
        nome: 'Baixa completa'
    }),
    Object.freeze({
        id: 'alta-compacta',
        nivel: 'alta',
        exibirRotulo: false,
        nome: 'Alta compacta'
    }),
    Object.freeze({
        id: 'media-compacta',
        nivel: 'media',
        exibirRotulo: false,
        nome: 'Média compacta'
    }),
    Object.freeze({
        id: 'baixa-compacta',
        nivel: 'baixa',
        exibirRotulo: false,
        nome: 'Baixa compacta'
    })
])

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
                        Teste do ConfidenceBadge
                    </Text>

                    <Text style={estilos.descricao}>
                        Compare os três níveis nas versões completa e compacta.
                    </Text>
                </View>

                <View style={estilos.lista}>
                    {exemplos.map(exemplo => (
                        <View
                            key={exemplo.id}
                            style={estilos.item}
                        >
                            <View style={estilos.amostra}>
                                <ConfidenceBadge
                                    nivel={exemplo.nivel}
                                    exibirRotulo={exemplo.exibirRotulo}
                                />
                            </View>

                            <Text style={estilos.nome}>
                                {exemplo.nome}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </MainLayout>
    )
}

export {CyclesScreen}