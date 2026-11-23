import assert from 'node:assert/strict';
import test from 'node:test';

import { criarParentalConsentService } from '../../../../src/features/auth/services/parentalConsent.service.js';

function criarCrypto() {
    return {
        createHash() {
            return {
                update() {
                    return this;
                },
                digest: () => 'hash-do-token'
            };
        }
    };
}

test('não duplica notificação quando o mesmo consentimento já foi processado', async () => {
    let notificou = false;
    const agora = new Date('2026-11-09T12:00:00.000Z');
    const tx = {
        usuario: {
            async findUnique() {
                return {
                    id: 1,
                    nome: 'Titular',
                    email: 'titular@email.com',
                    papel: 'principal',
                    dataNascimento: new Date('2014-01-01T00:00:00.000Z')
                };
            }
        },
        consentimentoParental: {
            async findFirst() {
                return {
                    id: 5,
                    titularMenorId: 1,
                    statusConsentimento: 'pendente',
                    validadeLink: new Date('2026-11-09T13:00:00.000Z')
                };
            },
            async updateMany() {
                return { count: 0 };
            }
        },
        notificacao: {
            async create() {
                notificou = true;
            }
        }
    };
    const service = criarParentalConsentService({
        prisma: {
            async $transaction(callback) {
                return callback(tx);
            }
        },
        crypto: criarCrypto(),
        baseUrl: 'https://aloya.test',
        dateUtils: { calcularIdade: () => 12 },
        emailService: {},
        now: () => agora
    });

    await assert.rejects(service.confirmar('t'.repeat(43)), {
        status: 409,
        codigo: 'CONSENTIMENTO_JA_PROCESSADO'
    });
    assert.equal(notificou, false);
});

test('a notificação parental não contém e-mail, token ou dados privados', async () => {
    let notificacao;
    const agora = new Date('2026-11-09T12:00:00.000Z');
    const tx = {
        usuario: {
            async findUnique() {
                return {
                    id: 1,
                    nome: 'Titular',
                    email: 'titular@email.com',
                    papel: 'principal',
                    dataNascimento: new Date('2014-01-01T00:00:00.000Z')
                };
            }
        },
        consentimentoParental: {
            async findFirst() {
                return {
                    id: 5,
                    titularMenorId: 1,
                    statusConsentimento: 'pendente',
                    validadeLink: new Date('2026-11-09T13:00:00.000Z')
                };
            },
            async updateMany() {
                return { count: 1 };
            }
        },
        notificacao: {
            async create(dados) {
                notificacao = dados;
            }
        }
    };
    const service = criarParentalConsentService({
        prisma: {
            async $transaction(callback) {
                return callback(tx);
            }
        },
        crypto: criarCrypto(),
        baseUrl: 'https://aloya.test',
        dateUtils: { calcularIdade: () => 12 },
        emailService: {},
        now: () => agora
    });

    await service.confirmar('t'.repeat(43));

    assert.deepEqual(Object.keys(notificacao.data).sort(), [
        'dataHoraProgramada',
        'origemId',
        'statusEnvio',
        'tipoOrigem',
        'usuarioId'
    ]);
    assert.equal(JSON.stringify(notificacao).includes('email'), false);
    assert.equal(JSON.stringify(notificacao).includes('token'), false);
});
