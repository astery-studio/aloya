import assert from 'node:assert/strict';
import test from 'node:test';

import { criarSupportContactRemovalService } from '../../../../src/features/support-network/services/supportContactRemoval.service.js';

const AGORA = new Date('2026-11-09T12:00:00.000Z');

function criarService(estado) {
    const tx = {
        vinculoRedeApoio: {
            async findFirst(consulta) {
                estado.consulta = consulta;
                return { id: 9, contatoId: 22, status: 'ativo', categoriaId: 3 };
            },
            async updateMany(consulta) {
                estado.vinculo = consulta;
                return { count: 1 };
            },
            async deleteMany(consulta) {
                estado.exclusao = consulta;
                return { count: 1 };
            }
        },
        sessao: {
            async updateMany(consulta) {
                estado.sessoes = consulta;
                return { count: 1 };
            }
        },
        notificacao: {
            async updateMany(consulta) {
                estado.alertas = consulta;
                return { count: 1 };
            },
            async create(consulta) {
                estado.notificacao = consulta;
                return { id: 1 };
            }
        }
    };
    return criarSupportContactRemovalService({
        prisma: {
            async $transaction(callback) {
                estado.transacoes = (estado.transacoes || 0) + 1;
                return callback(tx);
            }
        },
        now: () => AGORA
    });
}

test('amarra leitura e revogação ao titular autenticado e ao vínculo solicitado', async () => {
    const estado = {};
    const service = criarService(estado);

    await service.remover({ titularId: 42, papel: 'principal', contatoId: 9 });

    assert.deepEqual(estado.consulta.where, {
        id: 9,
        titularId: 42,
        status: { in: ['pendente', 'ativo', 'revogado', 'recusado'] }
    });
    assert.equal(estado.exclusao.where.id, 9);
    assert.equal(estado.exclusao.where.titularId, 42);
    assert.equal(estado.exclusao.where.status, 'ativo');
});

test('não inicia transação para contato de apoio ou sessão inválida', async () => {
    let iniciou = false;
    const service = criarSupportContactRemovalService({
        prisma: {
            async $transaction() {
                iniciou = true;
            }
        }
    });

    await assert.rejects(service.remover({ titularId: 2, papel: 'contato_apoio', contatoId: 9 }), {
        status: 403
    });
    await assert.rejects(service.remover({ titularId: 0, papel: 'principal', contatoId: 9 }), {
        status: 401
    });
    assert.equal(iniciou, false);
});

test('preserva a sessão global e revoga somente o acesso pelo vínculo', async () => {
    const estado = {};
    const service = criarService(estado);

    await service.remover({ titularId: 42, papel: 'principal', contatoId: 9 });

    assert.equal(estado.sessoes, undefined);
});

test('notificação de revogação não expõe motivo, categoria ou permissões', async () => {
    const estado = {};
    const service = criarService(estado);

    await service.remover({ titularId: 42, papel: 'principal', contatoId: 9 });

    assert.deepEqual(Object.keys(estado.notificacao.data).sort(), [
        'dataHoraProgramada',
        'origemId',
        'statusEnvio',
        'tipoOrigem',
        'usuarioId'
    ]);
    const serializado = JSON.stringify(estado.notificacao);
    assert.equal(serializado.includes('motivo'), false);
    assert.equal(serializado.includes('categoria'), false);
    assert.equal(serializado.includes('permiss'), false);
});
