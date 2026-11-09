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

test('valida formatos gerais de categorias rejeitados', () => {
    for (const entrada of [null, [], {}, { categoriaId: 1 }]) {
        erroCodigo(() => validarCategoriaPreenchida(entrada), 'CATEGORIA_DIARIO_INVALIDA');
    }
    erroCodigo(
        () => validarCategoriaPreenchida({ categoriaId: 'inexistente' }),
        'CATEGORIA_DIARIO_INVALIDA'
    );
    erroCodigo(
        () => validarCategoriaPreenchida({ categoriaId: 'peso', valor: '60', extra: true }),
        'CAMPO_DESCONHECIDO'
    );
    for (const opcoes of [null, [], new Array(100).fill('x')]) {
        erroCodigo(
            () => validarCategoriaPreenchida({ categoriaId: 'sintomas_fisicos', opcoes }),
            'OPCOES_DIARIO_INVALIDAS'
        );
    }
    const opcao = CATEGORIAS_POR_ID.get('sintomas_fisicos').opcoes[0].id;
    erroCodigo(
        () =>
            validarCategoriaPreenchida({ categoriaId: 'sintomas_fisicos', opcoes: [opcao, opcao] }),
        'OPCOES_DIARIO_INVALIDAS'
    );
    for (const duracaoMinutos of [1.5, -1]) {
        erroCodigo(
            () => validarCategoriaPreenchida({ categoriaId: 'tempo_sono', duracaoMinutos }),
            'DURACAO_DIARIO_INVALIDA'
        );
    }
});

test('valida temperaturas e valores decimais rejeitados', () => {
    for (const perturbada of ['sim', 1]) {
        erroCodigo(
            () =>
                validarCategoriaPreenchida({
                    categoriaId: 'temperatura_basal',
                    valor: '36.5',
                    perturbada
                }),
            'MEDICAO_TERMICA_INVALIDA'
        );
    }
    for (const motivoPerturbacao of ['', 'a'.repeat(201), 1]) {
        erroCodigo(
            () =>
                validarCategoriaPreenchida({
                    categoriaId: 'temperatura_basal',
                    valor: '36.5',
                    perturbada: true,
                    motivoPerturbacao
                }),
            'MEDICAO_TERMICA_INVALIDA'
        );
    }
    erroCodigo(
        () =>
            validarCategoriaPreenchida({
                categoriaId: 'temperatura_basal',
                valor: '36.5',
                perturbada: false,
                motivoPerturbacao: 'x'
            }),
        'MEDICAO_TERMICA_INVALIDA'
    );
    assert.equal(
        validarCategoriaPreenchida({ categoriaId: 'peso', valor: '60.0' }).valorEscalado,
        600
    );

    assert.deepEqual(normalizarDecimal('2'), { valorEscalado: 20, casasDecimais: 1 });
    assert.deepEqual(normalizarDecimal(-2.5), { valorEscalado: -25, casasDecimais: 1 });
    for (const valor of [Number.NaN, Number.POSITIVE_INFINITY]) {
        erroCodigo(() => normalizarDecimal(valor), 'VALOR_DECIMAL_INVALIDO');
    }
    erroCodigo(() => normalizarDecimal(Number.MAX_SAFE_INTEGER), 'VALOR_DECIMAL_INVALIDO');
});

test('valida formatos rejeitados de entrada e histórico', () => {
    for (const fuso of [null, '', 'a'.repeat(101)]) {
        erroCodigo(() => validarFusoHorario(fuso), 'FUSO_HORARIO_INVALIDO');
    }
    for (const corpo of [null, [], 'x']) {
        erroCodigo(() => validarCriacaoRegistro(corpo), 'REGISTRO_DIARIO_INVALIDO');
    }
    const base = { data: '2026-11-08', fusoHorario: 'UTC', categorias: [] };
    erroCodigo(() => validarCriacaoRegistro(base), 'CONTEUDO_DIARIO_OBRIGATORIO');
    erroCodigo(
        () =>
            validarCriacaoRegistro({
                ...base,
                categorias: new Array(CATEGORIAS_POR_ID.size + 1).fill({})
            }),
        'CONTEUDO_DIARIO_OBRIGATORIO'
    );

    for (const query of [null, [], { extra: 1 }]) {
        erroCodigo(() => validarHistorico(query), 'FILTRO_DIARIO_INVALIDO');
    }
    for (const query of [
        { categorias: '' },
        { categorias: 1 },
        { categorias: 'peso,peso' },
        { categorias: `${'peso,'.repeat(CATEGORIAS_POR_ID.size)}peso` },
        { fases: 'lutea,' },
        { dataInicio: 'x' },
        { dataFim: 'x' }
    ]) {
        assert.throws(() => validarHistorico(query));
    }
});

test('valida formatos rejeitados de preferências', () => {
    for (const corpo of [null, []]) {
        erroCodigo(() => validarAtualizacaoPreferencia(corpo), 'PREFERENCIA_INVALIDA');
    }
    for (const corpo of [
        null,
        [],
        { versao: 0, categorias: [], macrocategorias: [], extra: true }
    ]) {
        erroCodigo(() => validarLotePreferencias(corpo), 'PREFERENCIAS_INVALIDAS');
    }
    erroCodigo(
        () => validarLotePreferencias({ versao: -1, categorias: [{ id: 'peso', ativa: true }] }),
        'VERSAO_PREFERENCIAS_INVALIDA'
    );
    for (const itens of [null, new Array(CATEGORIAS_POR_ID.size + 1).fill({})]) {
        erroCodigo(
            () => validarLotePreferencias({ versao: 0, categorias: itens }),
            'PREFERENCIAS_INVALIDAS'
        );
    }
});


