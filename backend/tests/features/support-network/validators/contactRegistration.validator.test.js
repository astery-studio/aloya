import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactRegistrationValidator } from '../../../../src/features/support-network/validators/contactRegistration.validator.js';

const validator = criarContactRegistrationValidator({
    now: () => new Date('2026-11-08T12:00:00.000Z')
});

test('normaliza cadastro simplificado válido do contato', () => {
    const resultado = validator.validar({
        nome: '  Maria da Silva  ',
        dataNascimento: '1995-02-28',
        senha: 'senha segura',
        confirmacaoSenha: 'senha segura'
    });

    assert.equal(resultado.valido, true);
    assert.equal(resultado.dados.nome, 'Maria da Silva');
    assert.equal(resultado.dados.dataNascimento.toISOString(), '1995-02-28T00:00:00.000Z');
    assert.equal('confirmacaoSenha' in resultado.dados, false);
});

test('rejeita data inexistente, futura e senhas diferentes', () => {
    for (const dataNascimento of ['2025-02-29', '2027-01-01', '08/11/2000']) {
        const resultado = validator.validar({
            nome: 'Maria Silva',
            dataNascimento,
            senha: 'senha segura',
            confirmacaoSenha: 'outra senha'
        });

        assert.equal(resultado.valido, false);
        assert.equal(resultado.erros.some((item) => item.campo === 'dataNascimento'), true);
        assert.equal(resultado.erros.some((item) => item.campo === 'confirmacaoSenha'), true);
    }
});

test('rejeita campos protegidos, nome e senha inválidos', () => {
    const resultado = validator.validar({
        nome: '<script>',
        dataNascimento: '2000-01-01',
        senha: 'curta',
        confirmacaoSenha: 'curta',
        email: 'trocar@email.com',
        papel: 'principal'
    });

    assert.equal(resultado.valido, false);
    assert.deepEqual(
        new Set(resultado.erros.map((item) => item.campo)),
        new Set(['dados', 'nome', 'senha'])
    );
});

test('rejeita corpo malformado e configuração inválida', () => {
    assert.equal(validator.validar(null).valido, false);
    assert.equal(validator.validar([]).valido, false);
    assert.throws(() => criarContactRegistrationValidator({ now: null }), TypeError);
});
