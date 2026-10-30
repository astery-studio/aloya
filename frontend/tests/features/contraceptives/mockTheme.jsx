import React from 'react';
import { render as renderBase } from '@testing-library/react-native';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';

async function render(componente) {
    function envolverComTema(conteudo) {
        return (
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                {conteudo}
            </ThemeProvider>
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
