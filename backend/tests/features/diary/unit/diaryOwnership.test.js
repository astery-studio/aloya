import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDiaryDeletionService } from '../../../../src/features/diary/services/diaryDeletion.service.js';
import { criarDiaryDetailService } from '../../../../src/features/diary/services/diaryDetail.service.js';

test('detalhe pesquisa registro pelo id e pela identidade da sessão', async () => {
    let consulta;
    const service = criarDiaryDetailService({
        prisma: {
            registroDiario: {
                async findFirst(argumentos) {
                    consulta = argumentos.where;
                    return null;
                }
            }
        }
    });

    await assert.rejects(() => service.buscar(7, 11), {
        status: 404,
        codigo: 'REGISTRO_DIARIO_NAO_ENCONTRADO'
    });
    assert.deepEqual(consulta, { id: 11, usuarioId: 7 });
});

test('exclusão usa proprietário e versão na leitura e na remoção', async () => {
    const consultas = [];
    const recalculos = [];
    const tx = {
        registroDiario: {
            async findFirst(argumentos) {
                consultas.push(argumentos.where);
                return {
                    id: 11,
                    versao: 3,
                    dataRegistro: new Date('2026-11-08T00:00:00.000Z')
                };
            },
            async delete(argumentos) {
                consultas.push(argumentos.where);
            }
        }
    };
    const service = criarDiaryDeletionService({
        prisma: { $transaction: async (operacao) => operacao(tx) },
        thermalRecalculation: {
            recalcularPorDatas: async (...argumentos) => recalculos.push(argumentos)
        }
    });

    await service.excluir(7, 11, 3);
    assert.deepEqual(consultas, [
        { id: 11, usuarioId: 7 },
        { id: 11, usuarioId: 7, versao: 3 }
    ]);
    assert.deepEqual(recalculos[0].slice(0, 2), [7, ['2026-11-08']]);
});

test('exclusão rejeita versão superada sem remover', async () => {
    let removeu = false;
    const tx = {
        registroDiario: {
            findFirst: async () => ({ id: 11, versao: 4 }),
            delete: async () => {
                removeu = true;
            }
        }
    };
    const service = criarDiaryDeletionService({
        prisma: { $transaction: async (operacao) => operacao(tx) },
        thermalRecalculation: { recalcularPorDatas: async () => undefined }
    });

    await assert.rejects(() => service.excluir(7, 11, 3), { codigo: 'CONFLITO_DIARIO' });
    assert.equal(removeu, false);
});
