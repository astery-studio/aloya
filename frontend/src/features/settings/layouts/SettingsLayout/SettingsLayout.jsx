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
    testeId = 'settings-layout',
    corFundo
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const temRodape = rodape !== undefined && rodape !== null;

    return (
        <SafeAreaView
            testID={testeId}
            edges={['bottom']}
            style={[estilos.container, corFundo ? { backgroundColor: corFundo } : null]}
        >
            <Header
                titulo={titulo}
                corFundo={corFundo}
                variante="comVoltar"
                onVoltar={onVoltar}
                usarEspacamentoSuperior
            />

            <KeyboardAvoidingView
                testID="teclado-settings-layout"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[estilos.areaInterativa, corFundo ? { backgroundColor: corFundo } : null]}
            >
                <ScrollView
                    testID="rolagem-settings-layout"
                    contentContainerStyle={
                        corFundo
                            ? [estilos.conteudo, { backgroundColor: corFundo }]
                            : estilos.conteudo
                    }
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
                    <View
                        testID="rodape-fixo-settings-layout"
                        style={[
                            estilos.rodapeFixo,
                            corFundo ? { backgroundColor: corFundo } : null
                        ]}
                    >
                        {rodape}
                    </View>
                ) : null}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export { SettingsLayout };
