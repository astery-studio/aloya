//Organiza o cabeçalho, o conteúdo e o rodapé opcional das telas internas de configurações.
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View
} from 'react-native'

import {
    SafeAreaView
} from 'react-native-safe-area-context'

import {
    Header
} from '../../components/navigation/Header/Header'

import {
    estilos
} from './SettingsLayout.style'

//Recebe o título, conteúdo e rodapé e retorna a estrutura comum das configurações.
function SettingsLayout({titulo, onVoltar, children, rodape, testeId = 'settings-layout'}) {
    const temRodape = rodape !== undefined && rodape !== null

    return (
        <SafeAreaView
            testID={testeId}
            edges={['bottom']}
            style={estilos.container}
        >
            <Header
                titulo={titulo}
                variante="comVoltar"
                onVoltar={onVoltar}
                usarEspacamentoSuperior
            />

            <KeyboardAvoidingView
                testID="teclado-settings-layout"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={estilos.areaInterativa}
            >
                <ScrollView
                    testID="rolagem-settings-layout"
                    contentContainerStyle={estilos.conteudo}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                    contentInsetAdjustmentBehavior="never"
                    showsVerticalScrollIndicator={false}
                >
                    {children}

                    {temRodape ? (
                        <View
                            testID="rodape-settings-layout"
                            style={estilos.rodape}
                        >
                            {rodape}
                        </View>
                    ) : null}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export { SettingsLayout }