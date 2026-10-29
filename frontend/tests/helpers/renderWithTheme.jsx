import { render } from '@testing-library/react-native';

import { ThemeProvider } from '../../src/shared/theme/ThemeProvider';

async function renderWithTheme(
    componente,
    { preferencia = 'claro', esquemaDoSistema = 'light' } = {}
) {
    function envolverComTema(conteudo) {
        return (
            <ThemeProvider preferencia={preferencia} esquemaDoSistema={esquemaDoSistema}>
                {conteudo}
            </ThemeProvider>
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
