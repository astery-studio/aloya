import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validarConsultaEmail,
    validarCriacaoConvite,
    validarRespostaConvite,
    validarTokenConvite
} from '../../../../src/features/support-network/validators/contactInvitation.validator.js';

const APARENCIA_VALIDA = Object.freeze({
    iconeId: 'lotus',
    corId: 'verde'
});

test('normaliza um e-mail válido antes da consulta', () => {
    const resultado = validarConsultaEmail({
        email: '  CONTATO@EXEMPLO.COM  '
    });

    assert.equal(resultado.valido, true);
    assert.equal(resultado.dados.email, 'contato@exemplo.com');
});

test('rejeita e-mail inválido com a mensagem da HU-028', () => {
    const resultado = validarConsultaEmail({
        email: 'email-invalido'
    });

    assert.equal(resultado.valido, false);

    assert.deepEqual(resultado.erros[0], {
        campo: 'email',
        mensagem: 'Informe um e-mail válido.'
    });
});

test('aceita convite associado a uma categoria e aparência', () => {
    const resultado = validarCriacaoConvite({
        email: 'contato@example.com',
        categoriaId: 7,
        ...APARENCIA_VALIDA
    });

    assert.equal(resultado.valido, true);
    assert.equal(resultado.dados.categoriaId, 7);
    assert.equal(resultado.dados.permissoesIndividuais, null);
    assert.equal(resultado.dados.iconeId, 'lotus');
    assert.equal(resultado.dados.corId, 'verde');
});

test('aceita e ordena permissões individuais sem repetições', () => {
    const resultado = validarCriacaoConvite({
        email: 'contato@example.com',
        permissoesIndividuais: ['saude.consultas', 'geral.fase_atual', 'saude.consultas'],
        ...APARENCIA_VALIDA
    });

    assert.equal(resultado.valido, true);

    assert.deepEqual(resultado.dados.permissoesIndividuais, [
        'geral.fase_atual',
        'saude.consultas'
    ]);
});

test('exige exatamente uma forma de definir as permissões', () => {
    for (const corpo of [
        {
            email: 'contato@example.com',
            ...APARENCIA_VALIDA
        },
        {
            email: 'contato@example.com',
            categoriaId: 1,
            permissoesIndividuais: ['geral.fase_atual'],
            ...APARENCIA_VALIDA
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

test('exige ícone e cor no novo convite', () => {
    const resultado = validarCriacaoConvite({
        email: 'contato@example.com',
        categoriaId: 1
    });

    assert.equal(resultado.valido, false);

    assert.deepEqual(
        resultado.erros.filter((item) => ['iconeId', 'corId'].includes(item.campo)),
        [
            {
                campo: 'iconeId',
                mensagem: 'Selecione um ícone válido para o contato.'
            },
            {
                campo: 'corId',
                mensagem: 'Selecione uma cor válida para o contato.'
            }
        ]
    );
});

test('rejeita identificadores de aparência desconhecidos', () => {
    const resultado = validarCriacaoConvite({
        email: 'contato@example.com',
        categoriaId: 1,
        iconeId: 'icone-inexistente',
        corId: '#C85A44'
    });

    assert.equal(resultado.valido, false);

    assert.equal(
        resultado.erros.some((item) => item.campo === 'iconeId'),
        true
    );

    assert.equal(
        resultado.erros.some((item) => item.campo === 'corId'),
        true
    );
});

test('não normaliza silenciosamente identificadores de aparência', () => {
    const resultado = validarCriacaoConvite({
        email: 'contato@example.com',
        categoriaId: 1,
        iconeId: ' LOTUS ',
        corId: 'Verde'
    });

    assert.equal(resultado.valido, false);
    assert.equal(resultado.dados.iconeId, null);
    assert.equal(resultado.dados.corId, null);
});

test('rejeita categoria, permissões e campos protegidos inválidos', () => {
    const resultado = validarCriacaoConvite({
        email: 'contato@example.com',
        categoriaId: 0,
        titularId: 99,
        ...APARENCIA_VALIDA
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

test('aceita somente token de convite no formato seguro', () => {
    const token = 'a'.repeat(43);

    assert.equal(validarTokenConvite(token).valido, true);
    assert.equal(validarTokenConvite('curto').valido, false);
    assert.equal(validarTokenConvite(`${token}!`).valido, false);
    assert.equal(validarTokenConvite(null).valido, false);
});

test('exige decisão explícita de aceitar ou recusar', () => {
    assert.deepEqual(
        validarRespostaConvite({
            acao: ' ACEITAR '
        }).dados,
        {
            acao: 'aceitar'
        }
    );

    assert.equal(
        validarRespostaConvite({
            acao: 'recusar'
        }).valido,
        true
    );

    for (const corpo of [
        {},
        { acao: 'talvez' },
        {
            acao: 'aceitar',
            usuarioId: 2
        },
        null
    ]) {
        assert.equal(validarRespostaConvite(corpo).valido, false);
    }
});
