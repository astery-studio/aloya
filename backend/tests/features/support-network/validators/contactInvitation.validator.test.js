import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validarConsultaEmail,
    validarCriacaoConvite
} from '../../../../src/features/support-network/validators/contactInvitation.validator.js';

test('normaliza um e-mail válido antes da consulta', () => {
    const resultado = validarConsultaEmail({ email: '  CONTATO@EXEMPLO.COM  ' });

    assert.equal(resultado.valido, true);
    assert.equal(resultado.dados.email, 'contato@exemplo.com');
});

test('rejeita e-mail inválido com a mensagem da HU-028', () => {
    const resultado = validarConsultaEmail({ email: 'email-invalido' });

    assert.equal(resultado.valido, false);
    assert.deepEqual(resultado.erros[0], {
        campo: 'email',
        mensagem: 'Informe um e-mail válido.'
    });
});

test('aceita convite associado a uma categoria', () => {
    const resultado = validarCriacaoConvite({
        email: 'contato@example.com',
        categoriaId: 7
    });

    assert.equal(resultado.valido, true);
    assert.equal(resultado.dados.categoriaId, 7);
    assert.equal(resultado.dados.permissoesIndividuais, null);
});

test('aceita e ordena permissões individuais sem repetições', () => {
    const resultado = validarCriacaoConvite({
        email: 'contato@example.com',
        permissoesIndividuais: ['saude.consultas', 'geral.fase_atual', 'saude.consultas']
    });

    assert.equal(resultado.valido, true);
    assert.deepEqual(resultado.dados.permissoesIndividuais, [
        'geral.fase_atual',
        'saude.consultas'
    ]);
});

test('exige exatamente uma forma de definir as permissões', () => {
    for (const corpo of [
        { email: 'contato@example.com' },
        {
            email: 'contato@example.com',
            categoriaId: 1,
            permissoesIndividuais: ['geral.fase_atual']
        }
    ]) {
        const resultado = validarCriacaoConvite(corpo);
        assert.equal(resultado.valido, false);
        assert.equal(
            resultado.erros.some((item) => item.campo === 'permissao'),
            true
        );
    }
});

test('rejeita categoria, permissões e campos protegidos inválidos', () => {
    const resultado = validarCriacaoConvite({
        email: 'contato@example.com',
        categoriaId: 0,
        titularId: 99
    });

    assert.equal(resultado.valido, false);
    assert.equal(
        resultado.erros.some((item) => item.campo === 'categoriaId'),
        true
    );
    assert.equal(
        resultado.erros.some((item) => item.campo === 'dados'),
        true
    );
});

test('rejeita corpo malformado sem lançar erro interno', () => {
    for (const corpo of [null, [], 'texto']) {
        assert.equal(validarCriacaoConvite(corpo).valido, false);
    }
});
