//Mostra a área da Rede de Apoio e permite acessar as categorias de permissão.
import {
    ScrollView,
    Text,
    View
} from 'react-native'

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen'
import {
    MainLayout
} from '../../../shared/layouts/MainLayout/MainLayout'
import {estilos} from './MembersScreen.styles'

function MembersScreen({
    onAbrirCategorias,
    onSelecionarAba
}) {
    return (
        <MainLayout
            titulo="Membros"
            abaAtiva="membros"
            onSelecionarAba={
                onSelecionarAba
            }
        >
            <ScrollView
                testID="rolagem-members-screen"
                contentContainerStyle={
                    estilos.conteudo
                }
                showsVerticalScrollIndicator={
                    false
                }
            >
                <View
                    style={
                        estilos.apresentacao
                    }
                >
                    <Text
                        style={
                            estilos.titulo
                        }
                    >
                        Categorias de membros
                    </Text>

                    <Text
                        style={
                            estilos.descricao
                        }
                    >
                        Crie categorias para definir quais informações cada membro da sua Rede de Apoio poderá visualizar.
                    </Text>
                </View>

                <ButtonScreen
                    texto="Categorias de Permissão"
                    aoPressionar={
                        onAbrirCategorias
                    }
                    variante="laranja"
                    rotuloAcessibilidade="Abrir categorias de permissão"
                />
            </ScrollView>
        </MainLayout>
    )
}

export {MembersScreen}