import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationResponseService } from '../../../../src/features/support-network/services/contactInvitationResponse.service.js';

const token = 'a'.repeat(43);

function criarCenario({
    email = 'contato@email.com',
    papel = 'contato_apoio',
    atualizados = 1
} = {}) {
    const operacoes = { usuarios: [], vinculos: [], notificacoes: [] };
    const convite = {
        id: 8,
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
                return { id: 25, email, papel, statusConta: 'ativa' };
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

test('ativa o vínculo e notifica a titular no mesmo instante', async () => {
    const { service, operacoes } = criarCenario();
    const resultado = await service.aceitar({ token, usuarioId: 25 });

    assert.deepEqual(resultado, {
        status: 'ativo',
        mensagem: 'Convite aceito com sucesso.'
    });
    assert.deepEqual(operacoes.vinculos[0].data, {
        contatoId: 25,
        status: 'ativo',
        tokenConviteHash: null,
        dataResposta: new Date('2026-11-08T12:00:00.000Z')
    });
    assert.equal(operacoes.notificacoes[0].data.usuarioId, 3);
    assert.equal(operacoes.notificacoes[0].data.origemId, 8);
});

test('promove conta principal ao papel combinado ao aceitar', async () => {
    const { service, operacoes } = criarCenario({ papel: 'principal' });
    await service.aceitar({ token, usuarioId: 25 });

    assert.deepEqual(operacoes.usuarios[0].data, {
        papel: 'principal_e_contato_apoio'
    });
});

test('não aceita por outra conta nem após alteração concorrente', async () => {
    await assert.rejects(
        () => criarCenario({ email: 'outra@email.com' }).service.aceitar({ token, usuarioId: 25 }),
        { status: 403, codigo: 'CONVITE_DE_OUTRA_CONTA' }
    );
    await assert.rejects(
        () => criarCenario({ atualizados: 0 }).service.aceitar({ token, usuarioId: 25 }),
        { status: 410, codigo: 'CONVITE_INDISPONIVEL' }
    );
});
