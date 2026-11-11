import assert from 'node:assert/strict';
import test from 'node:test';

import { criarSupportContactRemovalService } from '../../../../src/features/support-network/services/supportContactRemoval.service.js';

const agora = new Date('2026-11-10T12:00:00.000Z');

function criarCenario({
    vinculo,
    updateCount = 1,
    deleteCount = 1,
    sessoes = 2,
    alertas = 1
} = {}) {
    const estado = {
        consulta: null,
        vinculo: null,
        exclusao: null,
        sessoes: [],
        alertas: [],
        notificacoes: []
    };
    const tx = {
        vinculoRedeApoio: {
            async findFirst(consulta) {
                estado.consulta = consulta;
                return vinculo;
            },
            async updateMany(consulta) {
                estado.vinculo = consulta;
                return { count: updateCount };
            },
            async deleteMany(consulta) {
                estado.exclusao = consulta;
                return { count: deleteCount };
            }
        },
        sessao: {
            async updateMany(consulta) {
                estado.sessoes.push(consulta);
                return { count: sessoes };
            }
        },
        notificacao: {
            async updateMany(consulta) {
                estado.alertas.push(consulta);
                return { count: alertas };
            },
            async create(consulta) {
                estado.notificacoes.push(consulta);
                return { id: 1 };
            }
        }
    };
    const service = criarSupportContactRemovalService({
        prisma: {
            async $transaction(callback) {
                return callback(tx);
            }
        },
        now: () => agora
    });
    return { estado, service };
}

test('revoga somente o vínculo, preserva a sessão, cancela alertas e notifica', async () => {
    const { estado, service } = criarCenario({
        vinculo: { id: 9, contatoId: 22, status: 'ativo', categoriaId: 3 }
    });

    const resultado = await service.desativar({
        titularId: 1,
        papel: 'principal',
        contatoId: 9
    });

    assert.deepEqual(estado.consulta.where, {
        id: 9,
        titularId: 1,
        status: 'ativo'
    });
    assert.deepEqual(estado.vinculo.data, {
        status: 'revogado',
        tokenConviteHash: null,
        dataExpiracao: null,
        dataResposta: agora
    });
    assert.equal(estado.sessoes.length, 0);
    assert.equal(estado.alertas[0].where.origemId, 9);
    assert.equal(estado.notificacoes[0].data.usuarioId, 22);
    assert.deepEqual(resultado, {
        id: 9,
        status: 'revogado',
        statusAnterior: 'ativo',
        sessoesEncerradas: 0,
        alertasCancelados: 1
    });
});

test('cancela convite pendente removendo o vínculo sem tentar encerrar sessão', async () => {
    const { estado, service } = criarCenario({
        vinculo: { id: 10, contatoId: null, status: 'pendente', categoriaId: 3 }
    });

    const resultado = await service.remover({
        titularId: 1,
        papel: 'principal',
        contatoId: 10
    });

    assert.deepEqual(estado.exclusao.where, {
        id: 10,
        titularId: 1,
        status: 'pendente'
    });
    assert.equal(estado.sessoes.length, 0);
    assert.equal(estado.notificacoes.length, 0);
    assert.equal(resultado.sessoesEncerradas, 0);
    assert.equal(resultado.status, 'removido');
    assert.equal(resultado.statusAnterior, 'pendente');
});

test('notifica contato cadastrado mesmo quando o convite ainda está pendente', async () => {
    const { estado, service } = criarCenario({
        vinculo: { id: 10, contatoId: 22, status: 'pendente', categoriaId: null }
    });

    await service.remover({ titularId: 1, papel: 'principal', contatoId: 10 });

    assert.equal(estado.sessoes.length, 0);
    assert.equal(estado.notificacoes.length, 1);
    assert.equal(estado.notificacoes[0].data.usuarioId, 22);
});

test('não revela contato inexistente, removido ou pertencente a outra titular', async () => {
    const { service } = criarCenario({ vinculo: null });
    await assert.rejects(service.remover({ titularId: 1, papel: 'principal', contatoId: 9 }), {
        status: 404,
        codigo: 'CONTATO_NAO_ENCONTRADO'
    });
});

test('detecta concorrência na desativação e não encerra sessões nem agenda notificação', async () => {
    const { estado, service } = criarCenario({
        vinculo: { id: 9, contatoId: 22, status: 'ativo', categoriaId: 3 },
        updateCount: 0
    });
    await assert.rejects(service.desativar({ titularId: 1, papel: 'principal', contatoId: 9 }), {
        status: 409,
        codigo: 'CONTATO_ALTERADO'
    });
    assert.equal(estado.sessoes.length, 0);
    assert.equal(estado.notificacoes.length, 0);
});

test('rejeita vínculo ativo inconsistente antes de aplicar qualquer alteração', async () => {
    const { estado, service } = criarCenario({
        vinculo: { id: 9, contatoId: null, status: 'ativo', categoriaId: 3 }
    });
    await assert.rejects(service.desativar({ titularId: 1, papel: 'principal', contatoId: 9 }), {
        status: 409,
        codigo: 'VINCULO_INCONSISTENTE'
    });
    assert.equal(estado.vinculo, null);
});
