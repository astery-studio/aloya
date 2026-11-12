import assert from 'node:assert/strict';
import test from 'node:test';

import { criarDiaryOverviewController } from '../../../../src/features/diary/controllers/diaryOverview.controller.js';
import {
    compararDestaques,
    contarMarcadores,
    criarDiaryOverviewService
} from '../../../../src/features/diary/services/diaryOverview.service.js';
import { validarResumoDiario } from '../../../../src/features/diary/validators/diaryOverview.validator.js';

const categoria = (opcaoId, opcaoNome) => ({
    categoriaId: 'sintomas_fisicos',
    categoriaNome: 'Sintomas físicos',
    opcoes: [{ opcaoId, opcaoNome }]
});

function prismaCom(registros) {
    return {
        registroDiario: {
            count: async () => 7,
            findMany: async () => registros
        },
        preferenciaMacrocategoriaDiario: { findMany: async () => [] },
        preferenciaCategoriaDiario: { findMany: async () => [] }
    };
}

test('personaliza somente após padrão repetido em três registros da fase', async () => {
    const registros = [
        { categorias: [categoria('colica', 'Cólicas leves')] },
        { categorias: [categoria('colica', 'Cólicas leves')] },
        { categorias: [categoria('fadiga', 'Fadiga')] }
    ];
    const service = criarDiaryOverviewService({ prisma: prismaCom(registros) });
    const resumo = await service.buscar(3, 'folicular');

    assert.deepEqual(resumo, {
        fase: 'folicular',
        diasRegistrados: 7,
        quantidadeRegistrosFase: 3,
        informacoesSuficientes: true,
        destaques: [
            {
                categoriaId: 'sintomas_fisicos',
                grupo: null,
                valor: 'Cólicas leves',
                ocorrencias: 2
            }
        ]
    });
});

test('mantém fallback quando a amostra ou repetição é insuficiente', async () => {
    const service = criarDiaryOverviewService({
        prisma: prismaCom([
            { categorias: [categoria('colica', 'Cólicas leves')] },
            { categorias: [categoria('fadiga', 'Fadiga')] }
        ])
    });
    assert.equal((await service.buscar(3, 'lutea')).informacoesSuficientes, false);
});

test('deduplica marcadores no mesmo dia e ignora categorias não ativas', () => {
    const registros = [
        {
            categorias: [
                {
                    categoriaId: 'sintomas_fisicos',
                    categoriaNome: 'Sintomas físicos',
                    opcoes: [
                        { opcaoId: 'fadiga', opcaoNome: 'Fadiga' },
                        { opcaoId: 'fadiga', opcaoNome: 'Fadiga' }
                    ]
                },
                { categoriaId: 'pele', categoriaNome: 'Pele', opcoes: [] }
            ]
        }
    ];
    assert.deepEqual(contarMarcadores(registros, new Set(['sintomas_fisicos'])), [
        {
            chave: 'opcao:fadiga',
            categoriaId: 'sintomas_fisicos',
            grupo: null,
            valor: 'Fadiga',
            macroOrdem: 2,
            categoriaOrdem: 1,
            opcaoOrdem: 0,
            ocorrencias: 1
        }
    ]);
});

test('preserva o grupo da opção para gerar um resumo contextual', () => {
    const [marcador] = contarMarcadores(
        [
            {
                categorias: [
                    {
                        categoriaId: 'fluxo_menstrual',
                        categoriaNome: 'Fluxo menstrual',
                        opcoes: [
                            {
                                opcaoId: 'fluxo_menstrual_coagulos_grandes',
                                opcaoNome: 'Grandes'
                            }
                        ]
                    }
                ]
            }
        ],
        new Set(['fluxo_menstrual'])
    );

    assert.equal(marcador.grupo, 'coagulos');
});

test('agrega valores escalares e descarta marcadores ausentes ou sensíveis', () => {
    const registros = [
        {
            categorias: [
                { categoriaId: 'peso', categoriaNome: 'Peso', opcoes: [] },
                {
                    categoriaId: 'sintomas_fisicos',
                    categoriaNome: 'Sintomas físicos',
                    opcoes: [
                        {
                            opcaoId: 'sintomas_fisicos_sintomas_fadiga',
                            opcaoNome: 'Fadiga'
                        }
                    ]
                },
                { categoriaId: 'atividade_sexual', categoriaNome: 'Atividade sexual', opcoes: [] },
                { categoriaId: 'anotacao_livre', categoriaNome: 'Anotação livre', opcoes: [] },
                { categoriaId: 'inexistente', categoriaNome: 'Inexistente', opcoes: [] }
            ]
        }
    ];
    const marcadores = contarMarcadores(
        registros,
        new Set(['peso', 'sintomas_fisicos', 'atividade_sexual', 'anotacao_livre', 'inexistente'])
    );
    assert.deepEqual(
        marcadores.map(({ chave, valor, opcaoOrdem }) => ({ chave, valor, opcaoOrdem })),
        [
            { chave: 'categoria:peso', valor: 'Peso', opcaoOrdem: 0 },
            { chave: 'opcao:sintomas_fisicos_sintomas_fadiga', valor: 'Fadiga', opcaoOrdem: 12 }
        ]
    );
});

test('ordena destaques por recorrência e pela ordem estável do catálogo', () => {
    const base = {
        ocorrencias: 2,
        macroOrdem: 1,
        categoriaOrdem: 1,
        opcaoOrdem: 1,
        valor: 'B'
    };
    assert.ok(compararDestaques(base, { ...base, ocorrencias: 3 }) > 0);
    assert.ok(compararDestaques(base, { ...base, macroOrdem: 2 }) < 0);
    assert.ok(compararDestaques(base, { ...base, categoriaOrdem: 2 }) < 0);
    assert.ok(compararDestaques(base, { ...base, opcaoOrdem: 2 }) < 0);
    assert.ok(compararDestaques(base, { ...base, valor: 'C' }) < 0);
});

test('valida fase, sessão, configuração e controller', async () => {
    assert.deepEqual(validarResumoDiario({ fase: 'menstrual' }), { fase: 'menstrual' });
    for (const query of [
        undefined,
        null,
        [],
        {},
        { fase: 'inexistente' },
        { fase: 'lutea', extra: 1 }
    ]) {
        assert.throws(() => validarResumoDiario(query), { codigo: 'FASE_RESUMO_DIARIO_INVALIDA' });
    }
    assert.throws(() => criarDiaryOverviewService(), TypeError);
    assert.throws(
        () => criarDiaryOverviewService({ prisma: { registroDiario: { findMany() {} } } }),
        TypeError
    );
    assert.throws(
        () => criarDiaryOverviewService({ prisma: { registroDiario: { count() {} } } }),
        TypeError
    );
    assert.throws(() => criarDiaryOverviewController(), TypeError);
    assert.throws(() => criarDiaryOverviewController({ service: { buscar() {} } }), TypeError);
    const service = criarDiaryOverviewService({ prisma: prismaCom([]) });
    await assert.rejects(() => service.buscar(0, 'lutea'), { codigo: 'SESSAO_INVALIDA' });
    await assert.rejects(() => service.buscar(1.5, 'lutea'), { codigo: 'SESSAO_INVALIDA' });

    let falhar = false;
    const controller = criarDiaryOverviewController({
        validarResumo: validarResumoDiario,
        service: {
            buscar: async () => {
                if (falhar) throw new Error('falha');
                return { fase: 'lutea' };
            }
        }
    });
    const resposta = {
        status(codigo) {
            this.statusCode = codigo;
            return this;
        },
        json(corpo) {
            this.corpo = corpo;
            return this;
        }
    };
    const erros = [];
    await controller.buscar({ usuario: { id: 3 }, query: { fase: 'lutea' } }, resposta, (erro) =>
        erros.push(erro)
    );
    assert.equal(resposta.statusCode, 200);
    falhar = true;
    await controller.buscar({ usuario: { id: 3 }, query: { fase: 'lutea' } }, resposta, (erro) =>
        erros.push(erro)
    );
    assert.equal(erros.length, 1);
});
