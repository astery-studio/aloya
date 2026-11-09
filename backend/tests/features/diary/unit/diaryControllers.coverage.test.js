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


