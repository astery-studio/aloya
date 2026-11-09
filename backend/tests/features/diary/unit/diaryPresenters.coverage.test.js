import assert from 'node:assert/strict';
import test from 'node:test';

import { OPCOES_POR_ID } from '../../../../src/features/diary/catalog/diaryCatalog.lookup.js';
import {
    apresentarDecimal,
    apresentarDetalheRegistro
} from '../../../../src/features/diary/presenters/diaryEntry.presenter.js';
import { apresentarResumoRegistro } from '../../../../src/features/diary/presenters/diaryHistory.presenter.js';

const instante = new Date('2026-11-08T12:00:00.000Z');

function categoria(base) {
    return {
        categoriaId: 'anotacao_livre',
        macrocategoriaNome: 'Saúde',
        categoriaNome: 'Anotação livre',
        valorEscalado: null,
        casasDecimais: null,
        valorDuracaoMinutos: null,
        valorTexto: null,
        opcoes: [],
        ...base
    };
}


