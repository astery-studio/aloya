import { act, cleanup, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import * as Appearance from 'react-native/Libraries/Utilities/Appearance';
import { AppThemeRoot } from '../../src/app/AppThemeRoot';
import { useThemeContext } from '../../src/shared/theme/ThemeProvider';

// Exercita o hook real do React Native, sem injetar esquemaDoSistema no aplicativo.
jest.unmock('react-native/Libraries/Utilities/useColorScheme');
jest.mock('react-native/Libraries/Utilities/Appearance', () => {
    let esquema = 'light';
    const ouvintes = new Set();
    return {
        getColorScheme: () => esquema,
        addChangeListener: (ouvinte) => {
            ouvintes.add(ouvinte);
            return { remove: () => ouvintes.delete(ouvinte) };
        },
        emitirMudanca: (novoEsquema) => {
            esquema = novoEsquema;
            ouvintes.forEach((ouvinte) => ouvinte({ colorScheme: esquema }));
        },
        quantidadeOuvintes: () => ouvintes.size
    };
});
jest.mock('expo-status-bar', () => {
    const React = require('react');
    const { Text: Texto } = require('react-native');
    return {
        StatusBar: ({ style }) => React.createElement(Texto, { testID: 'barra-sistema' }, style)
    };
});

function LeitorTema() {
    const { modo, preferencia } = useThemeContext();
    return (
        <Text testID="tema-sistema">
            {preferencia}:{modo}
        </Text>
    );
}

function aplicativo(preferenciaInicial = 'automatico') {
    return (
        <AppThemeRoot preferenciaInicial={preferenciaInicial}>
            <LeitorTema />
        </AppThemeRoot>
    );
}

beforeEach(() => Appearance.emitirMudanca('light'));
afterEach(async () => {
    await cleanup();
    expect(Appearance.quantidadeOuvintes()).toBe(0);
});

test('acompanha eventos claro, escuro e claro sem remontar o aplicativo', async () => {
    await render(aplicativo());
    expect(screen.getByTestId('tema-sistema')).toHaveTextContent('automatico:claro');
    expect(screen.getByTestId('barra-sistema')).toHaveTextContent('dark');
    await act(async () => Appearance.emitirMudanca('dark'));
    expect(screen.getByTestId('tema-sistema')).toHaveTextContent('automatico:escuro');
    expect(screen.getByTestId('barra-sistema')).toHaveTextContent('light');
    await act(async () => Appearance.emitirMudanca('light'));
    expect(screen.getByTestId('tema-sistema')).toHaveTextContent('automatico:claro');
    expect(screen.getByTestId('barra-sistema')).toHaveTextContent('dark');
});

test('inicia escuro quando o sistema já está escuro', async () => {
    Appearance.emitirMudanca('dark');
    await render(aplicativo());
    expect(screen.getByTestId('tema-sistema')).toHaveTextContent('automatico:escuro');
});

test.each(['claro', 'escuro'])(
    'mantém a preferência manual %s e volta a seguir o sistema ao selecionar automático',
    async (preferencia) => {
        const tela = await render(aplicativo(preferencia));
        await act(async () => Appearance.emitirMudanca('dark'));
        expect(screen.getByTestId('tema-sistema')).toHaveTextContent(
            preferencia + ':' + preferencia
        );
        await act(async () => Appearance.emitirMudanca('light'));
        expect(screen.getByTestId('tema-sistema')).toHaveTextContent(
            preferencia + ':' + preferencia
        );
        await act(async () => Appearance.emitirMudanca('dark'));
        await tela.rerender(aplicativo('automatico'));
        expect(screen.getByTestId('tema-sistema')).toHaveTextContent('automatico:escuro');
    }
);

test('usa claro sem suporte nativo e reage quando o sistema passa a informar o tema', async () => {
    Appearance.emitirMudanca(null);
    await render(aplicativo());
    expect(screen.getByTestId('tema-sistema')).toHaveTextContent('automatico:claro');
    await act(async () => Appearance.emitirMudanca('dark'));
    expect(screen.getByTestId('tema-sistema')).toHaveTextContent('automatico:escuro');
});
