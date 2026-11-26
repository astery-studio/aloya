import React from 'react';
import { render as renderBase } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

const metricas = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 0, right: 0, bottom: 0, left: 0 }
};

async function render(componente) {
    function envolverComTema(conteudo) {
        return (
            <SafeAreaProvider initialMetrics={metricas}>
                <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                    {conteudo}
                </ThemeProvider>
            </SafeAreaProvider>
        );
    }

    const resultado = await renderBase(envolverComTema(componente));
    const rerenderOriginal = resultado.rerender;

    return {
        ...resultado,
        rerender: (novoComponente) => rerenderOriginal(envolverComTema(novoComponente))
    };
}

export { render };
