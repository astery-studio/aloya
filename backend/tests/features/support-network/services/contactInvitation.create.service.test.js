import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationService } from '../../../../src/features/support-network/services/contactInvitation.service.js';

function criarCenario({
    usuarioConvidado = null,
    vinculoExistente = null,
    falhaEmail = false
} = {}) {
    const estado = { criado: null, removido: null, email: null };
    const prisma = {
        usuario: {
            async findUnique({ where }) {
                if (where.id)
                    return { id: where.id, nome: 'Titular', email: 'titular@example.com' };
                return usuarioConvidado;
            }
        },
        vinculoRedeApoio: {
            async findFirst() {
                return vinculoExistente;
            },
            async create({ data }) {
                estado.criado = data;
                return {
                    id: 20,
                    emailConvidado: data.emailConvidado,
                    status: data.status,
                    dataEnvio: new Date('2026-11-08T12:00:00.000Z'),
                    dataExpiracao: data.dataExpiracao
                };
            },
            async deleteMany({ where }) {
                estado.removido = where;
                return { count: 1 };
            }
        }
    };
    const permissionService = {
        async resolverCategoria() {
            return {
                tipo: 'categoria',
                categoriaId: 3,
                categoriaNome: 'Família',
                permissoesIndividuais: []
            };
        },
        resolverPermissoesIndividuais(permissoes) {
            return {
                tipo: 'individual',
                categoriaId: null,
                categoriaNome: null,
                permissoesIndividuais: permissoes
            };
        }
    };
    const tokenService = {
        emitir() {
            return {
                tokenHash: 'hash-seguro',
                link: 'aloya://invitation?token=token-puro',
                dataExpiracao: new Date('2026-11-15T12:00:00.000Z')
            };
        }
    };
    const emailService = {
        async enviarConviteRedeApoio(dados) {
            estado.email = dados;
            if (falhaEmail) throw new Error('SMTP indisponível');
        }
    };

    return {
        estado,
        service: criarContactInvitationService({
            prisma,
            permissionService,
            tokenService,
            emailService
        })
    };
}

test('cria convite pendente por categoria sem conceder acesso', async () => {
    const { service, estado } = criarCenario({
        usuarioConvidado: { id: 9, papel: 'contato_apoio', statusConta: 'ativa' }
    });

    const resultado = await service.criarConvite({
        titularId: 2,
        papel: 'principal',
        email: 'contato@example.com',
        categoriaId: 3
    });

    assert.equal(estado.criado.status, 'pendente');
    assert.equal(estado.criado.contatoId, 9);
    assert.equal(estado.criado.categoriaId, 3);
    assert.deepEqual(estado.criado.permissoesIndividuais, []);
    assert.equal(resultado.status, 'pendente');
    assert.equal('tokenConviteHash' in resultado, false);
    assert.deepEqual(resultado.categoria, { id: 3, nome: 'Família' });
});

test('cria convite com permissões individuais para e-mail sem conta', async () => {
    const { service, estado } = criarCenario();

    const resultado = await service.criarConvite({
        titularId: 2,
        papel: 'principal',
        email: 'nova@example.com',
        permissoesIndividuais: ['geral.fase_atual']
    });

    assert.equal(estado.criado.contatoId, null);
    assert.equal(estado.criado.categoriaId, null);
    assert.deepEqual(estado.criado.permissoesIndividuais, ['geral.fase_atual']);
    assert.equal(estado.email.requerCadastro, true);
    assert.equal(resultado.tipoPermissao, 'individual');
});

test('remove o vínculo pendente quando o envio do e-mail falha', async () => {
    const { service, estado } = criarCenario({ falhaEmail: true });

    await assert.rejects(
        service.criarConvite({
            titularId: 2,
            papel: 'principal',
            email: 'nova@example.com',
            categoriaId: 3
        }),
        /SMTP indisponível/u
    );
    assert.deepEqual(estado.removido, {
        id: 20,
        titularId: 2,
        status: 'pendente',
        tokenConviteHash: 'hash-seguro'
    });
});

test('impede auto-convite e convite duplicado', async () => {
    const proprio = criarCenario().service;
    await assert.rejects(
        proprio.criarConvite({
            titularId: 2,
            papel: 'principal',
            email: 'titular@example.com',
            categoriaId: 3
        }),
        { codigo: 'CONVITE_PARA_PROPRIA_CONTA', status: 422 }
    );

    const duplicado = criarCenario({ vinculoExistente: { status: 'pendente' } }).service;
    await assert.rejects(
        duplicado.criarConvite({
            titularId: 2,
            papel: 'principal',
            email: 'contato@example.com',
            categoriaId: 3
        }),
        { codigo: 'CONVITE_JA_PENDENTE', status: 409 }
    );
});
