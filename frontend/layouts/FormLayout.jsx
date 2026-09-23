import {
    KeyboardAvoidingView, Platform, ScrollView, View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { estilos } from './FormLayout.styles';

const coresFundo = ['#F5EDE3', '#F7F5F0'];
const posicoesFundo = [0.04, 0.55];

export default function FormLayout({
    cabecalho, children, acoes, centralizado = false,
    testeId = 'form-layout'
}) {
    return (
        <LinearGradient
            colors={coresFundo}
            locations={posicoesFundo}
            style={estilos.fundo}
        >
            <SafeAreaView style={estilos.tela} testID={testeId}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={estilos.flexivel}
                >
                    {cabecalho ? <View>{cabecalho}</View> : null}
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={[
                            estilos.rolagem,
                            centralizado && estilos.centralizado
                        ]}
                    >
                        {children}
                    </ScrollView>
                    {acoes ? <View style={estilos.acoes}>{acoes}</View> : null}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}
/**
 * Layout de formulários com área segura, rolagem, ações fixas e tratamento do teclado.
 */
