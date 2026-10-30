import test from 'node:test';
import assert from 'node:assert/strict';
import { criarCycleRemovalController } from '../../../../src/features/cycles/controllers/cycleRemoval.controller.js';
import { criarCycleRemovalRoutes } from '../../../../src/features/cycles/routes/cycleRemoval.routes.js';
import { criarCycleRemovalModule } from '../../../../src/features/cycles/cycleRemoval.module.js';
import { AppError } from '../../../../src/shared/errors/AppError.js';

function criarRes() {
    return {
        set: function (chave, valor) {
            this.header = [chave, valor];
            return this;
        },
        status: function (codigo) {
            this.codigo = codigo;
            return this;
        },
        json: function (corpo) {
            this.corpo = corpo;
            return this;
        }
    };
}

test('controller usa a conta autenticada e devolve sucesso sem cache', async () => {
    const resultado = { mensagem: 'ok' };
    const controller = criarCycleRemovalController({
        cycleRemovalService: {
            removerDia: async () => resultado,
            excluirCiclo: async () => resultado
        }
    });
    const res = criarRes();
    await controller.removerDia(
        { usuario: { id: 9 }, params: { cicloId: '3', data: '2026-10-01' } },
        res,
        assert.fail
    );
    assert.equal(res.codigo, 200);
    assert.deepEqual(res.header, ['Cache-Control', 'no-store']);
    assert.equal(res.corpo, resultado);
});

test('controller exclui ciclo completo e valida suas dependências', async () => {
    const controller = criarCycleRemovalController({
        cycleRemovalService: {
            removerDia: async () => ({}),
            excluirCiclo: async () => ({ cicloRemovido: true })
        }
    });
    const res = criarRes();
    await controller.excluirCiclo(
        { usuario: { id: 3 }, params: { cicloId: '8' } },
        res,
        assert.fail
    );
    assert.equal(res.corpo.cicloRemovido, true);
    assert.throws(() => criarCycleRemovalController(), TypeError);
});

test('controller converte falhas internas e preserva erros de domínio', async () => {
    const erroDominio = new AppError('ausente', 404, 'CICLO_NAO_ENCONTRADO');
    const controller = criarCycleRemovalController({
        cycleRemovalService: {
            removerDia: async () => {
                throw 'fail';
            },
            excluirCiclo: async () => {
                throw erroDominio;
            }
        }
    });
    const erros = [];
    await controller.removerDia({ usuario: { id: 1 }, params: {} }, criarRes(), (erro) =>
        erros.push(erro)
    );
    await controller.excluirCiclo({ usuario: { id: 1 }, params: {} }, criarRes(), (erro) =>
        erros.push(erro)
    );
    assert.equal(erros[0].status, 500);
    assert.equal(erros[0].codigo, 'ERRO_REMOCAO_CICLO');
    assert.equal(erros[1], erroDominio);
});

test('rotas autenticam antes das duas operações e validam dependências', () => {
    const chamadas = [];
    const router = {
        use: (...args) => chamadas.push(['use', ...args]),
        delete: (...args) => chamadas.push(['delete', ...args])
    };
    const Router = () => router;
    const autenticar = () => {};
    const controller = { removerDia: () => {}, excluirCiclo: () => {} };
    assert.equal(
        criarCycleRemovalRoutes({
            Router,
            authMiddleware: { autenticar },
            cycleRemovalController: controller
        }),
        router
    );
    assert.deepEqual(
        chamadas.map((item) => (item[0] === 'delete' ? item[1] : item[0])),
        ['use', '/history/:cicloId/days/:data', '/history/:cicloId']
    );
    assert.throws(() => criarCycleRemovalRoutes(), TypeError);
    assert.throws(() => criarCycleRemovalRoutes({ Router }), TypeError);
    assert.throws(
        () =>
            criarCycleRemovalRoutes({
                Router,
                authMiddleware: { autenticar },
                cycleRemovalController: {}
            }),
        TypeError
    );
});

test('módulo rejeita ciclo ausente usando o serviço composto', async () => {
    const tx = {
        registroCiclo: {
            findFirst: async () => null,
            findMany: async () => [],
            deleteMany: async () => ({ count: 1 }),
            update: async () => {},
            updateMany: async () => ({ count: 1 }),
            count: async () => 0
        },
        diaMenstruacao: { deleteMany: async () => ({ count: 1 }) },
        previsao: { deleteMany: async () => ({ count: 0 }) }
    };
    const prisma = {
        $transaction: async (callback) => callback(tx),
        registroCiclo: tx.registroCiclo,
        diaMenstruacao: tx.diaMenstruacao,
        previsao: tx.previsao
    };
    const modulo = criarCycleRemovalModule({ prisma });
    let erro;
    await modulo.controller.excluirCiclo(
        { usuario: { id: 1 }, params: { cicloId: '2' } },
        criarRes(),
        (capturado) => {
            erro = capturado;
        }
    );
    assert.equal(erro.status, 404);
});
