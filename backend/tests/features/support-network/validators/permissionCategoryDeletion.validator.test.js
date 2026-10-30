import test from 'node:test';
import assert from 'node:assert/strict';

import {
    ACOES_EXCLUSAO_CATEGORIA,
    criarPermissionCategoryDeletionValidator
} from '../../../../src/features/support-network/validators/permissionCategoryDeletion.validator.js';

const validator = criarPermissionCategoryDeletionValidator();
const VERSAO = '2026-10-26T12:00:00.000Z';

test('aceita a confirmação simples de uma categoria sem contatos ativos', () => {
    const resultado = validator.validarExclusaoCategoria({
        atualizadoEm: VERSAO,
        decisoes: []
    });

    assert.equal(resultado.valido, true);
    assert.deepEqual(resultado.dados, {
        atualizadoEm: new Date(VERSAO),
        decisoes: []
    });
});

test('aceita decisões explícitas de remoção e manutenção individual', () => {
    const resultado = validator.validarExclusaoCategoria({
        atualizadoEm: VERSAO,
        decisoes: [
            {
                vinculoId: 10,
                acao: ACOES_EXCLUSAO_CATEGORIA.removerAcesso
            },
            {
                vinculoId: 11,
                acao: ACOES_EXCLUSAO_CATEGORIA.manterAcessoIndividual
            }
        ]
    });

    assert.equal(resultado.valido, true);
    assert.deepEqual(resultado.dados.decisoes, [
        { vinculoId: 10, acao: 'remover_acesso' },
        { vinculoId: 11, acao: 'manter_acesso_individual' }
    ]);
});

test('rejeita corpo ausente, lista e objeto com protótipo modificado', () => {
    const corpoComPrototipo = {
        atualizadoEm: VERSAO,
        decisoes: []
    };

    Object.setPrototypeOf(corpoComPrototipo, { titularId: 999 });

    for (const body of [null, [], corpoComPrototipo]) {
        const resultado = validator.validarExclusaoCategoria(body);

        assert.equal(resultado.valido, false);
        assert.equal(resultado.erros[0].campo, 'dados');
    }
});

test('rejeita versão ausente, inválida ou não canônica', () => {
    for (const atualizadoEm of [undefined, null, 'data-invalida', '2026-10-26T12:00:00Z']) {
        const resultado = validator.validarExclusaoCategoria({
            atualizadoEm,
            decisoes: []
        });

        assert.equal(resultado.valido, false);
        assert.equal(resultado.erros[0].campo, 'atualizadoEm');
    }
});

test('exige uma coleção de decisões mesmo quando ela está vazia', () => {
    const resultado = validator.validarExclusaoCategoria({
        atualizadoEm: VERSAO
    });

    assert.equal(resultado.valido, false);
    assert.equal(resultado.erros[0].campo, 'decisoes');
});

test('rejeita vínculos inválidos, repetidos e ações desconhecidas', () => {
    const resultado = validator.validarExclusaoCategoria({
        atualizadoEm: VERSAO,
        decisoes: [
            { vinculoId: 0, acao: 'remover_acesso' },
            { vinculoId: 10, acao: 'remover_acesso' },
            { vinculoId: 10, acao: 'manter_acesso_individual' },
            { vinculoId: 12, acao: 'acao_desconhecida' }
        ]
    });

    assert.equal(resultado.valido, false);
    assert.deepEqual(
        resultado.erros.map((erro) => erro.campo),
        ['decisoes[0].vinculoId', 'decisoes[2].vinculoId', 'decisoes[3].acao']
    );
});

test('rejeita campos protegidos no corpo e nas decisões', () => {
    const resultado = validator.validarExclusaoCategoria({
        atualizadoEm: VERSAO,
        titularId: 999,
        decisoes: [
            {
                vinculoId: 10,
                acao: 'remover_acesso',
                permissoesIndividuais: ['saude.consultas']
            }
        ]
    });

    assert.equal(resultado.valido, false);
    assert.deepEqual(
        resultado.erros.map((erro) => erro.campo),
        ['dados', 'decisoes[0]']
    );
});

test('rejeita decisão nula, em lista ou com protótipo modificado', () => {
    const decisaoComPrototipo = {
        vinculoId: 10,
        acao: 'remover_acesso'
    };

    Object.setPrototypeOf(decisaoComPrototipo, { titularId: 999 });

    const resultado = validator.validarExclusaoCategoria({
        atualizadoEm: VERSAO,
        decisoes: [null, [], decisaoComPrototipo]
    });

    assert.equal(resultado.valido, false);
    assert.deepEqual(
        resultado.erros.map((erro) => erro.campo),
        ['decisoes[0]', 'decisoes[1]', 'decisoes[2]']
    );
});
