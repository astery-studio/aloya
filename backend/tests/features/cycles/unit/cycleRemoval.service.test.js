import test from 'node:test';
import assert from 'node:assert/strict';
import {
    criarCycleRemovalService,
    MENSAGEM_SUCESSO
} from '../../../../src/features/cycles/services/cycleRemoval.service.js';

function criarResultado(overrides = {}) {
    return { cicloRemovido: false, quantidadeCiclos: 2, ...overrides };
}

test('valida que o repositório implementa as duas operações', () => {
    assert.throws(() => criarCycleRemovalService(), /repositório de remoção/);
    assert.throws(
        () => criarCycleRemovalService({ repository: { removerDia() {} } }),
        /repositório de remoção/
    );
});

test('remove um dia com identificadores e data validados', async () => {
    let argumentosRecebidos;
    const service = criarCycleRemovalService({
        repository: {
            async removerDia(argumentos) {
                argumentosRecebidos = argumentos;
                return criarResultado();
            },
            async excluirCiclo() {
                return criarResultado();
            }
        }
    });

    const resultado = await service.removerDia({ usuarioId: 4, cicloId: '8', data: '2026-09-02' });

    assert.deepEqual(argumentosRecebidos, {
        usuarioId: 4,
        cicloId: 8,
        data: new Date('2026-09-02T00:00:00.000Z')
    });
    assert.deepEqual(resultado, {
        mensagem: MENSAGEM_SUCESSO,
        cicloRemovido: false,
        quantidadeCiclos: 2,
        possuiCiclos: true
    });
    assert.equal(Object.isFrozen(resultado), true);
});

test('exclui um ciclo completo e informa quando o histórico fica vazio', async () => {
    const service = criarCycleRemovalService({
        repository: {
            async removerDia() {
                return criarResultado();
            },
            async excluirCiclo() {
                return criarResultado({ cicloRemovido: true, quantidadeCiclos: 0 });
            }
        }
    });

    assert.deepEqual(await service.excluirCiclo({ usuarioId: 4, cicloId: 8 }), {
        mensagem: MENSAGEM_SUCESSO,
        cicloRemovido: true,
        quantidadeCiclos: 0,
        possuiCiclos: false
    });
});

test('rejeita respostas internas incompatíveis para ambas as operações', async () => {
    const service = criarCycleRemovalService({
        repository: {
            async removerDia() {
                return { cicloRemovido: false, quantidadeCiclos: -1 };
            },
            async excluirCiclo() {
                return null;
            }
        }
    });

    await assert.rejects(
        service.removerDia({ usuarioId: 4, cicloId: 8, data: '2026-09-02' }),
        /resultado da remoção/
    );
    await assert.rejects(
        service.excluirCiclo({ usuarioId: 4, cicloId: 8 }),
        /resultado da remoção/
    );
});

test('preserva falhas do repositório sem trocar sua identidade', async () => {
    const falha = new Error('Falha transacional.');
    const service = criarCycleRemovalService({
        repository: {
            async removerDia() {
                throw falha;
            },
            async excluirCiclo() {
                throw falha;
            }
        }
    });

    await assert.rejects(
        service.removerDia({ usuarioId: 4, cicloId: 8, data: '2026-09-02' }),
        (erro) => erro === falha
    );
    await assert.rejects(
        service.excluirCiclo({ usuarioId: 4, cicloId: 8 }),
        (erro) => erro === falha
    );
});
