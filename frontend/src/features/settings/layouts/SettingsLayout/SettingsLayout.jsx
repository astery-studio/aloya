// Organiza cabeçalho, conteúdo e rodapé das telas internas de configurações.
import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '../../../../shared/components/navigation/Header/Header';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './SettingsLayout.style';

function SettingsLayout({
    titulo,
    onVoltar,
    children,
    rodape,
    rodapeFixo = false,
    testeId = 'settings-layout'
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const temRodape = rodape !== undefined && rodape !== null;

    return (
        <SafeAreaView testID={testeId} edges={['bottom']} style={estilos.container}>
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

                    {temRodape && !rodapeFixo ? (
                        <View testID="rodape-settings-layout" style={estilos.rodape}>
                            {rodape}
                        </View>
                    ) : null}
                </ScrollView>

                {temRodape && rodapeFixo ? (
                    <View testID="rodape-fixo-settings-layout" style={estilos.rodapeFixo}>
                        {rodape}
                    </View>
                ) : null}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export { SettingsLayout };
