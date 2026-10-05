//Mostra provisoriamente todas as variantes do IconButton para validação visual no Expo.
import {Alert, ScrollView, Text, View} from 'react-native'
import {CalendarBlankIcon, InfoIcon, NotePencilIcon, TrashIcon} from '../../../shared/components/icons/AppIcons'
import {IconButton} from '../../../shared/components/common/IconButton/IconButton'
import {MainLayout} from '../../../shared/layouts/MainLayout/MainLayout'
import {estilos} from './CyclesScreen.styles'

function mostrarAcao(acao) {
    Alert.alert(
        'IconButton',
        `${acao} acionado.`
    )
}

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
                        Teste do IconButton
                    </Text>

                    <Text style={estilos.descricao}>
                        Toque nos botões para conferir as ações e compare todas as variantes visuais.
                    </Text>
                </View>

                <View style={estilos.lista}>
                    <View style={estilos.item}>
                        <View style={estilos.amostra}>
                            <IconButton
                                icone={CalendarBlankIcon}
                                variante="selecionado"
                                rotuloAcessibilidade="Abrir calendário"
                                aoPressionar={() => mostrarAcao('Abrir calendário')}
                            />
                        </View>

                        <View style={estilos.informacoes}>
                            <Text style={estilos.nome}>
                                Abrir calendário
                            </Text>

                            <Text style={estilos.variante}>
                                Variante selecionado
                            </Text>
                        </View>
                    </View>

                    <View style={estilos.item}>
                        <View style={estilos.amostra}>
                            <IconButton
                                icone={TrashIcon}
                                variante="perigo"
                                rotuloAcessibilidade="Excluir"
                                aoPressionar={() => mostrarAcao('Excluir')}
                            />
                        </View>

                        <View style={estilos.informacoes}>
                            <Text style={estilos.nome}>
                                Excluir
                            </Text>

                            <Text style={estilos.variante}>
                                Variante perigo
                            </Text>
                        </View>
                    </View>

                    <View style={estilos.item}>
                        <View style={estilos.amostra}>
                            <IconButton
                                icone={InfoIcon}
                                rotuloAcessibilidade="Abrir informações"
                                aoPressionar={() => mostrarAcao('Abrir informações')}
                            />
                        </View>

                        <View style={estilos.informacoes}>
                            <Text style={estilos.nome}>
                                Abrir informações
                            </Text>

                            <Text style={estilos.variante}>
                                Variante neutro
                            </Text>
                        </View>
                    </View>

                    <View style={estilos.item}>
                        <View style={estilos.amostra}>
                            <IconButton
                                icone={NotePencilIcon}
                                rotuloAcessibilidade="Editar"
                                aoPressionar={() => mostrarAcao('Editar')}
                            />
                        </View>

                        <View style={estilos.informacoes}>
                            <Text style={estilos.nome}>
                                Editar
                            </Text>

                            <Text style={estilos.variante}>
                                Variante neutro
                            </Text>
                        </View>
                    </View>

                    <View style={estilos.item}>
                        <View style={estilos.amostra}>
                            <IconButton
                                icone={TrashIcon}
                                variante="desativado"
                                rotuloAcessibilidade="Excluir indisponível"
                                aoPressionar={() => mostrarAcao('Excluir indisponível')}
                            />
                        </View>

                        <View style={estilos.informacoes}>
                            <Text style={estilos.nome}>
                                Excluir indisponível
                            </Text>

                            <Text style={estilos.variante}>
                                Variante desativado
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </MainLayout>
    )
}

export {CyclesScreen}