import assert from 'node:assert/strict';
import test from 'node:test';
import { criarValidadorOrigem } from '../../src/app.js';

function validar(validador, origem) {
    return new Promise((resolve, reject) => {
        validador(origem, (erro, permitida) => erro ? reject(erro) : resolve(permitida));
    });
}

test('não libera a API autenticada para uma origem web arbitrária', async () => {
    const validarOrigem = criarValidadorOrigem('https://app.aloya.example');

    assert.equal(await validar(validarOrigem, 'https://maliciosa.example'), false);
});

test('libera somente origens configuradas e clientes nativos', async () => {
    const validarOrigem = criarValidadorOrigem(
        'https://app.aloya.example, https://admin.aloya.example'
    );

    assert.equal(await validar(validarOrigem, 'https://app.aloya.example'), true);
    assert.equal(await validar(validarOrigem, 'https://admin.aloya.example'), true);
    assert.equal(await validar(validarOrigem, undefined), true);
});
