//Testa configuração, identidade e resposta segura do limite de remoções de anticoncepcionais.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarRemocaoAnticoncepcionalRateLimit } from '../../../../src/features/contraceptives/middleware/contraceptiveRateLimit.middleware.js';

//Cria o middleware falso e permite inspecionar as opções recebidas.
function criarRateLimitFalso() {
    let opcoesRecebidas = null;
    const middleware = () => {};

    return {
        middleware,

        rateLimit(opcoes) {
            opcoesRecebidas = opcoes;
            return middleware;
        },

        obterOpcoes() {
            return opcoesRecebidas;
        }
    };
}

//Cria uma resposta HTTP falsa para testar o bloqueio.
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

test('configura janela, limite e cabeçalhos seguros para remoção', () => {
    const falso = criarRateLimitFalso();

    const middleware = criarRemocaoAnticoncepcionalRateLimit({
        rateLimit: falso.rateLimit,
        janelaMs: 900000,
        limite: 5
    });

    const opcoes = falso.obterOpcoes();

    assert.equal(middleware, falso.middleware);
    assert.equal(opcoes.windowMs, 900000);
    assert.equal(opcoes.limit, 5);
    assert.equal(opcoes.standardHeaders, true);
    assert.equal(opcoes.legacyHeaders, false);
});

test('agrupa tentativas pela identidade autenticada', () => {
    const falso = criarRateLimitFalso();

    criarRemocaoAnticoncepcionalRateLimit({
        rateLimit: falso.rateLimit,
        janelaMs: 900000,
        limite: 5
    });

    const opcoes = falso.obterOpcoes();

    assert.equal(
        opcoes.keyGenerator({
            usuario: {
                id: 27
            }
        }),
        'usuario:27'
    );

    assert.equal(
        opcoes.keyGenerator({
            usuario: null
        }),
        'usuario:nao-autenticado'
    );
});

test('retorna erro controlado sem registrar dados sensíveis', () => {
    const falso = criarRateLimitFalso();
    const registros = [];

    criarRemocaoAnticoncepcionalRateLimit({
        rateLimit: falso.rateLimit,
        janelaMs: 900000,
        limite: 5,
        logger: {
            warn(registro) {
                registros.push(registro);
            }
        }
    });

    const opcoes = falso.obterOpcoes();
    const resposta = criarResposta();

    opcoes.handler({
        usuario: {
            id: 27
        },
        method: 'DELETE',
        params: {
            id: '99'
        },
        headers: {
            authorization: 'Bearer token-secreto'
        },
        body: {
            senha: 'segredo'
        }
    }, resposta);

    assert.equal(resposta.statusRecebido, 429);

    assert.deepEqual(resposta.corpoRecebido, {
        erro: {
            codigo: 'LIMITE_REMOCOES_ANTICONCEPCIONAL',
            mensagem: 'Muitas remoções em pouco tempo. Aguarde alguns minutos e tente novamente.'
        }
    });

    assert.deepEqual(registros, [
        {
            evento: 'limite_remocoes_anticoncepcional',
            usuarioId: 27,
            metodo: 'DELETE'
        }
    ]);

    assert.equal(JSON.stringify(registros).includes('token-secreto'), false);
    assert.equal(JSON.stringify(registros).includes('segredo'), false);
    assert.equal(JSON.stringify(registros).includes('99'), false);
});

test('rejeita configurações inválidas antes de iniciar o servidor', () => {
    assert.throws(
        () => criarRemocaoAnticoncepcionalRateLimit({
            rateLimit: null,
            janelaMs: 900000,
            limite: 5
        }),
        /criador/
    );

    assert.throws(
        () => criarRemocaoAnticoncepcionalRateLimit({
            rateLimit: () => {},
            janelaMs: 0,
            limite: 5
        }),
        /janela/
    );

    assert.throws(
        () => criarRemocaoAnticoncepcionalRateLimit({
            rateLimit: () => {},
            janelaMs: 900000,
            limite: 0
        }),
        /limite/
    );
});