import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { ThemePreferenceProvider } from '../features/settings/providers/ThemePreferenceProvider';
import { useTheme } from '../shared/hooks/useTheme';
import { PREFERENCIAS_TEMA } from '../shared/theme/themePreferences';

function AppThemeSurface({ children }) {
    const tema = useTheme();

    return (
        <View
            testID="app-theme-root"
            style={{
                flex: 1,
                backgroundColor: tema.cores.interface.fundo
            }}
        >
            <StatusBar style={tema.cores.interface.barraStatus} />

            {children}
        </View>
    );
}

function AppThemeRoot({
    children,
    service,
    autenticado = false,
    preferenciaInicial = PREFERENCIAS_TEMA.automatico,
    esquemaDoSistema
}) {
    return (
        <ThemePreferenceProvider
            service={service}
            autenticado={autenticado}
            preferenciaInicial={preferenciaInicial}
            esquemaDoSistema={esquemaDoSistema}
        >
            <AppThemeSurface>{children}</AppThemeSurface>
        </ThemePreferenceProvider>
    );
}

export { AppThemeRoot, AppThemeSurface };

export default AppThemeRoot;
