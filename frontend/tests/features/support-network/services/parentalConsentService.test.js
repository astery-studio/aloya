import {
    criarParentalConsentService,
    normalizarStatusConsentimento,
    validarEmail
} from '../../../../src/features/support-network/services/parentalConsentService';

describe('parentalConsentService', () => {
    test('normaliza o estado pendente informado pelo backend', () => {
        expect(
            normalizarStatusConsentimento({
                acessoLiberado: false,
                motivo: 'CONSENTIMENTO_NECESSARIO',
                consentimentoNecessario: true,
                emailResponsavelInformado: true,
                emailResponsavelLegal: ' RESPONSAVEL@EMAIL.COM ',
                statusConsentimento: 'pendente'
            })
        ).toEqual({
            acessoLiberado: false,
            motivo: 'CONSENTIMENTO_NECESSARIO',
            consentimentoNecessario: true,
            emailResponsavelInformado: true,
            emailResponsavelLegal: 'responsavel@email.com',
            statusConsentimento: 'pendente',
            menorDe16: true
        });
    });

    test('reconhece a liberação automática aos 16 anos', () => {
        expect(
            normalizarStatusConsentimento({
                acessoLiberado: true,
                motivo: 'MAIOR_DE_16_ANOS',
                consentimentoNecessario: false,
                emailResponsavelInformado: false,
                emailResponsavelLegal: null,
                statusConsentimento: 'revogado'
            }).menorDe16
        ).toBe(false);
    });

    test('rejeita resposta inconsistente', () => {
        expect(() =>
            normalizarStatusConsentimento({
                acessoLiberado: false,
                motivo: 'CONSENTIMENTO_NECESSARIO',
                consentimentoNecessario: true,
                emailResponsavelInformado: true,
                emailResponsavelLegal: null,
                statusConsentimento: null
            })
        ).toThrow('Não foi possível verificar a autorização da Rede de Apoio.');
    });

    test.each(['', 'sem-arroba', 'nome@dominio'])('rejeita e-mail inválido: %s', (email) => {
        expect(() => validarEmail(email)).toThrow('Informe um e-mail válido.');
    });

    test('consulta, solicita e reenvia o consentimento', async () => {
        const requisicaoAutenticada = jest
            .fn()
            .mockResolvedValueOnce({
                acessoLiberado: false,
                motivo: 'CONSENTIMENTO_NECESSARIO',
                consentimentoNecessario: true,
                emailResponsavelInformado: false,
                emailResponsavelLegal: null,
                statusConsentimento: null
            })
            .mockResolvedValue({
                emailEnviado: true,
                acessoRedeApoioLiberado: false,
                statusConsentimento: 'pendente',
                mensagem: 'Enviado.'
            });
        const service = criarParentalConsentService({ requisicaoAutenticada });

        await service.consultarStatus();
        await service.solicitar('Responsavel@Email.com');
        await service.reenviar();

        expect(requisicaoAutenticada.mock.calls).toEqual([
            [{ caminho: '/auth/parental-consent/status' }],
            [
                {
                    metodo: 'POST',
                    caminho: '/auth/parental-consent/request',
                    corpo: { emailResponsavelLegal: 'responsavel@email.com' }
                }
            ],
            [
                {
                    metodo: 'POST',
                    caminho: '/auth/parental-consent/resend',
                    corpo: {}
                }
            ]
        ]);
    });

    test('impede envios simultâneos', async () => {
        let resolver;
        const requisicaoAutenticada = jest.fn(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        );
        const service = criarParentalConsentService({ requisicaoAutenticada });
        const primeiro = service.solicitar('responsavel@email.com');
        const segundo = service.reenviar();

        expect(segundo).toBe(primeiro);

        resolver({
            emailEnviado: true,
            acessoRedeApoioLiberado: false,
            statusConsentimento: 'pendente',
            mensagem: 'Enviado.'
        });

        await primeiro;
        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);
    });
});
