import assert from 'node:assert/strict';
import test from 'node:test';

import {
    criarThermalRecalculationService,
    localizarCiclosAfetados
} from '../../../../src/features/diary/thermal/thermalRecalculation.service.js';

function data(dia) {
    return new Date(`${dia}T00:00:00.000Z`);
}

test('localiza ciclo pela data sem misturar o limite do ciclo seguinte', () => {
    const ciclos = [
        { id: 1, dataInicio: data('2026-01-01') },
        { id: 2, dataInicio: data('2026-02-01') }
    ];

    assert.deepEqual([...localizarCiclosAfetados(ciclos, ['2026-01-31'])], [1]);
    assert.deepEqual([...localizarCiclosAfetados(ciclos, ['2026-02-01'])], [2]);
    assert.deepEqual([...localizarCiclosAfetados(ciclos, ['2025-12-31'])], []);
});

test('recalcula ciclo afetado e persiste resultado versionado sem aplicar evidência', async () => {
    const gravacoes = [];
    let consultaRegistros;
    const valores = [364, 364, 364, 364, 364, 364, 366, 366, 366];
    const tx = {
        registroCiclo: {
            findMany: async () => [
                { id: 10, dataInicio: data('2026-01-01') },
                { id: 20, dataInicio: data('2026-02-01') }
            ]
        },
        registroDiario: {
            async findMany(consulta) {
                consultaRegistros = consulta;
                return valores.map((valorEscalado, indice) => ({
                    dataRegistro: data(`2026-01-${String(indice + 1).padStart(2, '0')}`),
                    categorias: [
                        {
                            valorEscalado,
                            medicaoTemperatura: { perturbada: false }
                        }
                    ]
                }));
            }
        },
        analiseTermicaCiclo: {
            async upsert(operacao) {
                gravacoes.push(operacao);
            }
        }
    };
    const service = criarThermalRecalculationService();

    await service.recalcularPorDatas(7, ['2026-01-08'], tx);

    assert.equal(consultaRegistros.where.usuarioId, 7);
    assert.equal(consultaRegistros.where.dataRegistro.gte.valueOf(), data('2026-01-01').valueOf());
    assert.equal(consultaRegistros.where.dataRegistro.lt.valueOf(), data('2026-02-01').valueOf());
    assert.equal(gravacoes.length, 8);
    assert.equal(gravacoes[0].create.estado, 'elevacao_detectada');
    assert.equal(gravacoes[0].create.evidenciaAplicada, false);
    assert.equal(gravacoes[0].create.provisorio, false);
    assert.equal(gravacoes[0].create.versaoAlgoritmo, '0.5.0-experimental');
    await criarThermalRecalculationService({ execucaoHabilitada: false }).recalcularPorDatas(
        7, ['2026-01-08'], tx
    );
    assert.equal(gravacoes.length, 8);
});

test('recalcula todos os ciclos quando uma fronteira menstrual muda', async () => {
    const gravacoes = [];
    const ciclos = [
        { id: 10, dataInicio: data('2026-01-01') },
        { id: 20, dataInicio: data('2026-02-01') }
    ];
    const tx = {
        registroCiclo: {
            async findMany(consulta) {
                return consulta.select.id
                    ? ciclos
                    : ciclos.map(({ dataInicio }) => ({ dataInicio }));
            }
        },
        registroDiario: { findMany: async () => [] },
        analiseTermicaCiclo: {
            async upsert(operacao) {
                gravacoes.push(operacao);
            }
        }
    };
    const service = criarThermalRecalculationService();

    await service.recalcularTodos(7, tx);

    assert.equal(gravacoes.length, 14);
    assert.ok(gravacoes.slice(0, 8).every(({ create }) => create.registroCicloId === 10));
    assert.ok(gravacoes.slice(8).every(({ create }) => create.registroCicloId === 20));
    assert.ok(gravacoes.slice(0, 8).every(({ create }) => create.provisorio === false));
    assert.ok(gravacoes.slice(8).every(({ create }) => create.provisorio === true));
});
