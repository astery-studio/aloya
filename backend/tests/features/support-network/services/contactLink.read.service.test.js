import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactLinkService } from '../../../../src/features/support-network/services/contactLink.service.js';

const atualizadoEm = new Date('2026-11-08T12:00:00.000Z');

function criarPrisma(vinculo, categorias = []) {
    const estado = { vinculo: null, categorias: [] };
    return {
        estado,
        prisma: {
            vinculoRedeApoio: {
                async findFirst(consulta) {
                    estado.vinculo = consulta;
                    return vinculo;
                }
            },
            categoriaPermissao: {
                async findMany(consulta) {
                    estado.categorias.push(consulta);
                    return categorias;
                }
            }
        }
    };
}

test('inicia permissões vazias e lista categorias para trocar o vínculo', async () => {
    const categoriaAtual = {
        id: 3,
        nome: 'Família',
        conjuntoDadosVisiveis: ['geral.fase_atual', 'saude.consultas']
    };
    const { prisma, estado } = criarPrisma(
        {
            id: 9,
            emailConvidado: 'ana@example.com',
            permissoesIndividuais: [],
            atualizadoEm,
            contato: { nome: 'Ana' },
            categoria: categoriaAtual
        },
        [
            categoriaAtual,
            {
                id: 4,
                nome: 'Profissional',
                conjuntoDadosVisiveis: ['geral.historico_ciclo']
            }
        ]
    );
    const service = criarContactLinkService({ prisma });

    const resultado = await service.consultar({
        titularId: 1,
        papel: 'principal',
        contatoId: 9
    });

    assert.deepEqual(estado.vinculo.where, { id: 9, titularId: 1, status: 'ativo' });
    assert.equal(estado.categorias.length, 1);
    assert.equal(resultado.vinculoAtual.tipo, 'categoria');
    assert.equal(resultado.proximoVinculo.tipo, 'individual');
    assert.deepEqual(resultado.proximoVinculo.permissoesPreenchidas, []);
    assert.deepEqual(
        resultado.proximoVinculo.categorias.map(({ nome }) => nome),
        ['Família', 'Profissional']
    );
    assert.equal(resultado.versao, atualizadoEm.toISOString());
});

test('lista categorias alfabeticamente para contato individual', async () => {
    const { prisma, estado } = criarPrisma(
        {
            id: 9,
            emailConvidado: 'ana@example.com',
            permissoesIndividuais: ['geral.fase_atual'],
            atualizadoEm,
            contato: { nome: 'Ana' },
            categoria: null
        },
        [
            { id: 2, nome: 'Zélia', conjuntoDadosVisiveis: ['saude.consultas'] },
            { id: 1, nome: 'Ágata', conjuntoDadosVisiveis: ['geral.fase_atual'] }
        ]
    );
    const service = criarContactLinkService({ prisma });

    const resultado = await service.consultar({
        titularId: 1,
        papel: 'principal',
        contatoId: 9
    });

    assert.equal(estado.categorias.length, 1);
    assert.deepEqual(
        resultado.proximoVinculo.categorias.map(({ nome }) => nome),
        ['Ágata', 'Zélia']
    );
    assert.equal(resultado.vinculoAtual.tipo, 'individual');
    assert.deepEqual(resultado.vinculoAtual.permissoes, ['geral.fase_atual']);
});

test('não permite consultar convite pendente, contato alheio ou vínculo sem contato', async () => {
    for (const vinculo of [null, { contato: null }]) {
        const { prisma } = criarPrisma(vinculo);
        const service = criarContactLinkService({ prisma });
        await assert.rejects(
            service.consultar({ titularId: 1, papel: 'principal', contatoId: 9 }),
            { status: 404, codigo: 'CONTATO_ATIVO_NAO_ENCONTRADO' }
        );
    }
});

test('bloqueia papel de contato antes de acessar o banco', async () => {
    let consultou = false;
    const service = criarContactLinkService({
        prisma: {
            vinculoRedeApoio: {
                async findFirst() {
                    consultou = true;
                }
            },
            categoriaPermissao: {
                async findMany() {
                    return [];
                }
            }
        }
    });

    await assert.rejects(
        service.consultar({ titularId: 2, papel: 'contato_apoio', contatoId: 9 }),
        { status: 403 }
    );
    assert.equal(consultou, false);
});
