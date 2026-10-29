import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleEditService } from '../../../../src/features/cycles/services/cycleEdit.service.js';

test('remove o término sem fabricar dias ou recalcular ciclos já consistentes', async () => {
    const inicio = new Date('2026-08-07Z');
    let diasCriados;
    let atualizacoes = 0;
    let consultas = 0;
    const tx = {
        registroCiclo: {
            async findFirst() {
                if (consultas++ > 0) return null;
                return { id: 2, dataInicio: inicio, dataFim: new Date('2026-08-11Z'), atualizadoEm: new Date('2026-09-01Z') };
            },
            async updateMany() { return { count: 1 }; },
            async findMany() {
                return [
                    { id: 2, dataInicio: inicio, duracaoCiclo: null, ehCicloInicial: true },
                    { id: 3, dataInicio: new Date('2026-09-04Z'), duracaoCiclo: 28, ehCicloInicial: false }
                ];
            },
            async update() { atualizacoes += 1; },
            async findUnique() {
                return { id: 2, dataInicio: inicio, dataFim: null, duracaoMenstruacao: null, duracaoCiclo: null };
            }
        },
        diaMenstruacao: {
            async deleteMany() {},
            async createMany({ data }) { diasCriados = data; }
        },
        previsao: { async deleteMany() {} }
    };
    const service = criarCycleEditService({
        prisma: { $transaction: (executar) => executar(tx) }
    });

    const resultado = await service.editar({
        usuarioId: 1,
        cicloId: 2,
        dados: { dataFim: null }
    });

    assert.equal(diasCriados.length, 1);
    assert.equal(atualizacoes, 0);
    assert.deepEqual(resultado, {
        id: 2,
        dataInicio: '2026-08-07',
        dataFim: null,
        duracaoMenstruacao: null,
        duracaoCiclo: null
    });
});
