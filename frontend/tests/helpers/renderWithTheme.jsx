import { render } from '@testing-library/react-native';

import { ThemeProvider } from '../../src/shared/theme/ThemeProvider';

function renderWithTheme(componente, { preferencia = 'claro', esquemaDoSistema = 'light' } = {}) {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema={esquemaDoSistema}>
            {componente}
        </ThemeProvider>
    );
}

export { renderWithTheme };
