import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const mockSolicitar = jest.fn();
const mockReenviar = jest.fn();
const mockUseParentalConsent = jest.fn();

jest.mock('../../../../src/features/support-network/hooks/useParentalConsent', () => ({
    useParentalConsent: (...argumentos) => mockUseParentalConsent(...argumentos)
}));

import { ParentalConsentScreen } from '../../../../src/features/support-network/screens/ParentalConsentScreen/ParentalConsentScreen';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function criarEstado(overrides = {}) {
    return {
        status: {
            emailResponsavelLegal: null,
            statusConsentimento: null
        },
        carregando: false,
        atualizando: false,
        enviando: false,
        erro: null,
        erroEnvio: null,
        resultadoEnvio: null,
        solicitar: mockSolicitar,
        reenviar: mockReenviar,
        limparFeedback: jest.fn(),
        ...overrides
    };
}

async function renderizar() {
    return render(
        <SafeAreaProvider
            initialMetrics={{
                frame: { x: 0, y: 0, width: 390, height: 844 },
                insets: { top: 0, right: 0, bottom: 0, left: 0 }
            }}
        >
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <ParentalConsentScreen
                    service={{}}
                    emailUsuario="titular@exemplo.com"
                    onVoltar={jest.fn()}
                />
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

describe('ParentalConsentScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSolicitar.mockResolvedValue(true);
        mockReenviar.mockResolvedValue(true);
        mockUseParentalConsent.mockReturnValue(criarEstado());
    });

    test('mantém salvar desabilitado até uma alteração e envia o primeiro e-mail', async () => {
        await renderizar();

        expect(screen.getAllByRole('button', { name: 'Salvar' })[0]).toBeDisabled();

        await fireEvent.press(
            screen.getByRole('button', { name: 'Editar e-mail do responsável legal' })
        );
        await fireEvent.changeText(screen.getByLabelText('E-mail'), 'responsavel@exemplo.com');
        await fireEvent.press(screen.getAllByRole('button', { name: 'Salvar' }).at(-1));
        await fireEvent.press(screen.getAllByRole('button', { name: 'Salvar' })[0]);

        await waitFor(() => {
            expect(mockSolicitar).toHaveBeenCalledWith('responsavel@exemplo.com');
        });
        expect(mockReenviar).not.toHaveBeenCalled();
    });

    test('bloqueia a edição depois da autorização', async () => {
        mockUseParentalConsent.mockReturnValue(
            criarEstado({
                status: {
                    emailResponsavelLegal: 'responsavel@exemplo.com',
                    statusConsentimento: 'liberado'
                }
            })
        );

        await renderizar();

        expect(
            screen.getByRole('button', { name: 'Editar e-mail do responsável legal' })
        ).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    });
});
