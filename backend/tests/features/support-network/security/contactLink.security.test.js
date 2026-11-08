import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactLinkService } from '../../../../src/features/support-network/services/contactLink.service.js';

const versao = new Date('2026-11-08T12:00:00.000Z');

function criarService(estado) {
    const tx = {
        vinculoRedeApoio: {
            async findFirst(consulta) {
                estado.consulta = consulta;
                return {
                    id: 9,
                    contatoId: 22,
                    emailConvidado: 'contato@example.com',
                    permissoesIndividuais: ['geral.fase_atual'],
                    atualizadoEm: versao,
                    contato: { nome: 'Contato' },
                    categoria: null
                };
            },
            async updateMany(consulta) {
                estado.atualizacao = consulta;
                return { count: 1 };
            }
        },
        categoriaPermissao: {
            async findFirst(consulta) {
                estado.categoria = consulta;
                return {
                    id: 7,
                    nome: 'Família',
                    conjuntoDadosVisiveis: ['saude.consultas']
                };
            }
        },
        notificacao: {
            async create(consulta) {
                estado.notificacao = consulta;
                return { id: 1 };
            }
        }
    };
    return criarContactLinkService({
        prisma: { async $transaction(callback) { return callback(tx); } }
    });
}

test('amarra leitura, categoria e gravação ao titular autenticado', async () => {
    const estado = {};
    const service = criarService(estado);

    await service.atualizar({
        titularId: 42,
        papel: 'principal',
        contatoId: 9,
        tipo: 'categoria',
        categoriaId: 7,
        versao
    });

    assert.equal(estado.consulta.where.titularId, 42);
    assert.equal(estado.categoria.where.titularId, 42);
    assert.equal(estado.atualizacao.where.titularId, 42);
    assert.equal(estado.atualizacao.where.contatoId, 22);
    assert.equal(estado.atualizacao.where.status, 'ativo');
});

test('notificação não detalha permissões adicionadas ou removidas', async () => {
    const estado = {};
    const service = criarService(estado);

    await service.atualizar({
        titularId: 42,
        papel: 'principal',
        contatoId: 9,
        tipo: 'categoria',
        categoriaId: 7,
        versao
    });

    assert.deepEqual(Object.keys(estado.notificacao.data).sort(), [
        'dataHoraProgramada',
        'origemId',
        'statusEnvio',
        'tipoOrigem',
        'usuarioId'
    ]);
    const serializado = JSON.stringify(estado.notificacao);
    assert.equal(serializado.includes('saude.consultas'), false);
    assert.equal(serializado.includes('permissoes'), false);
});

test('não inicia transação para contato de apoio ou sessão inválida', async () => {
    let iniciou = false;
    const service = criarContactLinkService({
        prisma: { async $transaction() { iniciou = true; } }
    });

    await assert.rejects(
        service.atualizar({
            titularId: 2,
            papel: 'contato_apoio',
            contatoId: 9,
            versao
        }),
        { status: 403 }
    );
    await assert.rejects(
        service.atualizar({ titularId: 0, papel: 'principal', contatoId: 9, versao }),
        { status: 401 }
    );
    assert.equal(iniciou, false);
});

test('não permite atualizar outro contato entre a leitura e a gravação', async () => {
    const estado = {};
    const service = criarService(estado);
    await service.atualizar({
        titularId: 42,
        papel: 'principal',
        contatoId: 9,
        tipo: 'categoria',
        categoriaId: 7,
        versao
    });

    assert.equal(estado.atualizacao.where.id, 9);
    assert.equal(estado.atualizacao.where.atualizadoEm, versao);
});
