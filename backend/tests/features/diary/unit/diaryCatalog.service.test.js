import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDiaryCatalogService } from '../../../../src/features/diary/services/diaryCatalog.service.js';

function criarPrisma({ versao = null, macros = [], categorias = [] } = {}) {
    return {
        configuracaoDiario: {
            findUnique: async () => (versao === null ? null : { versao })
        },
        preferenciaMacrocategoriaDiario: {
            findMany: async () => macros
        },
        preferenciaCategoriaDiario: {
            findMany: async () => categorias
        }
    };
}

test('primeiro acesso retorna todo o catálogo efetivamente ativo', async () => {
    const service = criarDiaryCatalogService({ prisma: criarPrisma() });
    const resultado = await service.buscar(7);

    assert.equal(resultado.versao, 0);
    assert.equal(resultado.macrocategorias.length, 6);
    assert.ok(resultado.macrocategorias.every(({ ativa }) => ativa));
    assert.ok(
        resultado.macrocategorias
            .flatMap(({ categorias }) => categorias)
            .every(({ ativaIndividual, ativaEfetiva }) => ativaIndividual && ativaEfetiva)
    );
});

test('macro inativa preserva o estado individual das categorias', async () => {
    const service = criarDiaryCatalogService({
        prisma: criarPrisma({
            versao: 3,
            macros: [{ macrocategoriaId: 'energia_sono', ativa: false }],
            categorias: [{ categoriaId: 'qualidade_sono', ativa: false }]
        })
    });
    const resultado = await service.buscar(7);
    const macro = resultado.macrocategorias.find(({ id }) => id === 'energia_sono');
    const energia = macro.categorias.find(({ id }) => id === 'energia');
    const qualidade = macro.categorias.find(({ id }) => id === 'qualidade_sono');

    assert.equal(resultado.versao, 3);
    assert.equal(energia.ativaIndividual, true);
    assert.equal(energia.ativaEfetiva, false);
    assert.equal(qualidade.ativaIndividual, false);
    assert.equal(qualidade.ativaEfetiva, false);
});

test('rejeita identidade de sessão inválida', async () => {
    const service = criarDiaryCatalogService({ prisma: criarPrisma() });

    await assert.rejects(() => service.buscar(0), { codigo: 'SESSAO_INVALIDA' });
});
