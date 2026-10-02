//Testa a resposta pública e a identidade usada pelo controller na remoção do anticoncepcional.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContraceptiveController } from '../../../../src/features/contraceptives/contraceptive.controller.js';

//Cria uma resposta HTTP falsa e registra o status e o corpo devolvidos.
function criarResposta() {
    return {
        statusRecebido: null,
        corpoRecebido: null,

        status(statusRecebido) {
            this.statusRecebido = statusRecebido;
            return this;
        },

        json(corpoRecebido) {
            this.corpoRecebido = corpoRecebido;
            return this;
        }
    };
}

test('remove usando somente a identidade da sessão e o id da URL', async () => {
    const chamadas = [];

    const service = {
        async remover(...argumentos) {
            chamadas.push(argumentos);

            return {
                id: 7
            };
        }
    };

    const controller = criarContraceptiveController(service);
    const resposta = criarResposta();
    let erroEncaminhado = null;

    await controller.remover({
        usuario: {
            id: 3
        },
        params: {
            id: '7'
        },
        body: {
            usuarioId: 99,
            id: 500,
            ativo: true
        }
    }, resposta, (erro) => {
        erroEncaminhado = erro;
    });

    assert.deepEqual(chamadas, [
        [
            3,
            '7'
        ]
    ]);

    assert.equal(erroEncaminhado, null);
    assert.equal(resposta.statusRecebido, 200);

    assert.deepEqual(resposta.corpoRecebido, {
        mensagem: 'Anticoncepcional removido com sucesso.'
    });
});

test('não informa sucesso quando o service rejeita a remoção', async () => {
    const falha = new Error('Falha simulada.');
    const service = {
        async remover() {
            throw falha;
        }
    };

    const controller = criarContraceptiveController(service);
    const resposta = criarResposta();
    let erroEncaminhado = null;

    await controller.remover({
        usuario: {
            id: 3
        },
        params: {
            id: '7'
        },
        body: {}
    }, resposta, (erro) => {
        erroEncaminhado = erro;
    });

    assert.equal(erroEncaminhado, falha);
    assert.equal(resposta.statusRecebido, null);
    assert.equal(resposta.corpoRecebido, null);
});

test('não exige nem utiliza dados enviados no corpo da requisição', async () => {
    let quantidadeArgumentos = null;

    const service = {
        async remover(...argumentos) {
            quantidadeArgumentos = argumentos.length;

            return {
                id: 7
            };
        }
    };

    const controller = criarContraceptiveController(service);
    const resposta = criarResposta();

    await controller.remover({
        usuario: {
            id: 3
        },
        params: {
            id: '7'
        }
    }, resposta, () => {});

    assert.equal(quantidadeArgumentos, 2);

    assert.deepEqual(resposta.corpoRecebido, {
        mensagem: 'Anticoncepcional removido com sucesso.'
    });
});