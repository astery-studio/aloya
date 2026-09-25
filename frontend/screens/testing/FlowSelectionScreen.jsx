//Mostra uma tela provisória para escolher qual fluxo autenticado será testado.
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import ButtonScreen from '../../components/common/Button/ButtonScreen'
import {estilos} from './FlowSelectionScreen.styles'

//Recebe as ações de navegação e permite escolher o fluxo que será aberto.
function FlowSelectionScreen({onAbrirConfiguracoes, onAbrirNovaCategoria, onAbrirCategorias}) {
    return (
        <SafeAreaView style={estilos.tela}>
            <View style={estilos.conteudo}>
                <View style={estilos.cabecalho}>
                    <Text style={estilos.titulo}>Escolha um fluxo</Text>

                    <Text style={estilos.descricao}>
                        Esta tela é provisória e serve para testar os fluxos integrados ao backend.
                    </Text>
                </View>

                <View style={estilos.acoes}>
                    <ButtonScreen
                        texto="Fluxo configurações"
                        aoPressionar={onAbrirConfiguracoes}
                        variante="verde"
                        rotuloAcessibilidade="Abrir fluxo de configurações"
                    />

                    <ButtonScreen
                        texto="Criar categoria de membro"
                        aoPressionar={onAbrirNovaCategoria}
                        variante="laranja"
                        rotuloAcessibilidade="Abrir fluxo de criação de categoria"
                    />

                    <ButtonScreen
                        texto="Ver categorias cadastradas"
                        aoPressionar={onAbrirCategorias}
                        variante="branco"
                        rotuloAcessibilidade="Abrir categorias cadastradas"
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export {FlowSelectionScreen}