import test from 'node:test';
import assert from 'node:assert/strict';
import { criarParentalConsentService } from '../../src/services/parentalConsent.service.js';

function criarService() {
    const titular = {
        id: 1,
        nome: 'Carla',
        email: 'carla@email.com',
        dataNascimento: new Date('2000-01-01')
    };
    const prisma = {
        usuario: { findUnique: async () => titular },
        consentimentoParental: {
            updateMany: async () => ({ count: 1 }),
            findFirst: async () => ({
                id: 2,
                titularMenorId: 1,
                statusConsentimento: 'pendente',
                validadeLink: new Date('2030-01-01')
            })
        }
    };
    return criarParentalConsentService({
        prisma,
        emailService: {},
        crypto: {
            createHash: () => ({
                update() { return this; },
                digest: () => 'hash'
            })
        },
        baseUrl: 'https://aloya.test',
        dateUtils: { calcularIdade: () => 16 }
    });
}

test('encerra fluxos parentais quando a titular completa 16 anos', async () => {
    const service = criarService();
    const solicitacao = await service.solicitar(1, 'responsavel@email.com');
    assert.deepEqual(solicitacao, {
        emailEnviado: false,
        acessoRedeApoioLiberado: true,
        mensagem: 'O acesso à Rede de Apoio já está liberado.'
    });

    await assert.rejects(
        service.reenviar(1),
        { codigo: 'CONSENTIMENTO_NAO_NECESSARIO', status: 409 }
    );

    const confirmacao = await service.confirmar('token');
    assert.equal(confirmacao.acessoRedeApoioLiberado, true);
    assert.equal(
        confirmacao.mensagem,
        'A Rede de Apoio já está liberada para esta titular.'
    );
});
