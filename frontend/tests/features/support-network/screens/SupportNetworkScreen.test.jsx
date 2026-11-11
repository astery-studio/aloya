import { act, fireEvent, render, screen } from '@testing-library/react-native';

const mockUseParentalConsent = jest.fn();

jest.mock('../../../../src/features/support-network/hooks/useParentalConsent', () => ({
    useParentalConsent: (...argumentos) => mockUseParentalConsent(...argumentos)
}));

jest.mock('../../../../src/features/support-network/screens/MembersScreen', () => {
    const React = require('react');
    const { Text } = require('react-native');

    return { MembersScreen: () => React.createElement(Text, null, 'Lista liberada') };
});

import { SupportNetworkScreen } from '../../../../src/features/support-network/screens/SupportNetworkScreen';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function estado(overrides = {}) {
    return {
        status: null,
        carregando: false,
        atualizando: false,
        enviando: false,
        erro: null,
        erroEnvio: null,
        resultadoEnvio: null,
        atualizarStatus: jest.fn(),
        solicitar: jest.fn(),
        reenviar: jest.fn(),
        limparFeedback: jest.fn(),
        ...overrides
    };
}

function renderizar() {
    return render(
        <ThemeProvider preferencia="claro" esquemaDoSistema="light">
            <SupportNetworkScreen onSelecionarAba={jest.fn()} onGerenciarResponsavel={jest.fn()} />
        </ThemeProvider>
    );
}

describe('SupportNetworkScreen', () => {
    test('libera a lista quando não existe restrição', async () => {
        mockUseParentalConsent.mockReturnValue(estado({ status: { acessoLiberado: true } }));

        await renderizar();

        expect(screen.getByText('Lista liberada')).toBeOnTheScreen();
    });

    test('centraliza o card sem rolagem e abre o e-mail pendente', async () => {
        mockUseParentalConsent.mockReturnValue(
            estado({
                status: {
                    acessoLiberado: false,
                    emailResponsavelInformado: true,
                    emailResponsavelLegal: 'responsavel@exemplo.com'
                }
            })
        );

        await renderizar();

        expect(
            screen.queryByText('Pessoas que fazem parte da sua rede de cuidado e apoio.')
        ).toBeNull();
        expect(screen.getByTestId('parental-consent-restricted')).toHaveStyle({
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        });
        expect(screen.getByTestId('parental-consent-card')).toHaveStyle({
            width: '100%',
            maxWidth: 342,
            alignSelf: 'center',
            borderRadius: 20,
            borderWidth: 0.7
        });

        await fireEvent.press(screen.getByRole('button', { name: 'Visualizar E-mail' }));

        expect(screen.getByText('E-mail enviado')).toBeOnTheScreen();
        expect(screen.getByText(/responsavel@exemplo.com/)).toBeOnTheScreen();
    });

    test('reenvia a autorização e mostra a confirmação somente com OK', async () => {
        const reenviar = jest.fn().mockResolvedValue(true);

        mockUseParentalConsent.mockReturnValue(
            estado({
                status: {
                    acessoLiberado: false,
                    emailResponsavelInformado: true,
                    emailResponsavelLegal: 'responsavel@exemplo.com'
                },
                reenviar
            })
        );

        await renderizar();
        await fireEvent.press(screen.getByRole('button', { name: 'Visualizar E-mail' }));

        await act(async () => {
            fireEvent.press(screen.getByRole('button', { name: 'Enviar Novamente' }));
        });

        expect(reenviar).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/responsavel@exemplo.com/)).toBeOnTheScreen();
        expect(screen.getByRole('button', { name: 'OK' })).toBeOnTheScreen();
        expect(screen.queryByRole('button', { name: 'Entendi' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Enviar Novamente' })).toBeNull();
    });
});
