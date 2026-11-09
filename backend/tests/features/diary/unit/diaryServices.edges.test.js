import assert from 'node:assert/strict';
import test from 'node:test';

import { validarCategoriaPreenchida } from '../../../../src/features/diary/validators/diaryCategory.validator.js';
import { criarDiaryDeletionService } from '../../../../src/features/diary/services/diaryDeletion.service.js';
import { criarDiaryDetailService } from '../../../../src/features/diary/services/diaryDetail.service.js';
import { criarDiaryEditService } from '../../../../src/features/diary/services/diaryEdit.service.js';
import { criarDiaryEntryService } from '../../../../src/features/diary/services/diaryEntry.service.js';
import { criarDiaryPreferencesService } from '../../../../src/features/diary/services/diaryPreferences.service.js';

const data = (texto) => new Date(`${texto}T00:00:00.000Z`);
const categoriaNova = () =>
    validarCategoriaPreenchida({ categoriaId: 'anotacao_livre', texto: 'Texto' });
const categoriaPersistida = (texto = 'Texto') => ({
    categoriaId: 'anotacao_livre',
    macrocategoriaNome: 'Saúde e acompanhamento',
    categoriaNome: 'Anotação livre',
    valorEscalado: null,
    casasDecimais: null,
    valorDuracaoMinutos: null,
    valorTexto: texto,
    medicaoTemperatura: null,
    opcoes: []
});
const registro = (texto = 'Texto') => ({
    id: 1,
    dataRegistro: data('2026-11-08'),
    faseCicloAssociada: 'lutea',
    versao: 0,
    criadoEm: data('2026-11-08'),
    atualizadoEm: data('2026-11-08'),
    categorias: [categoriaPersistida(texto)]
});


