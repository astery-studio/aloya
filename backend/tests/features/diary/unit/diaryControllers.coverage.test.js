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


