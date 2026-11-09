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

test('montagem cobre opções e assinaturas opcionais', () => {
    const categoria = CATEGORIAS_POR_ID.get('sintomas_fisicos');
    const entrada = validarCategoriaPreenchida({
        categoriaId: categoria.id,
        opcoes: [categoria.opcoes[0].id]
    });
    const montada = montarCategorias([entrada])[0];
    assert.equal(montada.opcoes.create.length, 1);
    validarCategoriasAtivas([entrada], [], []);
    assert.ok(assinaturaNova(entrada));
    assert.ok(
        assinaturaAtual({
            categoriaId: entrada.categoriaId,
            opcoes: [{ opcaoId: categoria.opcoes[0].id }],
            valorEscalado: null,
            casasDecimais: null,
            valorDuracaoMinutos: null,
            valorTexto: null,
            medicaoTemperatura: null
        })
    );
    assert.equal(assinaturaCategorias([], assinaturaNova), '');
    const completa = {
        categoriaId: 'temperatura_basal',
        opcoes: [{ id: 'x' }],
        valorEscalado: 365,
        casasDecimais: 1,
        valorDuracaoMinutos: 10,
        valorTexto: 'x',
        medicaoTemperatura: { perturbada: true, motivoPerturbacao: 'sono' }
    };
    assert.ok(assinaturaNova(completa));
    assert.ok(
        assinaturaAtual({
            ...completa,
            opcoes: [{ opcaoId: 'x' }]
        })
    );
    const temperatura = validarCategoriaPreenchida({
        categoriaId: 'temperatura_basal',
        valor: '36.5',
        perturbada: true
    });
    assert.equal(montarCategorias([temperatura])[0].medicaoTemperatura.create.perturbada, true);
});

test('catálogo rejeita cada dependência ausente', () => {
    assert.throws(() => criarDiaryCatalogService(), TypeError);
    assert.throws(
        () => criarDiaryCatalogService({ prisma: { configuracaoDiario: {} } }),
        TypeError
    );
});

test('motor térmico rejeita datas, duplicatas e valores inválidos', () => {
    assert.throws(() => adicionarDias('2026-02-30', 0), TypeError);
    assert.throws(() => detectarPadraoTermico([{ data: 'x', valorDecimos: 360 }]), TypeError);
    assert.throws(
        () =>
            detectarPadraoTermico([
                { data: '2026-01-01', valorDecimos: 360 },
                { data: '2026-01-01', valorDecimos: 361 }
            ]),
        /duplicada/
    );
    assert.throws(
        () => detectarPadraoTermico([{ data: '2026-01-01', valorDecimos: 36.5 }]),
        /Valor térmico/
    );
});

test('recálculo térmico cobre entrada vazia, perturbação ausente e estados', async () => {
    const estados = [
        'ELEVACAO_DETECTADA',
        'NENHUMA_ELEVACAO_DETECTADA',
        'PADRAO_TERMICO_AMBIGUO',
        'DADOS_INSUFICIENTES'
    ];
    const gravados = [];
    const tx = {
        registroCiclo: { findMany: async () => [{ id: 1, dataInicio: new Date('2026-01-01Z') }] },
        registroDiario: {
            findMany: async () => [
                {
                    dataRegistro: new Date('2026-01-01Z'),
                    categorias: [{ valorEscalado: 360, medicaoTemperatura: null }]
                }
            ]
        },
        analiseTermicaCiclo: { upsert: async (valor) => gravados.push(valor) }
    };
    await criarThermalRecalculationService().recalcularPorDatas(1, [null, '', undefined], tx);
    assert.equal(gravados.length, 0);
    for (const estado of estados) {
        const service = criarThermalRecalculationService({
            detectar: () => ({ estado, janelasAvaliaveis: 0, sequencias: [] })
        });
        await service.recalcularPorDatas(1, ['2026-01-01', '2026-01-01'], tx);
    }
    assert.equal(gravados.length, 4);
});

test('serviços usam relógio padrão quando não é injetado', async () => {
    const categoria = validarCategoriaPreenchida({ categoriaId: 'anotacao_livre', texto: 'x' });
    const persistida = {
        id: 1,
        dataRegistro: new Date('2020-01-01Z'),
        faseCicloAssociada: null,
        versao: 0,
        criadoEm: new Date('2020-01-01Z'),
        atualizadoEm: new Date('2020-01-01Z'),
        categorias: []
    };
    const tx = {
        preferenciaMacrocategoriaDiario: { findMany: async () => [] },
        preferenciaCategoriaDiario: { findMany: async () => [] },
        registroDiario: {
            create: async () => persistida,
            findFirst: async () => persistida,
            update: async () => ({ ...persistida, categorias: [] })
        }
    };
    const deps = {
        prisma: { $transaction: async (callback) => callback(tx) },
        bootstrap: { garantir: async () => {} },
        phaseService: { resolver: async () => null },
        thermalRecalculation: { recalcularPorDatas: async () => {} }
    };
    const dados = { data: '2020-01-01', fusoHorario: 'UTC', categorias: [categoria] };
    assert.equal((await criarDiaryEntryService(deps).criar(1, dados)).id, 1);
    assert.equal((await criarDiaryEditService(deps).editar(1, 1, 0, dados)).id, 1);
});
