import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useParentalConsent } from '../../../../src/features/support-network/hooks/useParentalConsent';

const statusPendente = Object.freeze({
    acessoLiberado: false,
    motivo: 'CONSENTIMENTO_NECESSARIO',
    consentimentoNecessario: true,
    emailResponsavelInformado: true,
    emailResponsavelLegal: 'responsavel@email.com',
    statusConsentimento: 'pendente',
    menorDe16: true
});

describe('useParentalConsent', () => {
    test('carrega o estado atual ao montar', async () => {
        const service = {
            consultarStatus: jest.fn().mockResolvedValue(statusPendente),
            solicitar: jest.fn(),
            reenviar: jest.fn()
        };
        const { result } = await renderHook(() => useParentalConsent({ service }));

        await waitFor(() => expect(result.current.carregando).toBe(false));

        expect(result.current.status).toEqual(statusPendente);
        expect(service.consultarStatus).toHaveBeenCalledTimes(1);
    });

    test('solicita e mantém o e-mail preenchido no estado local', async () => {
        const service = {
            consultarStatus: jest.fn().mockResolvedValue({
                ...statusPendente,
                emailResponsavelInformado: false,
                emailResponsavelLegal: null,
                statusConsentimento: null
            }),
            solicitar: jest.fn().mockResolvedValue({ mensagem: 'Enviado.' }),
            reenviar: jest.fn()
        };
        const { result } = await renderHook(() => useParentalConsent({ service }));
        await waitFor(() => expect(result.current.carregando).toBe(false));

        await act(async () => {
            await result.current.solicitar('novo@email.com');
        });

        expect(result.current.status.emailResponsavelLegal).toBe('novo@email.com');
        expect(result.current.status.statusConsentimento).toBe('pendente');
        expect(result.current.resultadoEnvio).toEqual({ mensagem: 'Enviado.' });
    });

    test('preserva o e-mail quando o envio falha', async () => {
        const service = {
            consultarStatus: jest.fn().mockResolvedValue(statusPendente),
            solicitar: jest.fn(),
            reenviar: jest.fn().mockRejectedValue(new Error('falha'))
        };
        const { result } = await renderHook(() => useParentalConsent({ service }));
        await waitFor(() => expect(result.current.carregando).toBe(false));

        await act(async () => {
            await result.current.reenviar();
        });

        expect(result.current.status.emailResponsavelLegal).toBe('responsavel@email.com');
        expect(result.current.erroEnvio).toBe(
            'Não foi possível enviar o pedido de autorização no momento. Tente novamente.'
        );
    });

    test('cancela a consulta pendente ao desmontar', async () => {
        let sinal;
        const service = {
            consultarStatus: jest.fn(({ signal }) => {
                sinal = signal;
                return new Promise(() => {});
            }),
            solicitar: jest.fn(),
            reenviar: jest.fn()
        };
        const { unmount } = await renderHook(() => useParentalConsent({ service }));
        await waitFor(() => expect(sinal).toBeDefined());

        await unmount();

        expect(sinal.aborted).toBe(true);
    });
});
