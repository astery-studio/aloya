import assert from 'node:assert/strict';
import test from 'node:test';

import { validarCategoriaPreenchida } from '../../../../src/features/diary/validators/diaryCategory.validator.js';
import { criarDiaryDeletionService } from '../../../../src/features/diary/services/diaryDeletion.service.js';
import { criarDiaryDetailService } from '../../../../src/features/diary/services/diaryDetail.service.js';
import { criarDiaryEditService } from '../../../../src/features/diary/services/diaryEdit.service.js';
import { criarDiaryEntryService } from '../../../../src/features/diary/services/diaryEntry.service.js';
import { criarDiaryPreferencesService } from '../../../../src/features/diary/services/diaryPreferences.service.js';

const data = (texto) => new Date(`${texto}T00:00:00.000Z`);
const categoriaNova = () =>
    validarCategoriaPreenchida({ categoriaId: 'anotacao_livre', texto: 'Texto' });
const categoriaPersistida = (texto = 'Texto') => ({
    categoriaId: 'anotacao_livre',
    macrocategoriaNome: 'Saúde e acompanhamento',
    categoriaNome: 'Anotação livre',
    valorEscalado: null,
    casasDecimais: null,
    valorDuracaoMinutos: null,
    valorTexto: texto,
    medicaoTemperatura: null,
    opcoes: []
});
const registro = (texto = 'Texto') => ({
    id: 1,
    dataRegistro: data('2026-11-08'),
    faseCicloAssociada: 'lutea',
    versao: 0,
    criadoEm: data('2026-11-08'),
    atualizadoEm: data('2026-11-08'),
    categorias: [categoriaPersistida(texto)]
});

test('exclusão cobre configuração, ausência e conflitos do Prisma', async () => {
    assert.throws(() => criarDiaryDeletionService(), TypeError);
    const thermalRecalculation = { recalcularPorDatas: async () => {} };
    let comportamento = 'ausente';
    const prisma = {
        async $transaction(callback) {
            if (comportamento.startsWith('erro:')) {
                const erro = new Error('prisma');
                erro.code = comportamento.slice(5);
                throw erro;
            }
            return callback({
                registroDiario: {
                    findFirst: async () =>
                        comportamento === 'ausente'
                            ? null
                            : {
                                  id: 1,
                                  versao: comportamento === 'versao' ? 2 : 0,
                                  dataRegistro: data('2026-11-08')
                              },
                    delete: async () => {}
                }
            });
        }
    };
    const service = criarDiaryDeletionService({ prisma, thermalRecalculation });
    await assert.rejects(() => service.excluir(1, 1, 0), {
        codigo: 'REGISTRO_DIARIO_NAO_ENCONTRADO'
    });
    comportamento = 'versao';
    await assert.rejects(() => service.excluir(1, 1, 0), { codigo: 'CONFLITO_DIARIO' });
    for (const codigo of ['P2025', 'P2034']) {
        comportamento = `erro:${codigo}`;
        await assert.rejects(() => service.excluir(1, 1, 0), { codigo: 'CONFLITO_DIARIO' });
    }
    comportamento = 'erro:OUTRO';
    await assert.rejects(() => service.excluir(1, 1, 0), /prisma/);
});


