import assert from 'node:assert/strict';
import test from 'node:test';

import {
    criarContactInvitationService,
    validarAparenciaContato
} from '../../../../src/features/support-network/services/contactInvitation.service.js';

const APARENCIA_VALIDA = Object.freeze({
    iconeId: 'lotus',
    corId: 'verde'
});

function criarCenario({
    usuarioConvidado = null,
    vinculoExistente = null,
    falhaEmail = false,
    falhaNotificacao = false
} = {}) {
    const estado = {
        criado: null,
        removido: null,
        email: null,
        notificacao: null
    };

    const prisma = {
        usuario: {
            async findUnique({ where }) {
                if (where.id) {
                    return {
                        id: where.id,
                        nome: 'Titular',
                        email: 'titular@example.com'
                    };
                }

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
                    iconeId: data.iconeId,
                    corId: data.corId,
                    status: data.status,
                    dataEnvio: new Date('2026-11-08T12:00:00.000Z'),
                    dataExpiracao: data.dataExpiracao
                };
            },

            async deleteMany({ where }) {
                estado.removido = where;

                return {
                    count: 1
                };
            }
        },

        notificacao: {
            async create(dados) {
                estado.notificacao = dados;
                if (falhaNotificacao) throw new Error('Notificações indisponíveis');
                return { id: 1 };
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

            if (falhaEmail) {
                throw new Error('SMTP indisponível');
            }
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
        usuarioConvidado: {
            id: 9,
            papel: 'contato_apoio',
            statusConta: 'ativa'
        }
    });

    const resultado = await service.criarConvite({
        titularId: 2,
        papel: 'principal',
        email: 'contato@example.com',
        categoriaId: 3,
        ...APARENCIA_VALIDA
    });

    assert.equal(estado.criado.status, 'pendente');
    assert.equal(estado.criado.contatoId, 9);
    assert.equal(estado.criado.categoriaId, 3);

    assert.deepEqual(estado.criado.permissoesIndividuais, []);

    assert.equal(estado.criado.iconeId, 'lotus');
    assert.equal(estado.criado.corId, 'verde');

    assert.equal(resultado.status, 'pendente');

    assert.equal('tokenConviteHash' in resultado, false);

    assert.deepEqual(resultado.categoria, {
        id: 3,
        nome: 'Família'
    });

    assert.equal(resultado.iconeId, 'lotus');
    assert.equal(resultado.corId, 'verde');
    assert.equal(estado.email, null);
    assert.equal(estado.notificacao.data.usuarioId, 9);
    assert.equal(estado.notificacao.data.origemId, 20);
});

test('cria convite com permissões individuais para e-mail sem conta', async () => {
    const { service, estado } = criarCenario();

    const resultado = await service.criarConvite({
        titularId: 2,
        papel: 'principal',
        email: 'nova@example.com',
        permissoesIndividuais: ['geral.fase_atual'],
        iconeId: 'coracao',
        corId: 'coral'
    });

    assert.equal(estado.criado.contatoId, null);
    assert.equal(estado.criado.categoriaId, null);

    assert.deepEqual(estado.criado.permissoesIndividuais, ['geral.fase_atual']);

    assert.equal(estado.criado.iconeId, 'coracao');
    assert.equal(estado.criado.corId, 'coral');

    assert.equal(estado.email.requerCadastro, true);
    assert.equal(estado.notificacao, null);

    assert.equal(resultado.tipoPermissao, 'individual');

    assert.equal(resultado.iconeId, 'coracao');
    assert.equal(resultado.corId, 'coral');
});

test('rejeita aparência ausente ou desconhecida na camada de serviço', async () => {
    const service = criarCenario().service;

    await assert.rejects(
        service.criarConvite({
            titularId: 2,
            papel: 'principal',
            email: 'nova@example.com',
            categoriaId: 3
        }),
        {
            codigo: 'APARENCIA_CONTATO_INVALIDA',
            status: 422
        }
    );

    await assert.rejects(
        service.criarConvite({
            titularId: 2,
            papel: 'principal',
            email: 'nova@example.com',
            categoriaId: 3,
            iconeId: 'desconhecido',
            corId: 'verde'
        }),
        {
            codigo: 'APARENCIA_CONTATO_INVALIDA',
            status: 422
        }
    );

    await assert.rejects(
        service.criarConvite({
            titularId: 2,
            papel: 'principal',
            email: 'nova@example.com',
            categoriaId: 3,
            iconeId: 'lotus',
            corId: '#2C4C3B'
        }),
        {
            codigo: 'APARENCIA_CONTATO_INVALIDA',
            status: 422
        }
    );
});

test('valida a aparência sem modificar os identificadores', () => {
    assert.deepEqual(validarAparenciaContato('lotus', 'roxo'), {
        iconeId: 'lotus',
        corId: 'roxo'
    });

    assert.throws(() => validarAparenciaContato(' LOTUS ', 'Roxo'), {
        codigo: 'APARENCIA_CONTATO_INVALIDA',
        status: 422
    });
});

test('remove o vínculo pendente quando o envio do e-mail falha', async () => {
    const { service, estado } = criarCenario({
        falhaEmail: true
    });

    await assert.rejects(
        service.criarConvite({
            titularId: 2,
            papel: 'principal',
            email: 'nova@example.com',
            categoriaId: 3,
            ...APARENCIA_VALIDA
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

test('remove o vínculo pendente quando a notificação interna falha', async () => {
    const { service, estado } = criarCenario({
        usuarioConvidado: {
            id: 9,
            papel: 'contato_apoio',
            statusConta: 'ativa'
        },
        falhaNotificacao: true
    });

    await assert.rejects(
        service.criarConvite({
            titularId: 2,
            papel: 'principal',
            email: 'contato@example.com',
            categoriaId: 3,
            ...APARENCIA_VALIDA
        }),
        /Notificações indisponíveis/u
    );

    assert.equal(estado.email, null);
    assert.equal(estado.removido.id, 20);
});

test('impede auto-convite e convite duplicado', async () => {
    const proprio = criarCenario().service;

    await assert.rejects(
        proprio.criarConvite({
            titularId: 2,
            papel: 'principal',
            email: 'titular@example.com',
            categoriaId: 3,
            ...APARENCIA_VALIDA
        }),
        {
            codigo: 'CONVITE_PARA_PROPRIA_CONTA',
            status: 422
        }
    );

    const duplicado = criarCenario({
        vinculoExistente: {
            status: 'pendente'
        }
    }).service;

    await assert.rejects(
        duplicado.criarConvite({
            titularId: 2,
            papel: 'principal',
            email: 'contato@example.com',
            categoriaId: 3,
            ...APARENCIA_VALIDA
        }),
        {
            codigo: 'CONVITE_JA_PENDENTE',
            status: 409
        }
    );
});

test('formata a resposta sem expor credenciais do convite', async () => {
    const { service } = criarCenario();

    const resultado = await service.criarConvite({
        titularId: 2,
        papel: 'principal',
        email: 'nova@example.com',
        categoriaId: 3,
        ...APARENCIA_VALIDA
    });

    assert.equal(Object.isFrozen(resultado), true);

    assert.equal(Object.isFrozen(resultado.categoria), true);

    assert.equal(Object.isFrozen(resultado.permissoesIndividuais), true);

    assert.equal('tokenConviteHash' in resultado, false);

    assert.equal('token' in resultado, false);
});
