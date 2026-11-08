import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationResponseService } from '../../../../src/features/support-network/services/contactInvitationResponse.service.js';

const token = 'a'.repeat(43);

function criarCenario({ atualizados = 1 } = {}) {
    const operacoes = { vinculos: [], notificacoes: [] };
    const convite = {
        id: 9,
        titularId: 3,
        emailConvidado: 'contato@email.com',
        status: 'pendente',
        dataExpiracao: new Date('2026-11-09T12:00:00.000Z'),
        titular: { nome: 'Julia' },
        categoria: null
    };
    const tx = {
        usuario: {
            async findUnique() {
                return {
                    id: 25,
                    email: 'contato@email.com',
                    papel: 'contato_apoio',
                    statusConta: 'ativa'
                };
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
                async findUnique() {
                    return convite;
                }
            },
            async $transaction(callback) {
                return callback(tx);
            }
        },
        tokenService: { calcularHash: () => 'hash-seguro' },
        now: () => new Date('2026-11-08T12:00:00.000Z')
    });
    return { service, operacoes };
}

test('recusa definitivamente sem conceder acesso', async () => {
    const { service, operacoes } = criarCenario();
    const resultado = await service.recusar({ token, usuarioId: 25 });

    assert.deepEqual(resultado, {
        status: 'recusado',
        mensagem: 'Convite recusado com sucesso.'
    });
    assert.deepEqual(operacoes.vinculos[0].data, {
        contatoId: 25,
        status: 'recusado',
        tokenConviteHash: null,
        dataResposta: new Date('2026-11-08T12:00:00.000Z')
    });
    assert.equal(operacoes.notificacoes[0].data.usuarioId, 3);
    assert.equal('motivo' in operacoes.notificacoes[0].data, false);
});

test('não confirma recusa após alteração concorrente', async () => {
    await assert.rejects(
        () => criarCenario({ atualizados: 0 }).service.recusar({ token, usuarioId: 25 }),
        { status: 410, codigo: 'CONVITE_INDISPONIVEL' }
    );
});
