import assert from 'node:assert/strict';
import test from 'node:test';

import { CATEGORIAS_POR_ID } from '../../../../src/features/diary/catalog/diaryCatalog.lookup.js';
import { criarDiaryRoutes } from '../../../../src/features/diary/routes/diary.routes.js';
import { criarDiaryCatalogService } from '../../../../src/features/diary/services/diaryCatalog.service.js';
import {
    assinaturaAtual,
    assinaturaCategorias,
    assinaturaNova
} from '../../../../src/features/diary/services/diaryEdit.rules.js';
import {
    montarCategorias,
    validarCategoriasAtivas
} from '../../../../src/features/diary/services/diaryEntry.data.js';
import { criarDiaryEditService } from '../../../../src/features/diary/services/diaryEdit.service.js';
import { criarDiaryEntryService } from '../../../../src/features/diary/services/diaryEntry.service.js';
import { adicionarDias } from '../../../../src/features/diary/thermal/thermal.dates.js';
import { detectarPadraoTermico } from '../../../../src/features/diary/thermal/thermal.engine.js';
import { criarThermalRecalculationService } from '../../../../src/features/diary/thermal/thermalRecalculation.service.js';
import { validarCategoriaPreenchida } from '../../../../src/features/diary/validators/diaryCategory.validator.js';
import { normalizarDecimal } from '../../../../src/features/diary/validators/diaryDecimal.validator.js';
import {
    validarCriacaoRegistro,
    validarFusoHorario
} from '../../../../src/features/diary/validators/diaryEntry.validator.js';
import { validarHistorico } from '../../../../src/features/diary/validators/diaryHistory.validator.js';
import { validarAtualizacaoPreferencia } from '../../../../src/features/diary/validators/diaryPreferences.validator.js';
import { validarLotePreferencias } from '../../../../src/features/diary/validators/diaryPreferencesBatch.validator.js';

function erroCodigo(funcao, codigo) {
    assert.throws(funcao, { codigo });
}

test('rotas cobrem falhas de configuração e executam os middlewares próprios', () => {
    assert.throws(() => criarDiaryRoutes(), TypeError);
    assert.throws(() => criarDiaryRoutes({ Router: () => ({}) }), TypeError);
    const usos = [];
    const router = {
        use: (funcao) => usos.push(funcao),
        get() {},
        post() {},
        patch() {},
        put() {},
        delete() {}
    };
    const validarPreferencia = () => {};
    criarDiaryRoutes({
        Router: () => router,
        autenticar: () => {},
        catalogController: {},
        entryController: {},
        historyController: {},
        mutationController: {},
        validarPreferencia,
        rateLimit: () => {}
    });
    const res = {
        headers: {},
        set(nome, valor) {
            this.headers[nome] = valor;
        }
    };
    let avancou = 0;
    usos[1]({}, res, () => (avancou += 1));
    const req = {};
    usos[2](req, {}, () => (avancou += 1));
    assert.equal(res.headers['Cache-Control'], 'private, no-store');
    assert.equal(req.validarPreferencia, validarPreferencia);
    assert.equal(avancou, 2);
});


