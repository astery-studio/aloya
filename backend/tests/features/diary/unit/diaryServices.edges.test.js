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

test('exclusão cobre configuração, ausência e conflitos do Prisma', async () => {
    assert.throws(() => criarDiaryDeletionService(), TypeError);
    const thermalRecalculation = { recalcularPorDatas: async () => {} };
    let comportamento = 'ausente';
    const prisma = {
        async $transaction(callback) {
            if (comportamento.startsWith('erro:')) {
                const erro = new Error('prisma');
                erro.code = comportamento.slice(5);
                throw erro;
            }
            return callback({
                registroDiario: {
                    findFirst: async () =>
                        comportamento === 'ausente'
                            ? null
                            : {
                                  id: 1,
                                  versao: comportamento === 'versao' ? 2 : 0,
                                  dataRegistro: data('2026-11-08')
                              },
                    delete: async () => {}
                }
            });
        }
    };
    const service = criarDiaryDeletionService({ prisma, thermalRecalculation });
    await assert.rejects(() => service.excluir(1, 1, 0), {
        codigo: 'REGISTRO_DIARIO_NAO_ENCONTRADO'
    });
    comportamento = 'versao';
    await assert.rejects(() => service.excluir(1, 1, 0), { codigo: 'CONFLITO_DIARIO' });
    for (const codigo of ['P2025', 'P2034']) {
        comportamento = `erro:${codigo}`;
        await assert.rejects(() => service.excluir(1, 1, 0), { codigo: 'CONFLITO_DIARIO' });
    }
    comportamento = 'erro:OUTRO';
    await assert.rejects(() => service.excluir(1, 1, 0), /prisma/);
});

test('detalhe cobre configuração, ausência e apresentação', async () => {
    assert.throws(() => criarDiaryDetailService(), TypeError);
    let valor = null;
    const service = criarDiaryDetailService({
        prisma: { registroDiario: { findFirst: async () => valor } }
    });
    await assert.rejects(() => service.buscar(1, 1), { codigo: 'REGISTRO_DIARIO_NAO_ENCONTRADO' });
    valor = registro();
    assert.equal((await service.buscar(1, 1)).id, 1);
});

function dependenciasEntrada() {
    const tx = {
        preferenciaMacrocategoriaDiario: { findMany: async () => [] },
        preferenciaCategoriaDiario: { findMany: async () => [] },
        registroDiario: { create: async () => registro() }
    };
    return {
        prisma: { $transaction: async (callback) => callback(tx) },
        bootstrap: { garantir: async () => {} },
        phaseService: { resolver: async () => 'lutea' },
        thermalRecalculation: { recalcularPorDatas: async () => {} },
        agora: () => data('2026-11-08')
    };
}

test('criação cobre validações e todos os erros concorrentes', async () => {
    const base = dependenciasEntrada();
    for (const alteracao of [
        { prisma: null },
        { bootstrap: null },
        { phaseService: null },
        { thermalRecalculation: null }
    ]) {
        assert.throws(() => criarDiaryEntryService({ ...base, ...alteracao }), TypeError);
    }
    const dados = { data: '2026-11-08', fusoHorario: 'UTC', categorias: [categoriaNova()] };
    const service = criarDiaryEntryService(base);
    for (const id of [null, 0]) {
        await assert.rejects(() => service.criar(id, dados), { codigo: 'SESSAO_INVALIDA' });
    }
    await assert.rejects(() => service.criar(1, { ...dados, data: '2026-11-09' }), {
        codigo: 'DATA_REGISTRO_FUTURA'
    });
    for (const [codigo, esperado] of [
        ['P2002', 'REGISTRO_DIARIO_DUPLICADO'],
        ['P2034', 'CONFLITO_DIARIO']
    ]) {
        const deps = dependenciasEntrada();
        deps.prisma.$transaction = async () => {
            const erro = new Error(codigo);
            erro.code = codigo;
            throw erro;
        };
        await assert.rejects(() => criarDiaryEntryService(deps).criar(1, dados), {
            codigo: esperado
        });
    }
    const deps = dependenciasEntrada();
    deps.prisma.$transaction = async () => {
        throw new Error('outro');
    };
    await assert.rejects(() => criarDiaryEntryService(deps).criar(1, dados), /outro/);
});

function dependenciasEdicao() {
    const tx = {
        registroDiario: {
            findFirst: async () => registro(),
            update: async () => ({ ...registro(), versao: 1 })
        },
        preferenciaMacrocategoriaDiario: { findMany: async () => [] },
        preferenciaCategoriaDiario: { findMany: async () => [] }
    };
    return {
        tx,
        prisma: { $transaction: async (callback) => callback(tx) },
        bootstrap: { garantir: async () => {} },
        phaseService: { resolver: async () => 'folicular' },
        thermalRecalculation: { recalcularPorDatas: async () => {} },
        agora: () => data('2026-11-08')
    };
}

test('edição cobre configuração, ausência, versão e no-op', async () => {
    const base = dependenciasEdicao();
    for (const alteracao of [
        { prisma: null },
        { bootstrap: null },
        { phaseService: null },
        { thermalRecalculation: null }
    ]) {
        assert.throws(() => criarDiaryEditService({ ...base, ...alteracao }), TypeError);
    }
    const dados = { data: '2026-11-08', fusoHorario: 'UTC', categorias: [categoriaNova()] };
    await assert.rejects(
        () => criarDiaryEditService(base).editar(1, 1, 0, { ...dados, data: '2026-11-09' }),
        { codigo: 'DATA_REGISTRO_FUTURA' }
    );
    base.tx.registroDiario.findFirst = async () => null;
    await assert.rejects(() => criarDiaryEditService(base).editar(1, 1, 0, dados), {
        codigo: 'REGISTRO_DIARIO_NAO_ENCONTRADO'
    });
    base.tx.registroDiario.findFirst = async () => ({ ...registro(), versao: 2 });
    await assert.rejects(() => criarDiaryEditService(base).editar(1, 1, 0, dados), {
        codigo: 'CONFLITO_DIARIO'
    });
    base.tx.registroDiario.findFirst = async () => registro();
    assert.equal((await criarDiaryEditService(base).editar(1, 1, 0, dados)).versao, 0);
});

test('edição persiste alterações e trata erros Prisma', async () => {
    const base = dependenciasEdicao();
    const dados = { data: '2026-11-08', fusoHorario: 'UTC', categorias: [categoriaNova()] };
    const alterado = {
        ...dados,
        categorias: [validarCategoriaPreenchida({ categoriaId: 'anotacao_livre', texto: 'Novo' })]
    };
    assert.equal((await criarDiaryEditService(base).editar(1, 1, 0, alterado)).versao, 1);
    for (const [codigo, esperado] of [
        ['P2002', 'REGISTRO_DIARIO_DUPLICADO'],
        ['P2025', 'CONFLITO_DIARIO'],
        ['P2034', 'CONFLITO_DIARIO']
    ]) {
        const deps = dependenciasEdicao();
        deps.prisma.$transaction = async () => {
            const erro = new Error(codigo);
            erro.code = codigo;
            throw erro;
        };
        await assert.rejects(() => criarDiaryEditService(deps).editar(1, 1, 0, dados), {
            codigo: esperado
        });
    }
    const deps = dependenciasEdicao();
    deps.prisma.$transaction = async () => {
        throw new Error('outro');
    };
    await assert.rejects(() => criarDiaryEditService(deps).editar(1, 1, 0, dados), /outro/);
});

function dependenciasPreferencias() {
    const tx = {
        configuracaoDiario: { upsert: async () => {}, updateMany: async () => ({ count: 1 }) },
        preferenciaMacrocategoriaDiario: { upsert: async () => {} },
        preferenciaCategoriaDiario: { upsert: async () => {} }
    };
    return {
        tx,
        prisma: { $transaction: async (callback) => callback(tx) },
        bootstrap: { garantir: async () => {} }
    };
}

test('preferências cobrem configuração e operações individuais', async () => {
    assert.throws(() => criarDiaryPreferencesService(), TypeError);
    const deps = dependenciasPreferencias();
    const service = criarDiaryPreferencesService(deps);
    await assert.rejects(() => service.atualizar({ usuarioId: 0 }), { codigo: 'SESSAO_INVALIDA' });
    await assert.rejects(
        () => service.atualizar({ usuarioId: 1, tipo: 'x', id: 'x', ativa: true, versao: 0 }),
        TypeError
    );
    await assert.rejects(
        () =>
            service.atualizar({ usuarioId: 1, tipo: 'categoria', id: 'x', ativa: true, versao: 0 }),
        { codigo: 'ITEM_CATALOGO_NAO_ENCONTRADO' }
    );
    assert.equal(
        (
            await service.atualizar({
                usuarioId: 1,
                tipo: 'categoria',
                id: 'peso',
                ativa: false,
                versao: 0
            })
        ).versao,
        1
    );
    assert.equal(
        (
            await service.atualizar({
                usuarioId: 1,
                tipo: 'macrocategoria',
                id: 'energia_sono',
                ativa: true,
                versao: 1
            })
        ).versao,
        2
    );
});

test('preferências cobrem lote e sessão inválida', async () => {
    const deps = dependenciasPreferencias();
    const service = criarDiaryPreferencesService(deps);
    assert.equal(
        (
            await service.atualizarLote({
                usuarioId: 1,
                versao: 2,
                macrocategorias: [{ id: 'energia_sono', ativa: false }],
                categorias: [{ id: 'peso', ativa: false }]
            })
        ).versao,
        3
    );
    await assert.rejects(
        () =>
            service.atualizarLote({
                usuarioId: null,
                versao: 0,
                macrocategorias: [],
                categorias: []
            }),
        { codigo: 'SESSAO_INVALIDA' }
    );
});

test('preferências cobrem conflitos de versão e Prisma', async () => {
    const deps = dependenciasPreferencias();
    const service = criarDiaryPreferencesService(deps);
    deps.tx.configuracaoDiario.updateMany = async () => ({ count: 0 });
    await assert.rejects(
        () =>
            service.atualizar({
                usuarioId: 1,
                tipo: 'categoria',
                id: 'peso',
                ativa: true,
                versao: 0
            }),
        { codigo: 'CONFLITO_PREFERENCIAS' }
    );
    await assert.rejects(
        () =>
            service.atualizarLote({ usuarioId: 1, versao: 0, macrocategorias: [], categorias: [] }),
        { codigo: 'CONFLITO_PREFERENCIAS' }
    );
    for (const metodo of ['atualizar', 'atualizarLote']) {
        const base = dependenciasPreferencias();
        base.prisma.$transaction = async () => {
            const erro = new Error('concorrência');
            erro.code = 'P2034';
            throw erro;
        };
        const outro = criarDiaryPreferencesService(base);
        const argumentos =
            metodo === 'atualizar'
                ? { usuarioId: 1, tipo: 'categoria', id: 'peso', ativa: true, versao: 0 }
                : { usuarioId: 1, versao: 0, macrocategorias: [], categorias: [] };
        await assert.rejects(() => outro[metodo](argumentos), { codigo: 'CONFLITO_PREFERENCIAS' });
        base.prisma.$transaction = async () => {
            throw new Error('outro');
        };
        await assert.rejects(() => outro[metodo](argumentos), /outro/);
    }
});
