import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { AppThemeRoot } from '../../src/app/AppThemeRoot';

jest.mock('expo-status-bar', () => {
    const React = require('react');
    const { Text: NativeText } = require('react-native');

    return {
        StatusBar({ style }) {
            return React.createElement(
                NativeText,
                {
                    testID: 'status-bar-style'
                },
                style
            );
        }
    };
});

function criarService({ preferencia = 'automatico' } = {}) {
    return {
        buscarPreferencia: jest.fn().mockResolvedValue(preferencia),

        atualizarPreferencia: jest
            .fn()
            .mockImplementation(async (novaPreferencia) => novaPreferencia)
    };
}

describe('AppThemeRoot', () => {
    test('aplica o tema automático sem consultar a conta anônima', async () => {
        const service = criarService();

        await render(
            <AppThemeRoot service={service} autenticado={false} esquemaDoSistema="dark">
                <Text>Conteúdo público</Text>
            </AppThemeRoot>
        );

        expect(screen.getByTestId('app-theme-root')).toHaveStyle({
            flex: 1,
            backgroundColor: '#181C1A'
        });

        expect(screen.getByTestId('status-bar-style')).toHaveTextContent('light');

        expect(screen.getByText('Conteúdo público')).toBeOnTheScreen();

        expect(service.buscarPreferencia).not.toHaveBeenCalled();
    });

    test('aplica a preferência persistida da conta autenticada', async () => {
        const service = criarService({
            preferencia: 'escuro'
        });

        await render(
            <AppThemeRoot service={service} autenticado esquemaDoSistema="light">
                <Text>Conteúdo autenticado</Text>
            </AppThemeRoot>
        );

        await waitFor(() => {
            expect(screen.getByTestId('app-theme-root')).toHaveStyle({
                backgroundColor: '#181C1A'
            });
        });

        expect(screen.getByTestId('status-bar-style')).toHaveTextContent('light');

        expect(service.buscarPreferencia).toHaveBeenCalledTimes(1);
    });

    test('mantém o tema claro quando essa é a preferência da conta', async () => {
        const service = criarService({
            preferencia: 'claro'
        });

        await render(
            <AppThemeRoot service={service} autenticado esquemaDoSistema="dark">
                <Text>Aplicativo</Text>
            </AppThemeRoot>
        );

        await waitFor(() => {
            expect(screen.getByTestId('app-theme-root')).toHaveStyle({
                backgroundColor: '#F7F5F0'
            });
        });

        expect(screen.getByTestId('status-bar-style')).toHaveTextContent('dark');
    });

    test('usa a preferência inicial enquanto a conta não está autenticada', async () => {
        const service = criarService();

        await render(
            <AppThemeRoot
                service={service}
                autenticado={false}
                preferenciaInicial="escuro"
                esquemaDoSistema="light"
            >
                <Text>Aplicativo</Text>
            </AppThemeRoot>
        );

        expect(screen.getByTestId('app-theme-root')).toHaveStyle({
            backgroundColor: '#181C1A'
        });

        expect(screen.getByTestId('status-bar-style')).toHaveTextContent('light');
    });

    test('preserva o conteúdo recebido pela raiz', async () => {
        await render(
            <AppThemeRoot autenticado={false} esquemaDoSistema="light">
                <Text testID="conteudo-filho">Aloya</Text>
            </AppThemeRoot>
        );

        expect(screen.getByTestId('conteudo-filho')).toHaveTextContent('Aloya');
    });
});
