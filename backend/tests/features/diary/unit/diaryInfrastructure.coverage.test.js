import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDiaryCatalogBootstrap } from '../../../../src/features/diary/services/diaryCatalogBootstrap.service.js';
import { criarDiaryHistoryService } from '../../../../src/features/diary/services/diaryHistory.service.js';
import { criarWhereHistorico } from '../../../../src/features/diary/services/diaryHistory.query.js';
import { criarDiaryPhaseService } from '../../../../src/features/diary/services/diaryPhase.service.js';
import { codificarCursor } from '../../../../src/features/diary/utils/diaryCursor.js';

const data = (texto) => new Date(`${texto}T00:00:00.000Z`);

test('bootstrap sincroniza catálogo uma vez e permite tentar novamente após falha', async () => {
    assert.throws(() => criarDiaryCatalogBootstrap(), TypeError);
    const contagem = { transacoes: 0, macros: 0, categorias: 0, opcoes: 0 };
    let falhar = true;
    const prisma = {
        async $transaction(callback) {
            contagem.transacoes += 1;
            if (falhar) {
                falhar = false;
                throw new Error('temporária');
            }
            return callback({
                macrocategoriaDiario: { upsert: async () => (contagem.macros += 1) },
                categoriaDiario: { upsert: async () => (contagem.categorias += 1) },
                opcaoDiario: { upsert: async () => (contagem.opcoes += 1) }
            });
        }
    };
    const bootstrap = criarDiaryCatalogBootstrap({ prisma });
    await assert.rejects(() => bootstrap.garantir(), /temporária/);
    const primeira = bootstrap.garantir();
    const segunda = bootstrap.garantir();
    await Promise.all([primeira, segunda]);
    await bootstrap.garantir();
    assert.equal(contagem.transacoes, 2);
    assert.ok(contagem.macros > 0 && contagem.categorias > 0 && contagem.opcoes > 0);
});

test('where do histórico cobre todos os filtros, cursor e consulta vazia', () => {
    assert.deepEqual(
        criarWhereHistorico(
            1,
            { dataInicio: null, dataFim: null, categorias: [], fases: [] },
            null
        ),
        { usuarioId: 1 }
    );
    const where = criarWhereHistorico(
        1,
        {
            dataInicio: '2026-11-01',
            dataFim: '2026-11-08',
            categorias: ['peso'],
            fases: ['lutea']
        },
        { data: '2026-11-07', id: 8 }
    );
    assert.equal(where.AND.length, 4);
    assert.equal(where.AND[0].dataRegistro.gte.valueOf(), data('2026-11-01').valueOf());
    assert.equal(where.AND[0].dataRegistro.lt.valueOf(), data('2026-11-09').valueOf());
    assert.deepEqual(where.AND[1].categorias.some.categoriaId.in, ['peso']);
});


