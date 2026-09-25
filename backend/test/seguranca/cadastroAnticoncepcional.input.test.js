import assert from 'node:assert/strict';
import test from 'node:test';
import { validarCadastroAnticoncepcional } from '../../src/features/contraceptives/contraceptive.validator.js';

const hoje = new Date('2026-09-24T12:00:00.000Z');
const entradaValida = {
    nome: 'Mercilon',
    tipo: 'pilula',
    frequenciaId: 'pilula_continuo',
    horarios: ['08:00']
};

function capturarErro(entrada) {
    try {
        validarCadastroAnticoncepcional(entrada, hoje);
        return null;
    } catch (erro) {
        return erro;
    }
}

test('limita o nome para impedir armazenamento abusivo', () => {
    const erro = capturarErro({ ...entradaValida, nome: 'A'.repeat(121) });

    assert.equal(erro?.status, 422);
    assert.equal(erro?.codigo, 'NOME_MUITO_LONGO');
});

test('limita a quantidade de horários mesmo para pílula diária', () => {
    const horarios = Array.from({ length: 25 }, (_, indice) =>
        `${String(indice % 24).padStart(2, '0')}:${String(indice).padStart(2, '0')}`
    );
    const erro = capturarErro({ ...entradaValida, horarios });

    assert.equal(erro?.status, 422);
    assert.equal(erro?.codigo, 'LIMITE_HORARIOS_EXCEDIDO');
});
