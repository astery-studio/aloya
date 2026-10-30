import { createContext, useContext, useMemo } from 'react';

import { ThemeProvider } from '../../../shared/theme/ThemeProvider';
import { PREFERENCIAS_TEMA } from '../../../shared/theme/themePreferences';
import { useThemePreference } from '../hooks/useThemePreference';

const ThemePreferenceContext = createContext(null);

function ThemePreferenceProvider({
    children,
    service,
    autenticado = false,
    preferenciaInicial = PREFERENCIAS_TEMA.automatico,
    esquemaDoSistema
}) {
    const { preferencia, carregando, salvando, erro, alterarPreferencia, limparErro } =
        useThemePreference({
            service,
            autenticado,
            preferenciaInicial
        });

    const valor = useMemo(
        () =>
            Object.freeze({
                preferencia,
                carregando,
                salvando,
                erro,
                alterarPreferencia,
                limparErro
            }),
        [preferencia, carregando, salvando, erro, alterarPreferencia, limparErro]
    );

    return (
        <ThemePreferenceContext.Provider value={valor}>
            <ThemeProvider preferencia={preferencia} esquemaDoSistema={esquemaDoSistema}>
                {children}
            </ThemeProvider>
        </ThemePreferenceContext.Provider>
    );
}

function useThemePreferenceContext() {
    const contexto = useContext(ThemePreferenceContext);

    if (!contexto) {
        throw new Error(
            'A preferência de tema precisa ser usada dentro de ThemePreferenceProvider.'
        );
    }

    return contexto;
}

export { ThemePreferenceProvider, useThemePreferenceContext };

export default ThemePreferenceProvider;
