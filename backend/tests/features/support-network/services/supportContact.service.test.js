import assert from 'node:assert/strict';
import test from 'node:test';

import {
    criarSupportContactService,
    validarContatoAutenticado,
    validarTitular
} from '../../../../src/features/support-network/services/supportContact.service.js';

const agora = new Date('2026-11-08T12:00:00.000Z');

function criarPrisma(vinculos = []) {
    const estado = { consulta: null };
    return {
        estado,
        prisma: {
            vinculoRedeApoio: {
                async findMany(consulta) {
                    estado.consulta = consulta;
                    return vinculos;
                }
            }
        }
    };
}

function criarVinculo({ id, nome, status }) {
    return {
        id,
        emailConvidado: `${id}@email.com`,
        status,
        permissoesIndividuais: ['geral.fase_atual'],
        dataEnvio: new Date('2026-11-01T10:00:00.000Z'),
        dataResposta: status === 'ativo' ? new Date('2026-11-02T10:00:00.000Z') : null,
        contato: nome ? { nome } : null,
        categoria: null
    };
}

test('valida sessão e restringe a listagem à titular', () => {
    assert.throws(() => validarTitular(undefined, 'principal'), {
        status: 401,
        codigo: 'SESSAO_INVALIDA'
    });
    assert.throws(() => validarTitular(1, 'contato_apoio'), {
        status: 403,
        codigo: 'ACESSO_NEGADO'
    });
    assert.doesNotThrow(() => validarTitular(1, 'principal'));
    assert.doesNotThrow(() => validarTitular(1, 'principal_e_contato_apoio'));
});
test('consulta vínculos atuais e históricos pertencentes à titular', async () => {
    const { prisma, estado } = criarPrisma([]);
    const service = criarSupportContactService({ prisma, now: () => agora });

    await service.listar({ titularId: 27, papel: 'principal' });

    assert.deepEqual(estado.consulta.where, {
        titularId: 27,
        status: { in: ['pendente', 'ativo', 'revogado', 'recusado'] }
    });
    assert.deepEqual(estado.consulta.select.contato.select, { nome: true, email: true });
    assert.equal(estado.consulta.select.iconeId, true);
    assert.equal(estado.consulta.select.corId, true);
    assert.deepEqual(estado.consulta.select.categoria.select, {
        id: true,
        nome: true,
        conjuntoDadosVisiveis: true
    });
});

test('ordena, apresenta e resume a lista sem consultar dados desnecessários', async () => {
    const { prisma } = criarPrisma([
        criarVinculo({ id: 3, nome: 'Zélia', status: 'ativo' }),
        criarVinculo({ id: 2, nome: 'Rafael', status: 'pendente' }),
        criarVinculo({ id: 1, nome: 'Ana', status: 'ativo' })
    ]);
    const service = criarSupportContactService({ prisma, now: () => agora });

    const resultado = await service.listar({ titularId: 27, papel: 'principal' });

    assert.deepEqual(
        resultado.contatos.map(({ id }) => id),
        [2, 1, 3]
    );
    assert.deepEqual(resultado.resumo, {
        total: 3,
        pendentes: 1,
        ativos: 2,
        inativos: 0,
        recusados: 0
    });
    assert.equal(Object.isFrozen(resultado.contatos), true);
});

test('representa corretamente o estado vazio', async () => {
    const { prisma } = criarPrisma([]);
    const service = criarSupportContactService({ prisma, now: () => agora });

    const resultado = await service.listar({ titularId: 27, papel: 'principal' });

    assert.deepEqual(resultado, {
        contatos: [],
        resumo: { total: 0, pendentes: 0, ativos: 0, inativos: 0, recusados: 0 }
    });
});

test('falha de forma controlada com dependência ou retorno inválido', async () => {
    await assert.rejects(
        criarSupportContactService().listar({ titularId: 1, papel: 'principal' }),
        /Não foi possível consultar os contatos/
    );

    const service = criarSupportContactService({
        prisma: { vinculoRedeApoio: { async findMany() {} } }
    });
    await assert.rejects(
        service.listar({ titularId: 1, papel: 'principal' }),
        /listagem de contatos.*inválida/i
    );
});

test('valida o papel antes de listar convites recebidos', () => {
    assert.doesNotThrow(() => validarContatoAutenticado(8, 'contato_apoio'));
    assert.doesNotThrow(() => validarContatoAutenticado(8, 'principal_e_contato_apoio'));
    assert.doesNotThrow(() => validarContatoAutenticado(8, 'principal'));
    assert.throws(() => validarContatoAutenticado(8, 'administrador'), {
        status: 403,
        codigo: 'ACESSO_NEGADO'
    });
});

test('lista somente convites recebidos pendentes válidos e vínculos ativos', async () => {
    const { prisma, estado } = criarPrisma([
        {
            id: 7,
            status: 'pendente',
            iconeId: 'lotus',
            corId: 'verde',
            permissoesIndividuais: ['geral.fase_atual'],
            dataEnvio: new Date('2026-11-08T10:00:00.000Z'),
            dataResposta: null,
            titular: { nome: 'Ana', email: 'ana@example.com' },
            categoria: null
        }
    ]);
    const service = criarSupportContactService({ prisma, now: () => agora });

    const resultado = await service.listarRecebidos({
        usuarioId: 44,
        papel: 'contato_apoio'
    });

    assert.deepEqual(estado.consulta.where, {
        contatoId: 44,
        OR: [{ status: 'ativo' }, { status: 'pendente', dataExpiracao: { gt: agora } }]
    });
    assert.deepEqual(resultado.contatos[0], {
        id: 7,
        nome: 'Ana',
        email: 'ana@example.com',
        identificacao: 'Ana',
        iconeId: 'lotus',
        corId: 'verde',
        status: 'pendente',
        statusRotulo: 'Pendente',
        vinculo: {
            tipo: 'individual',
            rotulo: 'Permissão individual',
            categoria: null,
            permissoes: ['geral.fase_atual']
        },
        dataConvite: new Date('2026-11-08T10:00:00.000Z'),
        dataAtivacao: null,
        aguardando: { dias: 0, atrasado: false, rotulo: 'Aguardando há 0 dias' },
        acoes: { podeAceitar: true, podeRecusar: true, podeAbrirResumo: true }
    });
});
