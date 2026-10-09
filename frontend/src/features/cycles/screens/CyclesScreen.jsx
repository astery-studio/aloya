//Mostra provisoriamente todas as variantes do ConfidenceBadge para validação visual no Expo.
import {ScrollView, Text, View} from 'react-native'

import {ConfidenceBadge} from '../../../shared/components/common/ConfidenceBadge/ConfidenceBadge'
import {MainLayout} from '../../../shared/layouts/MainLayout/MainLayout'
import {estilos} from './CyclesScreen.styles'

const exemplos = Object.freeze([
    Object.freeze({
        id: 'alta-simples',
        nivel: 'alta',
        variante: 'simples',
        nome: 'Alta simples'
    }),
    Object.freeze({
        id: 'media-simples',
        nivel: 'media',
        variante: 'simples',
        nome: 'Média simples'
    }),
    Object.freeze({
        id: 'baixa-simples',
        nivel: 'baixa',
        variante: 'simples',
        nome: 'Baixa simples'
    }),
    Object.freeze({
        id: 'alta-composta',
        nivel: 'alta',
        variante: 'composta',
        nome: 'Alta composta'
    }),
    Object.freeze({
        id: 'media-composta',
        nivel: 'media',
        variante: 'composta',
        nome: 'Média composta'
    }),
    Object.freeze({
        id: 'baixa-composta',
        nivel: 'baixa',
        variante: 'composta',
        nome: 'Baixa composta'
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
                        Compare os três níveis nas variantes simples e composta.
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
                                    variante={exemplo.variante}
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