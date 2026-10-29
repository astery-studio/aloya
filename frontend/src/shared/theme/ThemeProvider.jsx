import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { obterTemaPorModo } from './themePalettes';
import { PREFERENCIAS_TEMA, preferenciaTemaEhValida, resolverModoTema } from './themePreferences';

const ThemeContext = createContext(null);

function ThemeProvider({ children, preferencia = PREFERENCIAS_TEMA.automatico, esquemaDoSistema }) {
    const esquemaDetectado = useColorScheme();

    const preferenciaSegura = preferenciaTemaEhValida(preferencia)
        ? preferencia
        : PREFERENCIAS_TEMA.automatico;

    const esquemaEfetivo = esquemaDoSistema ?? esquemaDetectado ?? 'light';

    const modo = resolverModoTema(preferenciaSegura, esquemaEfetivo);

    const tema = obterTemaPorModo(modo);

    const valor = useMemo(
        () =>
            Object.freeze({
                preferencia: preferenciaSegura,
                modo,
                tema
            }),
        [preferenciaSegura, modo, tema]
    );

    return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>;
}

function useThemeContext() {
    const contexto = useContext(ThemeContext);

    if (!contexto) {
        throw new Error('O tema precisa ser usado dentro de ThemeProvider.');
    }

    return contexto;
}

export { ThemeProvider, useThemeContext };
