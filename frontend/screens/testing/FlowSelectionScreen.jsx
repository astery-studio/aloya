//Mostra uma tela provisória para escolher qual fluxo autenticado será testado.
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import ButtonScreen from '../../components/common/Button/ButtonScreen'
import {estilos} from './FlowSelectionScreen.styles'

//Recebe as duas ações de navegação e permite escolher o fluxo que será aberto.
function FlowSelectionScreen({onAbrirConfiguracoes, onAbrirNovaCategoria}) {
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
                        texto="Fluxo criar categoria de membro"
                        aoPressionar={onAbrirNovaCategoria}
                        variante="laranja"
                        rotuloAcessibilidade="Abrir fluxo de criação de categoria"
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}

export {FlowSelectionScreen}
