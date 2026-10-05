//Mostra provisoriamente todas as variantes do ConfidenceBadge para validação visual no Expo.
import {ScrollView, Text, View} from 'react-native'

import {ConfidenceBadge} from '../../../shared/components/common/ConfidenceBadge/ConfidenceBadge'
import {MainLayout} from '../../../shared/layouts/MainLayout/MainLayout'
import {estilos} from './CyclesScreen.styles'

const exemplos = Object.freeze([
    Object.freeze({
        id: 'alta-com-rotulo',
        nivel: 'alta',
        exibirRotulo: true,
        nome: 'Confiança alta',
        descricao: 'Variante alta com rótulo'
    }),
    Object.freeze({
        id: 'media-com-rotulo',
        nivel: 'media',
        exibirRotulo: true,
        nome: 'Confiança média',
        descricao: 'Variante média com rótulo'
    }),
    Object.freeze({
        id: 'baixa-com-rotulo',
        nivel: 'baixa',
        exibirRotulo: true,
        nome: 'Confiança baixa',
        descricao: 'Variante baixa com rótulo'
    }),
    Object.freeze({
        id: 'alta-sem-rotulo',
        nivel: 'alta',
        exibirRotulo: false,
        nome: 'Alta',
        descricao: 'Variante alta sem rótulo'
    }),
    Object.freeze({
        id: 'media-sem-rotulo',
        nivel: 'media',
        exibirRotulo: false,
        nome: 'Média',
        descricao: 'Variante média sem rótulo'
    }),
    Object.freeze({
        id: 'baixa-sem-rotulo',
        nivel: 'baixa',
        exibirRotulo: false,
        nome: 'Baixa',
        descricao: 'Variante baixa sem rótulo'
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
                        Compare os níveis de confiança com e sem o rótulo completo.
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

                            <View style={estilos.informacoes}>
                                <Text style={estilos.nome}>
                                    {exemplo.nome}
                                </Text>

                                <Text style={estilos.variante}>
                                    {exemplo.descricao}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </MainLayout>
    )
}

export {CyclesScreen}