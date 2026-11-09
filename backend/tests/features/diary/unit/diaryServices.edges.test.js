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


