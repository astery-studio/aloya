import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationService } from '../../../../src/features/support-network/services/contactInvitation.service.js';

function criarPrisma(usuario) {
    const chamadas = [];
    return {
        chamadas,
        usuario: {
            async findUnique(argumentos) {
                chamadas.push(argumentos);
                return usuario;
            }
        }
    };
}

test('informa somente se o e-mail pertence a uma conta de contato ativa', async () => {
    const prisma = criarPrisma({ id: 8, papel: 'contato_apoio', statusConta: 'ativa' });
    const service = criarContactInvitationService({ prisma });

    const resultado = await service.consultarEmail({
        titularId: 2,
        papel: 'principal',
        email: 'contato@example.com'
    });

    assert.deepEqual(resultado, {
        email: 'contato@example.com',
        contaContatoCadastrada: true
    });
    assert.deepEqual(prisma.chamadas[0].select, {
        id: true,
        papel: true,
        statusConta: true
    });
});

test('não expõe conta inexistente, principal, suspensa ou da própria titular', async () => {
    const cenarios = [
        null,
        { id: 8, papel: 'principal', statusConta: 'ativa' },
        { id: 8, papel: 'contato_apoio', statusConta: 'suspensa' },
        { id: 2, papel: 'contato_apoio', statusConta: 'ativa' }
    ];

    for (const usuario of cenarios) {
        const service = criarContactInvitationService({ prisma: criarPrisma(usuario) });
        const resultado = await service.consultarEmail({
            titularId: 2,
            papel: 'principal',
            email: 'pessoa@example.com'
        });
        assert.equal(resultado.contaContatoCadastrada, false);
    }
});

test('bloqueia consulta por sessão inválida ou por contato de apoio', async () => {
    const service = criarContactInvitationService({ prisma: criarPrisma(null) });

    await assert.rejects(
        service.consultarEmail({ titularId: null, papel: 'principal', email: 'a@b.com' }),
        { codigo: 'SESSAO_INVALIDA', status: 401 }
    );
    await assert.rejects(
        service.consultarEmail({ titularId: 2, papel: 'contato_apoio', email: 'a@b.com' }),
        { codigo: 'ACESSO_NEGADO', status: 403 }
    );
});

test('falha de dependência não é convertida em resultado negativo', async () => {
    const service = criarContactInvitationService();

    await assert.rejects(
        service.consultarEmail({ titularId: 2, papel: 'principal', email: 'a@b.com' }),
        { name: 'TypeError', message: 'Não foi possível consultar o contato.' }
    );
});
