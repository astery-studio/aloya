//Fornece o tema visual resolvido pelo ThemeProvider.
import { useThemeContext } from '../theme/ThemeProvider';

function useTheme() {
    return useThemeContext().tema;
}

export { useTheme };
