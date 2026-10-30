import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '../../src/shared/theme/ThemeProvider';

async function renderWithTheme(
    componente,
    { preferencia = 'claro', esquemaDoSistema = 'light' } = {}
) {
    function envolverComTema(conteudo) {
        return (
            <SafeAreaProvider
                initialMetrics={{
                    frame: { x: 0, y: 0, width: 390, height: 844 },
                    insets: { top: 0, right: 0, bottom: 32, left: 0 }
                }}
            >
                <ThemeProvider preferencia={preferencia} esquemaDoSistema={esquemaDoSistema}>
                    {conteudo}
                </ThemeProvider>
            </SafeAreaProvider>
        );
    }

    const resultado = await render(envolverComTema(componente));
    const rerenderOriginal = resultado.rerender;

    return {
        ...resultado,
        rerender: (novoComponente) => rerenderOriginal(envolverComTema(novoComponente))
    };
}

export { renderWithTheme };
