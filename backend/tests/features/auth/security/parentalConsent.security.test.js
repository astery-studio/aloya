import assert from 'node:assert/strict';
import test from 'node:test';

import { criarParentalConsentService } from '../../../../src/features/auth/services/parentalConsent.service.js';

function criarService(papel) {
    let alterou = false;
    const service = criarParentalConsentService({
        prisma: {
            usuario: {
                async findUnique() {
                    return {
                        id: 7,
                        nome: 'Contato',
                        email: 'contato@email.com',
                        papel,
                        dataNascimento: new Date('2014-01-01T00:00:00.000Z')
                    };
                }
            },
            consentimentoParental: {
                async upsert() {
                    alterou = true;
                }
            }
        },
        crypto: {
            randomBytes() {
                return { toString: () => 't'.repeat(43) };
            },
            createHash() {
                return {
                    update() {
                        return this;
                    },
                    digest: () => 'hash-do-token'
                };
            }
        },
        baseUrl: 'https://aloya.test/consentimento',
        dateUtils: { calcularIdade: () => 12 },
        emailService: { async enviarEmailConsentimentoParental() {} }
    });
    return { service, alterou: () => alterou };
}

test('impede conta somente de contato de solicitar consentimento parental', async () => {
    const { service, alterou } = criarService('contato_apoio');

    await assert.rejects(service.solicitar(7, 'responsavel@email.com'), {
        status: 403,
        codigo: 'CONSENTIMENTO_NAO_AUTORIZADO'
    });
    assert.equal(alterou(), false);
});

test('permite que titular também cadastrada como contato gerencie o consentimento', async () => {
    const { service, alterou } = criarService('principal_e_contato_apoio');

    const resultado = await service.solicitar(7, 'responsavel@email.com');

    assert.equal(resultado.emailEnviado, true);
    assert.equal(alterou(), true);
});
