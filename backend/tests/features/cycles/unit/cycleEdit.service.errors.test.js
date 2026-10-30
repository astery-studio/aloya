import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleEditService } from '../../../../src/features/cycles/services/cycleEdit.service.js';

const atual = {
    id: 2,
    dataInicio: new Date('2026-08-07Z'),
    dataFim: new Date('2026-08-11Z'),
    atualizadoEm: new Date('2026-09-01Z')
};

function criarService({ ciclo = atual, conflito = null, count = 1 } = {}) {
    let consultas = 0;
    const tx = {
        registroCiclo: {
            findFirst: async () => (consultas++ === 0 ? ciclo : conflito),
            updateMany: async () => ({ count })
        }
    };
    return criarCycleEditService({ prisma: { $transaction: (executar) => executar(tx) } });
}

test('rejeita edição de ciclo ausente', async () => {
    await assert.rejects(
        () => criarService({ ciclo: null }).editar({ usuarioId: 1, cicloId: 9, dados: {} }),
        { status: 404, codigo: 'CICLO_NAO_ENCONTRADO' }
    );
});

test('rejeita ordem inválida e edição sem alterações', async () => {
    await assert.rejects(
        () => criarService().editar({
            usuarioId: 1,
            cicloId: 2,
            dados: { dataInicio: new Date('2026-08-12Z') }
        }),
        { status: 422, codigo: 'ORDEM_DATAS_CICLO_INVALIDA' }
    );
    await assert.rejects(
        () => criarService().editar({ usuarioId: 1, cicloId: 2, dados: {} }),
        { status: 422, codigo: 'NENHUMA_ALTERACAO' }
    );
});

test('detalha conflito com ciclo em andamento', async () => {
    const conflito = { dataInicio: new Date('2026-08-01Z'), dataFim: null };
    await assert.rejects(
        () => criarService({ conflito }).editar({
            usuarioId: 1,
            cicloId: 2,
            dados: { dataFim: new Date('2026-08-10Z') }
        }),
        (erro) => erro.codigo === 'SOBREPOSICAO_CICLO'
            && erro.conflito.dataFim === null
            && /em andamento/.test(erro.message)
    );
});

test('detecta atualização concorrente', async () => {
    await assert.rejects(
        () => criarService({ count: 0 }).editar({
            usuarioId: 1,
            cicloId: 2,
            dados: { dataFim: new Date('2026-08-10Z') }
        }),
        { status: 409, codigo: 'CONFLITO_EDICAO_CICLO' }
    );
});
