import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationResendService } from '../../../../src/features/support-network/services/contactInvitationResend.service.js';

const agora = new Date('2026-11-08T12:00:00.000Z');
const expiracao = new Date('2026-11-15T12:00:00.000Z');

function criarCenario({
    convite = {},
    falharEmail = false,
    falharNotificacao = false,
    count = 1
} = {}) {
    const original = {
        id: 9,
        contatoId: 2,
        emailConvidado: 'bia@example.com',
        status: 'pendente',
        tokenConviteHash: 'hash-antigo',
        dataEnvio: new Date('2026-10-30T12:00:00.000Z'),
        dataExpiracao: new Date('2026-11-06T12:00:00.000Z'),
        dataResposta: null,
        titular: { nome: 'Ana' },
        ...convite
    };
    const estado = { consultas: [], atualizacoes: [], emails: [], notificacoes: [] };
    const service = criarContactInvitationResendService({
        prisma: {
            vinculoRedeApoio: {
                async findFirst(consulta) {
                    estado.consultas.push(consulta);
                    return original;
                },
                async updateMany(consulta) {
                    estado.atualizacoes.push(consulta);
                    return { count };
                }
            },
            notificacao: {
                async create(dados) {
                    estado.notificacoes.push(dados);
                    if (falharNotificacao) throw new Error('Notificações indisponíveis');
                }
            }
        },
        tokenService: {
            emitir() {
                return { tokenHash: 'hash-novo', dataExpiracao: expiracao, link: 'aloya://novo' };
            }
        },
        emailService: {
            async enviarConviteRedeApoio(dados) {
                estado.emails.push(dados);
                if (falharEmail) throw new Error('SMTP indisponível');
            }
        },
        now: () => agora
    });
    return { estado, original, service };
}

test('renova credencial e notifica no app quando o contato já possui conta', async () => {
    const { estado, service } = criarCenario();

    const resultado = await service.reenviar({
        titularId: 1,
        papel: 'principal',
        contatoId: 9
    });

    assert.deepEqual(estado.consultas[0].where, {
        id: 9,
        titularId: 1,
        status: { in: ['pendente', 'revogado', 'recusado'] }
    });
    assert.deepEqual(estado.atualizacoes[0].where, {
        id: 9,
        titularId: 1,
        status: 'pendente',
        tokenConviteHash: 'hash-antigo'
    });
    assert.deepEqual(estado.atualizacoes[0].data, {
        status: 'pendente',
        tokenConviteHash: 'hash-novo',
        dataEnvio: agora,
        dataExpiracao: expiracao,
        dataResposta: null
    });
    assert.deepEqual(estado.emails, []);
    assert.equal(estado.notificacoes[0].data.usuarioId, 2);
    assert.equal(estado.notificacoes[0].data.origemId, 9);
    assert.deepEqual(resultado, {
        id: 9,
        email: 'bia@example.com',
        status: 'pendente',
        dataEnvio: agora,
        dataExpiracao: expiracao
    });
});

test('reativa convite inativo sem alterar as permissões preservadas', async () => {
    const { estado, service } = criarCenario({
        convite: {
            status: 'revogado',
            tokenConviteHash: null,
            dataExpiracao: null,
            dataResposta: new Date('2026-11-01T12:00:00.000Z')
        }
    });

    await service.reenviar({ titularId: 1, papel: 'principal', contatoId: 9 });

    assert.equal(estado.atualizacoes[0].where.status, 'revogado');
    assert.equal(estado.atualizacoes[0].data.status, 'pendente');
    assert.equal(estado.notificacoes.length, 1);
});

test('indica cadastro no novo e-mail quando o convite ainda não tem contato', async () => {
    const { estado, service } = criarCenario({ convite: { contatoId: null } });
    await service.reenviar({ titularId: 1, papel: 'principal', contatoId: 9 });
    assert.equal(estado.emails[0].requerCadastro, true);
    assert.equal(estado.notificacoes.length, 0);
});

test('não reenvia convite inexistente, ativo ou pertencente a outra titular', async () => {
    const indisponivel = criarContactInvitationResendService({
        prisma: {
            vinculoRedeApoio: {
                async findFirst() {
                    return null;
                },
                async updateMany() {
                    return { count: 0 };
                }
            },
            notificacao: { create() {} }
        },
        tokenService: { emitir() {} },
        emailService: { enviarConviteRedeApoio() {} }
    });

    await assert.rejects(
        indisponivel.reenviar({ titularId: 1, papel: 'principal', contatoId: 9 }),
        { status: 409, codigo: 'CONVITE_NAO_DISPONIVEL' }
    );
});

test('detecta atualização concorrente antes do envio do e-mail', async () => {
    const { estado, service } = criarCenario({ count: 0 });
    await assert.rejects(service.reenviar({ titularId: 1, papel: 'principal', contatoId: 9 }), {
        status: 409,
        codigo: 'CONVITE_ALTERADO'
    });
    assert.equal(estado.emails.length, 0);
});

test('restaura a credencial anterior quando o envio do e-mail falha', async () => {
    const { estado, original, service } = criarCenario({
        convite: { contatoId: null },
        falharEmail: true
    });

    await assert.rejects(
        service.reenviar({ titularId: 1, papel: 'principal', contatoId: 9 }),
        /SMTP indisponível/
    );

    assert.equal(estado.atualizacoes.length, 2);
    assert.deepEqual(estado.atualizacoes[1].data, {
        status: original.status,
        tokenConviteHash: original.tokenConviteHash,
        dataEnvio: original.dataEnvio,
        dataExpiracao: original.dataExpiracao,
        dataResposta: original.dataResposta
    });
});

test('restaura a credencial anterior quando a notificação interna falha', async () => {
    const { estado, original, service } = criarCenario({ falharNotificacao: true });

    await assert.rejects(
        service.reenviar({ titularId: 1, papel: 'principal', contatoId: 9 }),
        /Notificações indisponíveis/u
    );

    assert.equal(estado.atualizacoes.length, 2);
    assert.deepEqual(estado.atualizacoes[1].data, {
        status: original.status,
        tokenConviteHash: original.tokenConviteHash,
        dataEnvio: original.dataEnvio,
        dataExpiracao: original.dataExpiracao,
        dataResposta: original.dataResposta
    });
});
