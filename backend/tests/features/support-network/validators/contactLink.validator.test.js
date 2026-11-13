import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactLinkValidator } from '../../../../src/features/support-network/validators/contactLink.validator.js';

const validator = criarContactLinkValidator();
const versao = '2026-11-08T12:00:00.000Z';

test('aceita categoria com identificador positivo e versão canônica', () => {
    assert.deepEqual(validator.validarAtualizacao({ tipo: 'categoria', categoriaId: 3, versao }), {
        valido: true,
        dados: {
            tipo: 'categoria',
            categoriaId: 3,
            permissoesIndividuais: null,
            versao: new Date(versao)
        }
    });
});

test('aceita permissões individuais e as normaliza pelo catálogo', () => {
    const resultado = validator.validarAtualizacao({
        tipo: 'individual',
        permissoesIndividuais: ['saude.consultas', 'geral.fase_atual', 'saude.consultas'],
        versao
    });

    assert.equal(resultado.valido, true);
    assert.deepEqual(resultado.dados.permissoesIndividuais, [
        'geral.fase_atual',
        'saude.consultas'
    ]);
});

test('aceita ícone e cor válidos quando enviados juntos', () => {
    const resultado = validator.validarAtualizacao({
        tipo: 'categoria',
        categoriaId: 3,
        iconeId: 'sol',
        corId: 'azul',
        versao
    });

    assert.equal(resultado.valido, true);
    assert.equal(resultado.dados.iconeId, 'sol');
    assert.equal(resultado.dados.corId, 'azul');
});

test('rejeita aparência parcial ou fora do catálogo', () => {
    for (const body of [
        { tipo: 'categoria', categoriaId: 3, iconeId: 'sol', versao },
        { tipo: 'categoria', categoriaId: 3, corId: 'azul', versao },
        {
            tipo: 'categoria',
            categoriaId: 3,
            iconeId: 'desconhecido',
            corId: 'azul',
            versao
        },
        { tipo: 'categoria', categoriaId: 3, iconeId: 'sol', corId: '#4A758E', versao }
    ]) {
        assert.equal(validator.validarAtualizacao(body).valido, false);
    }
});

test('exige exatamente os dados compatíveis com o tipo escolhido', () => {
    const categoria = validator.validarAtualizacao({
        tipo: 'categoria',
        categoriaId: 1,
        permissoesIndividuais: ['geral.fase_atual'],
        versao
    });
    const individual = validator.validarAtualizacao({
        tipo: 'individual',
        categoriaId: 1,
        permissoesIndividuais: ['geral.fase_atual'],
        versao
    });

    assert.equal(categoria.valido, false);
    assert.equal(individual.valido, false);
});

test('rejeita tipo, categoria, permissões e versão inválidos', () => {
    const casos = [
        { tipo: 'outro', versao },
        { tipo: 'categoria', categoriaId: 0, versao },
        { tipo: 'individual', permissoesIndividuais: [], versao },
        { tipo: 'individual', permissoesIndividuais: ['segredo.admin'], versao },
        { tipo: 'categoria', categoriaId: 1, versao: '08/11/2026' }
    ];

    for (const body of casos) assert.equal(validator.validarAtualizacao(body).valido, false);
});

test('rejeita corpo malformado, campos internos e prototype pollution', () => {
    for (const body of [null, [], 'texto']) {
        assert.equal(validator.validarAtualizacao(body).valido, false);
    }

    const protegido = validator.validarAtualizacao({
        tipo: 'categoria',
        categoriaId: 1,
        titularId: 99,
        versao
    });
    assert.equal(protegido.valido, false);
    assert.equal(
        protegido.erros.some(({ campo }) => campo === 'titularId'),
        true
    );

    const poluido = Object.create({ administrador: true });
    poluido.tipo = 'categoria';
    poluido.categoriaId = 1;
    poluido.versao = versao;
    assert.equal(validator.validarAtualizacao(poluido).valido, false);
});
