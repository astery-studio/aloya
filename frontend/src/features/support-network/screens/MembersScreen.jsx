//Mostra a área de membros da Rede de Apoio e permite iniciar a criação de categorias.
import {ScrollView, Text, View} from 'react-native'

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen'
import {MainLayout} from '../../../shared/layouts/MainLayout/MainLayout'
import {estilos} from './MembersScreen.styles'

function MembersScreen({onCriarCategoria, onSelecionarAba}) {
    return (
        <MainLayout
            titulo="Membros"
            abaAtiva="membros"
            onSelecionarAba={onSelecionarAba}
        >
            <ScrollView
                testID="rolagem-members-screen"
                contentContainerStyle={estilos.conteudo}
                showsVerticalScrollIndicator={false}
            >
                <View style={estilos.apresentacao}>
                    <Text style={estilos.titulo}>
                        Categorias de membros
                    </Text>

                    <Text style={estilos.descricao}>
                        Crie categorias para definir quais informações cada
                        membro da sua Rede de Apoio poderá visualizar.
                    </Text>
                </View>

                <ButtonScreen
                    texto="Criar nova categoria"
                    aoPressionar={onCriarCategoria}
                    variante="laranja"
                    rotuloAcessibilidade="Criar nova categoria de membros"
                />
            </ScrollView>
        </MainLayout>
    )
}

export {MembersScreen}
