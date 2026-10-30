import assert from 'node:assert/strict';
import test from 'node:test';

import { comApi } from './cycleParameters.api.helper.js';

const autorizacao = {
    authorization: 'Bearer token',
    'content-type': 'application/json'
};

test('protege e apresenta os parâmetros padrão do ciclo', async () =>
    comApi(async ({ url }) => {
        assert.equal((await fetch(url)).status, 401);

        const resposta = await fetch(url, { headers: autorizacao });
        assert.equal(resposta.status, 200);
        assert.deepEqual((await resposta.json()).parametros, {
            duracaoCicloInformada: 28,
            duracaoMenstruacaoInformada: 5,
            duracaoLuteaInformada: 14
        });
    }));

test('valida a RN-010 pela API', async () =>
    comApi(async ({ url }) => {
        const resposta = await fetch(url, {
            method: 'PATCH',
            headers: autorizacao,
            body: JSON.stringify({
                duracaoCicloInformada: 28,
                duracaoMenstruacaoInformada: 28,
                duracaoLuteaInformada: 14
            })
        });
        const corpo = await resposta.json();

        assert.equal(resposta.status, 422);
        assert.equal(
            corpo.erro.detalhes[0].mensagem,
            'A duração da menstruação deve ser menor que a duração do ciclo.'
        );
    }));

test('atualiza os parâmetros e recalcula as previsões', async () =>
    comApi(async ({ url, estado }) => {
        const resposta = await fetch(url, {
            method: 'PATCH',
            headers: autorizacao,
            body: JSON.stringify({
                duracaoCicloInformada: 30,
                duracaoMenstruacaoInformada: 6,
                duracaoLuteaInformada: 13
            })
        });
        const corpo = await resposta.json();

        assert.equal(resposta.status, 200);
        assert.equal(corpo.mensagem, 'Parâmetros atualizados com sucesso.');
        assert.equal(corpo.parametros.duracaoCicloInformada, 30);
        assert.equal(estado.recalculos, 1);
    }));
