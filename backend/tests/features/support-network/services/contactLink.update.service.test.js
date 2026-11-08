import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactLinkService } from '../../../../src/features/support-network/services/contactLink.service.js';

const versao = new Date('2026-11-08T12:00:00.000Z');
const agora = new Date('2026-11-09T12:00:00.000Z');

function criarCenario({ categoriaAtual = null, categoriaDestino = null, updateCount = 1 } = {}) {
    const atual = {
        id: 9,
        contatoId: 22,
        emailConvidado: 'ana@example.com',
        permissoesIndividuais: ['geral.fase_atual'],
        atualizadoEm: versao,
        contato: { nome: 'Ana' },
        categoria: categoriaAtual
    };
    const estado = { consultas: [], categorias: [], atualizacoes: [], notificacoes: [] };
    const tx = {
        vinculoRedeApoio: {
            async findFirst(consulta) {
                estado.consultas.push(consulta);
                return atual;
            },
            async updateMany(consulta) {
                estado.atualizacoes.push(consulta);
                return { count: updateCount };
            }
        },
        categoriaPermissao: {
            async findFirst(consulta) {
                estado.categorias.push(consulta);
                return categoriaDestino;
            }
        },
        notificacao: {
            async create(consulta) {
                estado.notificacoes.push(consulta);
                return { id: 1 };
            }
        }
    };
    const service = criarContactLinkService({
        prisma: {
            async $transaction(callback) {
                return callback(tx);
            }
        },
        now: () => agora
    });
    return { atual, estado, service };
}

test('move categoria para permissões individuais alteradas e agenda notificação', async () => {
    const { estado, service } = criarCenario({
        categoriaAtual: {
            id: 3,
            nome: 'Família',
            conjuntoDadosVisiveis: ['geral.fase_atual', 'saude.consultas']
        }
    });

    const resultado = await service.atualizar({
        titularId: 1,
        papel: 'principal',
        contatoId: 9,
        tipo: 'individual',
        categoriaId: null,
        permissoesIndividuais: ['geral.fase_atual'],
        versao
    });

    assert.deepEqual(estado.atualizacoes[0].data, {
        categoriaId: null,
        permissoesIndividuais: ['geral.fase_atual']
    });
    assert.deepEqual(estado.notificacoes[0].data, {
        usuarioId: 22,
        tipoOrigem: 'rede_apoio',
        origemId: 9,
        dataHoraProgramada: agora,
        statusEnvio: 'agendada'
    });
    assert.deepEqual(resultado, {
        contatoId: 9,
        tipo: 'individual',
        categoria: null,
        permissoes: ['geral.fase_atual']
    });
});

test('move individual para categoria substituindo integralmente as permissões', async () => {
    const categoriaDestino = {
        id: 7,
        nome: 'Profissional',
        conjuntoDadosVisiveis: ['saude.consultas']
    };
    const { estado, service } = criarCenario({ categoriaDestino });

    const resultado = await service.atualizar({
        titularId: 1,
        papel: 'principal',
        contatoId: 9,
        tipo: 'categoria',
        categoriaId: 7,
        permissoesIndividuais: null,
        versao
    });

    assert.deepEqual(estado.categorias[0].where, { id: 7, titularId: 1 });
    assert.deepEqual(estado.atualizacoes[0].data, {
        categoriaId: 7,
        permissoesIndividuais: []
    });
    assert.deepEqual(resultado.permissoes, ['saude.consultas']);
});

test('rejeita categoria para categoria e individual para individual', async () => {
    const categoria = {
        id: 3,
        nome: 'Família',
        conjuntoDadosVisiveis: ['geral.fase_atual']
    };
    const comCategoria = criarCenario({ categoriaAtual: categoria }).service;
    const individual = criarCenario().service;

    await assert.rejects(
        comCategoria.atualizar({
            titularId: 1,
            papel: 'principal',
            contatoId: 9,
            tipo: 'categoria',
            categoriaId: 3,
            versao
        }),
        { status: 422, codigo: 'TIPO_VINCULO_DESTINO_INVALIDO' }
    );
    await assert.rejects(
        individual.atualizar({
            titularId: 1,
            papel: 'principal',
            contatoId: 9,
            tipo: 'individual',
            permissoesIndividuais: ['geral.fase_atual'],
            versao
        }),
        { status: 422, codigo: 'TIPO_VINCULO_DESTINO_INVALIDO' }
    );
});

test('exige alteração real nas permissões copiadas da categoria', async () => {
    const { estado, service } = criarCenario({
        categoriaAtual: {
            id: 3,
            nome: 'Família',
            conjuntoDadosVisiveis: ['geral.fase_atual', 'saude.consultas']
        }
    });

    await assert.rejects(
        service.atualizar({
            titularId: 1,
            papel: 'principal',
            contatoId: 9,
            tipo: 'individual',
            permissoesIndividuais: ['geral.fase_atual', 'saude.consultas'],
            versao
        }),
        { status: 422, codigo: 'VINCULO_SEM_ALTERACAO' }
    );
    assert.equal(estado.atualizacoes.length, 0);
    assert.equal(estado.notificacoes.length, 0);
});

test('rejeita contato pendente e categoria de outra titular sem alterar dados', async () => {
    const pendente = criarCenario();
    pendente.atual.contatoId = null;
    pendente.atual.contato = null;
    await assert.rejects(
        pendente.service.atualizar({
            titularId: 1,
            papel: 'principal',
            contatoId: 9,
            tipo: 'categoria',
            categoriaId: 7,
            versao
        }),
        { status: 404, codigo: 'CONTATO_ATIVO_NAO_ENCONTRADO' }
    );

    const alheia = criarCenario({ categoriaDestino: null });
    await assert.rejects(
        alheia.service.atualizar({
            titularId: 1,
            papel: 'principal',
            contatoId: 9,
            tipo: 'categoria',
            categoriaId: 7,
            versao
        }),
        { status: 404, codigo: 'CATEGORIA_NAO_ENCONTRADA' }
    );
    assert.equal(alheia.estado.atualizacoes.length, 0);
});

test('detecta versão antiga e concorrência no instante da gravação', async () => {
    const antigo = criarCenario();
    await assert.rejects(
        antigo.service.atualizar({
            titularId: 1,
            papel: 'principal',
            contatoId: 9,
            tipo: 'categoria',
            categoriaId: 7,
            versao: new Date('2026-11-01T12:00:00.000Z')
        }),
        { status: 409, codigo: 'VINCULO_DESATUALIZADO' }
    );

    const concorrente = criarCenario({
        categoriaDestino: {
            id: 7,
            nome: 'Família',
            conjuntoDadosVisiveis: ['geral.fase_atual']
        },
        updateCount: 0
    });
    await assert.rejects(
        concorrente.service.atualizar({
            titularId: 1,
            papel: 'principal',
            contatoId: 9,
            tipo: 'categoria',
            categoriaId: 7,
            versao
        }),
        { status: 409, codigo: 'VINCULO_DESATUALIZADO' }
    );
    assert.equal(concorrente.estado.notificacoes.length, 0);
});
