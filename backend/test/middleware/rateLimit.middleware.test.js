/**
 * Testes de configuração, resposta e registro seguro do limitador.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarCadastroRateLimit,
    criarEmailRateLimit,
    criarLoginRateLimit
} from '../../src/middlewares/rateLimit.middleware.js';

function criarDependencias() {
    const chamadas = {
        configuracoes: [],
        logs: []
    };

    function rateLimit(configuracoes) {
        chamadas.configuracoes.push(configuracoes);

        return {
            tipo: 'middleware-rate-limit',
            configuracoes
        };
    }

    const logger = {
        warn(conteudo) {
            chamadas.logs.push(conteudo);
        }
    };

    return {
        rateLimit,
        logger,
        chamadas
    };
}

function criarResposta() {
    return {
        statusCode: null,
        body: null,

        status(codigo) {
            this.statusCode = codigo;

            return this;
        },

        json(conteudo) {
            this.body = conteudo;

            return this;
        }
    };
}

test(
    'configura o limite de login com os valores recebidos',
    () => {
        const {
            rateLimit,
            logger,
            chamadas
        } = criarDependencias();

        const middleware = criarLoginRateLimit({
            rateLimit,
            janelaMs: 900000,
            limite: 5,
            logger
        });

        assert.equal(
            middleware.tipo,
            'middleware-rate-limit'
        );

        assert.equal(
            chamadas.configuracoes.length,
            1
        );

        const configuracoes =
            chamadas.configuracoes[0];

        assert.equal(
            configuracoes.windowMs,
            900000
        );

        assert.equal(configuracoes.limit, 5);
        assert.equal(
            configuracoes.standardHeaders,
            true
        );

        assert.equal(
            configuracoes.legacyHeaders,
            false
        );

        assert.equal(
            configuracoes.skipSuccessfulRequests,
            true
        );

        assert.equal(
            typeof configuracoes.handler,
            'function'
        );
    }
);

test(
    'retorna resposta segura ao exceder o limite de login',
    () => {
        const {
            rateLimit,
            logger,
            chamadas
        } = criarDependencias();

        criarLoginRateLimit({
            rateLimit,
            janelaMs: 900000,
            limite: 5,
            logger
        });

        const configuracoes =
            chamadas.configuracoes[0];

        const req = {
            method: 'POST',
            originalUrl: '/auth/login'
        };

        const res = criarResposta();

        configuracoes.handler(req, res);

        assert.equal(res.statusCode, 429);

        assert.deepEqual(res.body, {
            erro: {
                codigo:
                    'LIMITE_TENTATIVAS_LOGIN',
                mensagem:
                    'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'
            }
        });
    }
);

test(
    'registra o bloqueio sem incluir credenciais ou dados sensíveis',
    () => {
        const {
            rateLimit,
            logger,
            chamadas
        } = criarDependencias();

        criarLoginRateLimit({
            rateLimit,
            janelaMs: 900000,
            limite: 5,
            logger
        });

        const configuracoes =
            chamadas.configuracoes[0];

        const req = {
            method: 'POST',
            originalUrl: '/auth/login',

            body: {
                email: 'carla@email.com',
                senha: 'senha-segura'
            }
        };

        const res = criarResposta();

        configuracoes.handler(req, res);

        assert.deepEqual(chamadas.logs, [
            {
                evento:
                    'limite_tentativas_login',
                metodo: 'POST',
                rota: '/auth/login'
            }
        ]);

        const logSerializado =
            JSON.stringify(chamadas.logs);

        assert.equal(
            logSerializado.includes(
                'carla@email.com'
            ),
            false
        );

        assert.equal(
            logSerializado.includes(
                'senha-segura'
            ),
            false
        );
    }
);

test('limita cadastro por IP com resposta segura', () => {
    const { rateLimit, logger, chamadas } =
        criarDependencias();

    criarCadastroRateLimit({
        rateLimit,
        janelaMs: 60000,
        limite: 3,
        logger
    });

    const res = criarResposta();
    chamadas.configuracoes[0].handler(
        { method: 'POST', originalUrl: '/auth/register' },
        res
    );

    assert.equal(chamadas.configuracoes[0].windowMs, 60000);
    assert.equal(chamadas.configuracoes[0].limit, 3);
    assert.equal(res.statusCode, 429);
    assert.equal(res.body.erro.codigo, 'LIMITE_TENTATIVAS');
    assert.deepEqual(chamadas.logs, [{
        evento: 'limite_tentativas_cadastro',
        metodo: 'POST',
        rota: '/auth/register'
    }]);
});

test('limita envio de e-mail sem registrar o destinatário', () => {
    const { rateLimit, logger, chamadas } =
        criarDependencias();

    criarEmailRateLimit({
        rateLimit,
        janelaMs: 120000,
        limite: 2,
        logger
    });

    const res = criarResposta();
    chamadas.configuracoes[0].handler(
        {
            method: 'POST',
            originalUrl: '/auth/parental-consent/request',
            body: { emailResponsavelLegal: 'responsavel@email.com' }
        },
        res
    );

    assert.equal(res.statusCode, 429);
    assert.equal(res.body.erro.codigo, 'LIMITE_ENVIOS_EMAIL');
    assert.equal(
        JSON.stringify(chamadas.logs).includes('responsavel@email.com'),
        false
    );
});
