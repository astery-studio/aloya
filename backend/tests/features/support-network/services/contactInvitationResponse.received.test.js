import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationResponseService } from '../../../../src/features/support-network/services/contactInvitationResponse.service.js';

const AGORA = new Date('2026-11-08T12:00:00.000Z');

function criarCenario({ convite = {}, atualizados = 1, papel = 'contato_apoio' } = {}) {
    const operacoes = { consulta: null, vinculos: [], notificacoes: [], usuarios: [] };
    const conviteEncontrado = {
        id: 31,
        titularId: 3,
        contatoId: 25,
        emailConvidado: 'contato@email.com',
        status: 'pendente',
        dataExpiracao: new Date('2026-11-09T12:00:00.000Z'),
        titular: { nome: 'Julia' },
        categoria: null,
        ...convite
    };
    const tx = {
        usuario: {
            async findUnique() {
                return {
                    id: 25,
                    email: 'contato@email.com',
                    papel,
                    statusConta: 'ativa'
                };
            },
            async update(dados) {
                operacoes.usuarios.push(dados);
            }
        },
        vinculoRedeApoio: {
            async updateMany(dados) {
                operacoes.vinculos.push(dados);
                return { count: atualizados };
            }
        },
        notificacao: {
            async create(dados) {
                operacoes.notificacoes.push(dados);
            }
        }
    };
    const service = criarContactInvitationResponseService({
        prisma: {
            vinculoRedeApoio: {
                async findUnique() {},
                async findFirst(consulta) {
                    operacoes.consulta = consulta;
                    return conviteEncontrado;
                }
            },
            async $transaction(callback) {
                return callback(tx);
            }
        },
        tokenService: { calcularHash: () => 'hash-seguro' },
        now: () => AGORA
    });

    return { service, operacoes };
}

test('aceita um convite recebido pertencente ao contato autenticado', async () => {
    const { service, operacoes } = criarCenario();

    const resultado = await service.responderRecebido({
        conviteId: 31,
        usuarioId: 25,
        acao: 'aceitar'
    });

    assert.deepEqual(operacoes.consulta.where, {
        id: 31,
        contatoId: 25,
        status: 'pendente',
        dataExpiracao: { gt: AGORA }
    });
    assert.deepEqual(operacoes.vinculos[0].where, {
        id: 31,
        contatoId: 25,
        emailConvidado: 'contato@email.com',
        status: 'pendente',
        dataExpiracao: { gt: AGORA }
    });
    assert.deepEqual(resultado, {
        status: 'ativo',
        mensagem: 'Convite aceito com sucesso.'
    });
    assert.equal(operacoes.notificacoes[0].data.usuarioId, 3);
});

test('recusa o convite definitivamente sem registrar motivo', async () => {
    const { service, operacoes } = criarCenario();

    const resultado = await service.responderRecebido({
        conviteId: 31,
        usuarioId: 25,
        acao: 'recusar'
    });

    assert.equal(operacoes.vinculos[0].data.status, 'recusado');
    assert.equal('motivo' in operacoes.notificacoes[0].data, false);
    assert.deepEqual(resultado, {
        status: 'recusado',
        mensagem: 'Convite recusado com sucesso.'
    });
});

test('promove a conta principal somente quando ela aceita o convite', async () => {
    const { service, operacoes } = criarCenario({ papel: 'principal' });

    await service.responderRecebido({
        conviteId: 31,
        usuarioId: 25,
        acao: 'aceitar'
    });

    assert.deepEqual(operacoes.usuarios, [
        {
            where: { id: 25 },
            data: { papel: 'principal_e_contato_apoio' }
        }
    ]);
});

test('permite que a conta principal recuse o próprio convite sem mudar de papel', async () => {
    const { service, operacoes } = criarCenario({ papel: 'principal' });

    const resultado = await service.responderRecebido({
        conviteId: 31,
        usuarioId: 25,
        acao: 'recusar'
    });

    assert.deepEqual(operacoes.usuarios, []);
    assert.equal(operacoes.vinculos[0].data.status, 'recusado');
    assert.equal(resultado.status, 'recusado');
});

test('não processa convite inexistente ou alterado concorrentemente', async () => {
    const inexistente = criarCenario({ convite: null });
    inexistente.service = criarContactInvitationResponseService({
        prisma: {
            vinculoRedeApoio: {
                async findUnique() {},
                async findFirst() {
                    return null;
                }
            }
        },
        tokenService: { calcularHash: () => 'hash-seguro' },
        now: () => AGORA
    });

    await assert.rejects(
        () =>
            inexistente.service.responderRecebido({
                conviteId: 31,
                usuarioId: 25,
                acao: 'aceitar'
            }),
        { status: 410, codigo: 'CONVITE_INDISPONIVEL' }
    );

    await assert.rejects(
        () =>
            criarCenario({ atualizados: 0 }).service.responderRecebido({
                conviteId: 31,
                usuarioId: 25,
                acao: 'aceitar'
            }),
        { status: 410, codigo: 'CONVITE_INDISPONIVEL' }
    );
});
