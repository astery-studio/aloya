import test from 'node:test';
import assert from 'node:assert/strict';
import { criarCycleRemovalRepository } from '../../../../src/features/cycles/repositories/cycleRemoval.repository.js';

function montar({
    ciclo,
    ciclos = [],
    diaDelete = 1,
    cicloDelete = 1,
    updateCount = 1,
    quantidade = Array.isArray(ciclos) ? ciclos.length : 0
} = {}) {
    const chamadas = { dia: [], ciclo: [], update: [], previsao: 0 };
    const registroCiclo = {
        findFirst: async () => ciclo ?? null,
        findMany: async () => ciclos,
        deleteMany: async (args) => {
            chamadas.ciclo.push(args);
            return { count: cicloDelete };
        },
        updateMany: async (args) => {
            chamadas.update.push(args);
            return { count: updateCount };
        },
        update: async (args) => {
            chamadas.update.push(args);
        },
        count: async () => quantidade
    };
    const tx = {
        registroCiclo,
        diaMenstruacao: {
            deleteMany: async (args) => {
                chamadas.dia.push(args);
                return { count: diaDelete };
            }
        },
        previsao: {
            deleteMany: async () => {
                chamadas.previsao += 1;
            }
        }
    };
    const prisma = { ...tx, $transaction: async (callback) => callback(tx) };
    return { repository: criarCycleRemovalRepository({ prisma }), chamadas };
}

const dia1 = new Date('2026-10-01T00:00:00.000Z');
const dia2 = new Date('2026-10-02T00:00:00.000Z');
const cicloBase = {
    id: 10,
    dataFim: dia2,
    atualizadoEm: new Date('2026-10-03T00:00:00.000Z'),
    diasMenstruacao: [
        { id: 1, data: dia1 },
        { id: 2, data: dia2 }
    ]
};

test('remove o primeiro dia e recalcula início e duração do ciclo encerrado', async () => {
    const { repository, chamadas } = montar({
        ciclo: cicloBase,
        ciclos: [{ id: 10, dataInicio: dia2, duracaoCiclo: 28, ehCicloInicial: false }],
        quantidade: 1
    });
    const resultado = await repository.removerDia({ usuarioId: 4, cicloId: 10, data: dia1 });
    assert.deepEqual(resultado, { cicloRemovido: false, quantidadeCiclos: 1 });
    assert.equal(chamadas.update[0].data.dataInicio, dia2);
    assert.equal(chamadas.update[0].data.dataFim, dia2);
    assert.equal(chamadas.update[0].data.duracaoMenstruacao, 1);
    assert.equal(chamadas.previsao, 1);
});

test('remover um dia interno preserva o ciclo e conta somente os dias restantes', async () => {
    const dia3 = new Date('2026-10-03T00:00:00.000Z');
    const cicloComLacuna = {
        ...cicloBase,
        dataFim: dia3,
        diasMenstruacao: [
            { id: 1, data: dia1 },
            { id: 2, data: dia2 },
            { id: 3, data: dia3 }
        ]
    };
    const { repository, chamadas } = montar({
        ciclo: cicloComLacuna,
        ciclos: [{ id: 10, dataInicio: dia1, duracaoCiclo: null, ehCicloInicial: true }],
        quantidade: 1
    });

    const resultado = await repository.removerDia({
        usuarioId: 4,
        cicloId: 10,
        data: dia2
    });

    assert.deepEqual(resultado, { cicloRemovido: false, quantidadeCiclos: 1 });
    assert.equal(chamadas.update[0].data.dataInicio, dia1);
    assert.equal(chamadas.update[0].data.dataFim, dia3);
    assert.equal(chamadas.update[0].data.duracaoMenstruacao, 2);
});

test('remove o único dia, exclui ciclo e atualiza previsões mesmo sem histórico restante', async () => {
    const { repository, chamadas } = montar({
        ciclo: { ...cicloBase, diasMenstruacao: [{ id: 1, data: dia1 }] },
        cicloDelete: 1,
        quantidade: 0
    });
    assert.deepEqual(await repository.removerDia({ usuarioId: 4, cicloId: 10, data: dia1 }), {
        cicloRemovido: true,
        quantidadeCiclos: 0
    });
    assert.equal(chamadas.ciclo.length, 1);
    assert.equal(chamadas.dia.length, 0);
    assert.equal(chamadas.previsao, 1);
});

test('mantém data final e duração nulas em ciclo em andamento', async () => {
    const { repository, chamadas } = montar({
        ciclo: { ...cicloBase, dataFim: null },
        ciclos: [{ id: 10, dataInicio: dia2, duracaoCiclo: null, ehCicloInicial: true }],
        quantidade: 1
    });
    await repository.removerDia({ usuarioId: 4, cicloId: 10, data: dia1 });
    assert.equal(chamadas.update[0].data.dataFim, null);
    assert.equal(chamadas.update[0].data.duracaoMenstruacao, null);
});

test('recalcula flags e duração apenas quando os metadados mudaram', async () => {
    const ciclos = [
        { id: 1, dataInicio: dia1, duracaoCiclo: 20, ehCicloInicial: false },
        { id: 2, dataInicio: dia2, duracaoCiclo: 28, ehCicloInicial: true }
    ];
    const { repository, chamadas } = montar({ ciclo: cicloBase, ciclos, quantidade: 2 });
    await repository.excluirCiclo({ usuarioId: 1, cicloId: 10 });
    assert.equal(chamadas.update.filter((item) => item.data.duracaoCiclo !== undefined).length, 2);
});

test('não atualiza metadados idênticos e remove ciclo completo', async () => {
    const ciclos = [{ id: 1, dataInicio: dia1, duracaoCiclo: null, ehCicloInicial: true }];
    const { repository, chamadas } = montar({
        ciclo: { id: 10, atualizadoEm: cicloBase.atualizadoEm },
        ciclos,
        quantidade: 1
    });
    assert.deepEqual(await repository.excluirCiclo({ usuarioId: 1, cicloId: 10 }), {
        cicloRemovido: true,
        quantidadeCiclos: 1
    });
    assert.equal(chamadas.update.length, 0);
    assert.equal(chamadas.previsao, 1);
});

test('rejeita ciclo inexistente, dia ausente e lista de dias inválida', async () => {
    const ausente = montar();
    await assert.rejects(ausente.repository.excluirCiclo({ usuarioId: 1, cicloId: 1 }), {
        status: 404
    });
    await assert.rejects(ausente.repository.removerDia({ usuarioId: 1, cicloId: 1, data: dia1 }), {
        status: 404
    });
    const diasInvalidos = montar({ ciclo: { ...cicloBase, diasMenstruacao: null } });
    await assert.rejects(
        diasInvalidos.repository.removerDia({ usuarioId: 1, cicloId: 10, data: dia1 }),
        { status: 404 }
    );
    const diaInexistente = montar({ ciclo: cicloBase });
    await assert.rejects(
        diaInexistente.repository.removerDia({
            usuarioId: 1,
            cicloId: 10,
            data: new Date('2026-10-10')
        }),
        { status: 404 }
    );
});

test('detecta concorrência ao excluir ciclo, dia ou atualizar ciclo', async () => {
    const ciclo = montar({ ciclo: cicloBase, cicloDelete: 0 });
    await assert.rejects(ciclo.repository.excluirCiclo({ usuarioId: 1, cicloId: 10 }), {
        status: 409
    });
    const dia = montar({
        ciclo: { ...cicloBase, diasMenstruacao: [{ id: 1, data: dia1 }] },
        cicloDelete: 0
    });
    await assert.rejects(dia.repository.removerDia({ usuarioId: 1, cicloId: 10, data: dia1 }), {
        status: 409
    });
    const atualizar = montar({ ciclo: cicloBase, updateCount: 0 });
    await assert.rejects(
        atualizar.repository.removerDia({ usuarioId: 1, cicloId: 10, data: dia1 }),
        { status: 409 }
    );
    const deletarDia = montar({ ciclo: cicloBase, diaDelete: 0 });
    await assert.rejects(
        deletarDia.repository.removerDia({ usuarioId: 1, cicloId: 10, data: dia1 }),
        { status: 409 }
    );
});

test('valida prisma, retorno da listagem e contagem', async () => {
    assert.throws(() => criarCycleRemovalRepository(), TypeError);
    const base = montar({ ciclo: cicloBase });
    assert.throws(
        () =>
            criarCycleRemovalRepository({
                prisma: {
                    $transaction: async () => {},
                    registroCiclo: {},
                    diaMenstruacao: {},
                    previsao: {}
                }
            }),
        TypeError
    );
    const listaRuim = montar({ ciclo: cicloBase, ciclos: null });
    await assert.rejects(
        listaRuim.repository.excluirCiclo({ usuarioId: 1, cicloId: 10 }),
        TypeError
    );
    const contagemRuim = montar({ ciclo: cicloBase, quantidade: -1 });
    await assert.rejects(
        contagemRuim.repository.excluirCiclo({ usuarioId: 1, cicloId: 10 }),
        TypeError
    );
    assert.ok(base.repository);
});
