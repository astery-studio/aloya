import assert from 'node:assert/strict';
import test from 'node:test';

import { criarSupportContactRemovalService } from '../../../../src/features/support-network/services/supportContactRemoval.service.js';

const agora = new Date('2026-11-10T12:00:00.000Z');

function criarCenario({ vinculo, updateCount = 1, sessoes = 2, alertas = 1 } = {}) {
    const estado = {
        consulta: null,
        vinculo: null,
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

test('revoga contato ativo, encerra sessões, cancela alertas e notifica', async () => {
    const { estado, service } = criarCenario({
        vinculo: { id: 9, contatoId: 22, status: 'ativo', categoriaId: 3 }
    });

    const resultado = await service.remover({
        titularId: 1,
        papel: 'principal',
        contatoId: 9
    });

    assert.deepEqual(estado.consulta.where, {
        id: 9,
        titularId: 1,
        status: { in: ['pendente', 'ativo'] }
    });
    assert.deepEqual(estado.vinculo.data, {
        status: 'revogado',
        categoriaId: null,
        permissoesIndividuais: [],
        tokenConviteHash: null,
        dataExpiracao: null
    });
    assert.deepEqual(estado.sessoes[0], {
        where: {
            usuarioId: 22,
            revogadaEm: null,
            validadeSessao: { gt: agora }
        },
        data: { revogadaEm: agora }
    });
    assert.equal(estado.alertas[0].where.origemId, 9);
    assert.equal(estado.notificacoes[0].data.usuarioId, 22);
    assert.deepEqual(resultado, {
        id: 9,
        status: 'revogado',
        sessoesEncerradas: 2,
        alertasCancelados: 1
    });
});

test('cancela convite pendente sem tentar encerrar sessão inexistente', async () => {
    const { estado, service } = criarCenario({
        vinculo: { id: 10, contatoId: null, status: 'pendente', categoriaId: 3 }
    });

    const resultado = await service.remover({
        titularId: 1,
        papel: 'principal',
        contatoId: 10
    });

    assert.equal(estado.vinculo.data.status, 'revogado');
    assert.equal(estado.vinculo.data.dataResposta, agora);
    assert.equal(estado.sessoes.length, 0);
    assert.equal(estado.notificacoes.length, 0);
    assert.equal(resultado.sessoesEncerradas, 0);
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

test('detecta concorrência e não encerra sessões nem agenda notificação', async () => {
    const { estado, service } = criarCenario({
        vinculo: { id: 9, contatoId: 22, status: 'ativo', categoriaId: 3 },
        updateCount: 0
    });
    await assert.rejects(service.remover({ titularId: 1, papel: 'principal', contatoId: 9 }), {
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
    await assert.rejects(service.remover({ titularId: 1, papel: 'principal', contatoId: 9 }), {
        status: 409,
        codigo: 'VINCULO_INCONSISTENTE'
    });
    assert.equal(estado.vinculo, null);
});
