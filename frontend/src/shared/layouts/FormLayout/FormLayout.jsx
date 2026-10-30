/**
 * Layout de formulários com área segura, rolagem, ações fixas e tratamento do teclado.
 */
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { estilos } from './FormLayout.styles';

const posicoesFundo = [0.04, 0.55];

export default function FormLayout({
    cabecalho,
    children,
    acoes,
    centralizado = false,
    testeId = 'form-layout'
}) {
    const tema = useTheme();
    const coresFundo = useMemo(
        () =>
            tema.escuro
                ? [tema.cores.interface.superficie, tema.cores.interface.fundo]
                : ['#F5EDE3', '#F7F5F0'],
        [tema]
    );

    return (
        <LinearGradient colors={coresFundo} locations={posicoesFundo} style={estilos.fundo}>
            <SafeAreaView style={estilos.tela} testID={testeId}>
                <KeyboardAvoidingView
                    testID={`${testeId}-keyboard`}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={estilos.flexivel}
                >
                    {cabecalho ? <View testID={`${testeId}-header`}
                        style={estilos.cabecalho}>{cabecalho}</View> : null}
                    <ScrollView
                        testID={`${testeId}-scroll`}
                        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            estilos.rolagem,
                            centralizado && estilos.centralizado
                        ]}
                    >
                        {children}
                    </ScrollView>
                    {acoes ? <View testID={`${testeId}-actions`}
                        style={estilos.acoes}>{acoes}</View> : null}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}
