import { fireEvent, render, screen } from '@testing-library/react-native';

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

    test('mostra a orientação e abre o e-mail pendente', async () => {
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
        await fireEvent.press(screen.getByRole('button', { name: 'Visualizar E-mail' }));

        expect(screen.getByText('E-mail enviado')).toBeOnTheScreen();
        expect(screen.getByText(/responsavel@exemplo.com/)).toBeOnTheScreen();
    });
});
