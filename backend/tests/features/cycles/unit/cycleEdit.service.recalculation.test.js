import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleEditService } from '../../../../src/features/cycles/services/cycleEdit.service.js';

test('corrige metadados dos ciclos após mover uma menstruação', async () => {
    const atual = {
        id: 2,
        dataInicio: new Date('2026-08-07Z'),
        dataFim: new Date('2026-08-11Z'),
        atualizadoEm: new Date('2026-09-01Z')
    };
    const alteracoes = [];
    let consultas = 0;
    const tx = {
        registroCiclo: {
            findFirst: async () => (consultas++ === 0 ? atual : null),
            updateMany: async () => ({ count: 1 }),
            findMany: async () => [
                { id: 2, dataInicio: new Date('2026-08-06Z'), duracaoCiclo: 9, ehCicloInicial: false },
                { id: 3, dataInicio: new Date('2026-09-04Z'), duracaoCiclo: 30, ehCicloInicial: true }
            ],
            async update(dados) { alteracoes.push(dados); },
            async findUnique() {
                return {
                    id: 2,
                    dataInicio: new Date('2026-08-06Z'),
                    dataFim: new Date('2026-08-11Z'),
                    duracaoMenstruacao: 6,
                    duracaoCiclo: null
                };
            }
        },
        diaMenstruacao: { async deleteMany() {}, async createMany() {} },
        previsao: { async deleteMany() {} }
    };
    const service = criarCycleEditService({
        prisma: { $transaction: (executar) => executar(tx) }
    });

    const resultado = await service.editar({
        usuarioId: 1,
        cicloId: 2,
        dados: { dataInicio: new Date('2026-08-06Z') }
    });

    assert.deepEqual(alteracoes, [
        { where: { id: 2 }, data: { duracaoCiclo: null, ehCicloInicial: true } },
        { where: { id: 3 }, data: { duracaoCiclo: 29, ehCicloInicial: false } }
    ]);
    assert.equal(resultado.dataFim, '2026-08-11');
});
