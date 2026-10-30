import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleParametersValidator } from '../../../../src/features/settings/validators/cycleParameters.validator.js';

const validator = criarCycleParametersValidator();
const validos = {
    duracaoCicloInformada: 28,
    duracaoMenstruacaoInformada: 5,
    duracaoLuteaInformada: 14
};

test('aceita os três parâmetros inteiros e positivos', () => {
    assert.deepEqual(validator.validar(validos), {
        valido: true,
        erros: [],
        dados: validos
    });
});

test('rejeita campos ausentes, desconhecidos ou não inteiros', () => {
    for (const body of [null, [], 'parâmetros']) {
        const resultado = validator.validar(body);
        assert.equal(resultado.valido, false);
        assert.equal(resultado.erros[0].campo, 'dados');
    }
    const resultado = validator.validar({
        ...validos,
        duracaoLuteaInformada: 12.5,
        usuarioId: 9
    });

    assert.equal(resultado.valido, false);
    assert.deepEqual(
        resultado.erros.map(({ campo }) => campo),
        ['dados', 'duracaoLuteaInformada']
    );
});

test('impede menstruação maior ou igual ao ciclo', () => {
    const resultado = validator.validar({
        ...validos,
        duracaoMenstruacaoInformada: 28
    });

    assert.equal(
        resultado.erros.at(-1).mensagem,
        'A duração da menstruação deve ser menor que a duração do ciclo.'
    );
});

test('aplica o limite calculado da fase lútea', () => {
    const resultado = validator.validar({
        ...validos,
        duracaoCicloInformada: 20
    });

    assert.equal(resultado.erros.at(-1).campo, 'duracaoLuteaInformada');
    assert.equal(
        resultado.erros.at(-1).mensagem,
        'A duração da fase lútea informada não é compatível com o ciclo. Ajuste os valores.'
    );
});
