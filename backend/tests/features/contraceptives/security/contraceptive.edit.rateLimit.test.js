//Testa configuração, identificação e resposta segura do limite de edições.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarEdicaoAnticoncepcionalRateLimit } from '../../../../src/features/contraceptives/contraceptiveRateLimit.middleware.js';

//Cria o middleware e captura a configuração entregue ao express-rate-limit.
function prepararRateLimit() {
    let configuracao;
    const avisos = [];

    const middleware = criarEdicaoAnticoncepcionalRateLimit({
        rateLimit: (opcoes) => {
            configuracao = opcoes;
            return function rateLimitTeste() {};
        },
        janelaMs: 900000,
        limite: 20,
        logger: {
            warn(aviso) {
                avisos.push(aviso);
            }
        }
    });

    return {
        middleware,
        avisos,
        obterConfiguracao: () => configuracao
    };
}

//Cria uma resposta HTTP falsa e registra o status e o corpo devolvidos.
function criarResposta() {
    const resultado = {
        status: null,
        corpo: null
    };

    return {
        resultado,

        status(codigo) {
            resultado.status = codigo;
            return this;
        },

        json(corpo) {
            resultado.corpo = corpo;
            return this;
        }
    };
}

test('configura janela, limite e cabeçalhos seguros', () => {
    const teste = prepararRateLimit();
    const configuracao = teste.obterConfiguracao();

    assert.equal(typeof teste.middleware, 'function');
    assert.equal(configuracao.windowMs, 900000);
    assert.equal(configuracao.limit, 20);
    assert.equal(configuracao.standardHeaders, true);
    assert.equal(configuracao.legacyHeaders, false);
    assert.equal(configuracao.skipSuccessfulRequests, undefined);
});

test('usa somente a identidade autenticada como chave', () => {
    const configuracao = prepararRateLimit().obterConfiguracao();

    assert.equal(configuracao.keyGenerator({usuario: {id: 17}, ip: '192.168.0.2'}), 'usuario:17');
    assert.equal(configuracao.keyGenerator({usuario: {id: 17}, ip: '192.168.0.3'}), 'usuario:17');
    assert.equal(configuracao.keyGenerator({usuario: {id: 18}, ip: '192.168.0.2'}), 'usuario:18');
    assert.equal(configuracao.keyGenerator({}), 'usuario:nao-autenticado');
});

test('retorna erro controlado sem registrar dados sensíveis', () => {
    const teste = prepararRateLimit();
    const configuracao = teste.obterConfiguracao();
    const resposta = criarResposta();

    configuracao.handler({
        usuario: {id: 17},
        method: 'PUT',
        params: {id: '9'},
        body: {
            nome: 'Dado privado',
            horarios: ['08:00']
        },
        headers: {
            authorization: 'Bearer token-nao-deve-ser-registrado'
        }
    }, resposta);

    assert.equal(resposta.resultado.status, 429);
    assert.deepEqual(resposta.resultado.corpo, {
        erro: {
            codigo: 'LIMITE_EDICOES_ANTICONCEPCIONAL',
            mensagem: 'Muitas alterações em pouco tempo. Aguarde alguns minutos e tente novamente.'
        }
    });

    assert.deepEqual(teste.avisos, [{
        evento: 'limite_edicoes_anticoncepcional',
        usuarioId: 17,
        metodo: 'PUT'
    }]);

    assert.equal(JSON.stringify(teste.avisos).includes('Dado privado'), false);
    assert.equal(JSON.stringify(teste.avisos).includes('token-nao-deve-ser-registrado'), false);
});

test('rejeita configuração inválida antes de iniciar o servidor', () => {
    assert.throws(
        () => criarEdicaoAnticoncepcionalRateLimit({
            rateLimit: null,
            janelaMs: 900000,
            limite: 20
        }),
        /criador do rate limit/
    );

    assert.throws(
        () => criarEdicaoAnticoncepcionalRateLimit({
            rateLimit: () => null,
            janelaMs: 0,
            limite: 20
        }),
        /janela/
    );

    assert.throws(
        () => criarEdicaoAnticoncepcionalRateLimit({
            rateLimit: () => null,
            janelaMs: 900000,
            limite: -1
        }),
        /limite de edições/
    );
});