import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDiaryCatalogController } from '../../../../src/features/diary/controllers/diaryCatalog.controller.js';
import { criarDiaryEntryController } from '../../../../src/features/diary/controllers/diaryEntry.controller.js';
import {
    criarDiaryHistoryController,
    validarId
} from '../../../../src/features/diary/controllers/diaryHistory.controller.js';
import { criarDiaryMutationController } from '../../../../src/features/diary/controllers/diaryMutation.controller.js';

function resposta() {
    return {
        statusCode: null,
        corpo: null,
        headers: {},
        set(nome, valor) {
            this.headers[nome] = valor;
            return this;
        },
        status(codigo) {
            this.statusCode = codigo;
            return this;
        },
        json(corpo) {
            this.corpo = corpo;
            return this;
        },
        send() {
            return this;
        }
    };
}

test('controller do catálogo responde e encaminha falhas', async () => {
    const falha = new Error('falha');
    const erros = [];
    const next = (erro) => erros.push(erro);
    let falhar = false;
    const catalogController = criarDiaryCatalogController({
        catalogService: {
            buscar: async () => {
                if (falhar) throw falha;
                return { versao: 1 };
            }
        },
        preferencesService: {
            atualizar: async () => {},
            atualizarLote: async () => {}
        },
        validarLote: (corpo) => corpo
    });
    for (const [metodo, req] of [
        ['buscar', { usuario: { id: 1 } }],
        ['atualizarLote', { usuario: { id: 1 }, body: { versao: 0 } }],
        [
            'atualizarMacrocategoria',
            {
                usuario: { id: 1 },
                params: { id: 'energia_sono' },
                body: { versao: 0, ativa: false },
                validarPreferencia: (corpo) => corpo
            }
        ],
        [
            'atualizarCategoria',
            {
                usuario: { id: 1 },
                params: { id: 'energia' },
                body: { versao: 0, ativa: false },
                validarPreferencia: (corpo) => corpo
            }
        ]
    ]) {
        const res = resposta();
        await catalogController[metodo](req, res, next);
        assert.equal(res.statusCode, 200);
        falhar = true;
        await catalogController[metodo](req, resposta(), next);
        falhar = false;
    }

    assert.equal(erros.length, 4);
});

test('controllers de entrada e histórico respondem e encaminham falhas', async () => {
    const falha = new Error('falha');
    const erros = [];
    const next = (erro) => erros.push(erro);
    let falhar = false;
    const entryController = criarDiaryEntryController({
        service: {
            criar: async (_id, dados) => {
                if (falhar) throw falha;
                return { ...dados, versao: 2 };
            }
        },
        validarCriacao: (corpo) => corpo
    });
    const reqEntry = { usuario: { id: 1 }, body: { data: '2026-11-08' } };
    const resEntry = resposta();
    await entryController.criar(reqEntry, resEntry, next);
    assert.equal(resEntry.statusCode, 201);
    assert.equal(resEntry.headers.ETag, '"2"');
    falhar = true;
    await entryController.criar(reqEntry, resposta(), next);
    falhar = false;

    const historyController = criarDiaryHistoryController({
        historyService: {
            listar: async () => {
                if (falhar) throw falha;
                return { itens: [] };
            }
        },
        detailService: {
            buscar: async () => {
                if (falhar) throw falha;
                return { versao: 3 };
            }
        },
        validarHistorico: (query) => query
    });
    const reqHistory = { usuario: { id: 1 }, query: {}, params: { id: '1' } };
    assert.equal((await historyController.listar(reqHistory, resposta(), next)).statusCode, 200);
    const resDetail = resposta();
    await historyController.buscar(reqHistory, resDetail, next);
    assert.equal(resDetail.headers.ETag, '"3"');
    falhar = true;
    await historyController.listar(reqHistory, resposta(), next);
    await historyController.buscar(reqHistory, resposta(), next);

    assert.equal(erros.length, 3);
});

test('controller de mutação responde e encaminha falhas', async () => {
    const falha = new Error('falha');
    const erros = [];
    const next = (erro) => erros.push(erro);
    let falhar = false;
    const mutationController = criarDiaryMutationController({
        editService: {
            editar: async () => {
                if (falhar) throw falha;
                return { versao: 4 };
            }
        },
        deletionService: {
            excluir: async () => {
                if (falhar) throw falha;
            }
        },
        validarEdicao: (corpo) => corpo
    });
    const reqMutation = {
        usuario: { id: 1 },
        params: { id: '1' },
        headers: { 'if-match': '"0"' },
        body: {}
    };
    const resEdit = resposta();
    await mutationController.editar(reqMutation, resEdit, next);
    assert.equal(resEdit.headers.ETag, '"4"');
    assert.equal((await mutationController.excluir(reqMutation, resposta(), next)).statusCode, 204);
    falhar = true;
    await mutationController.editar(reqMutation, resposta(), next);
    await mutationController.excluir(reqMutation, resposta(), next);

    assert.equal(erros.length, 2);
});

test('controllers rejeitam configuração e identificadores inválidos', () => {
    assert.throws(() => criarDiaryEntryController(), TypeError);
    assert.throws(() => criarDiaryCatalogController(), TypeError);
    for (const valor of ['x', '0', '9007199254740992']) {
        assert.throws(() => validarId(valor), { codigo: 'REGISTRO_DIARIO_NAO_ENCONTRADO' });
    }
    assert.equal(validarId('42'), 42);
});
