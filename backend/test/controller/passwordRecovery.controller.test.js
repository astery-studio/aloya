/**
 * Testes das respostas HTTP do fluxo de recuperação de senha.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { criarPasswordRecoveryController } from '../../src/controllers/passwordRecovery.controller.js';

function resposta() {
    return {
        statusCode: null,
        body: null,
        status(codigo) { this.statusCode = codigo; return this; },
        json(body) { this.body = body; return this; }
    };
}

function criarController(validacao) {
    const chamadas = [];
    const passwordRecoveryService = {
        async solicitar(email) {
            chamadas.push(['solicitar', email]);
            return { mensagem: 'Resposta neutra.' };
        },
        async validarToken(token) {
            chamadas.push(['validar', token]);
            return { valido: true };
        },
        async redefinir(dados) {
            chamadas.push(['redefinir', dados]);
            return { mensagem: 'Senha redefinida.' };
        }
    };
    const passwordRecoveryValidator = {
        validarSolicitacao: () => validacao,
        validarRedefinicao: () => validacao
    };
    return {
        controller: criarPasswordRecoveryController({
            passwordRecoveryService,
            passwordRecoveryValidator
        }),
        chamadas
    };
}

test('solicita recuperação com e-mail normalizado', async () => {
    const validacao = { valido: true, erros: [],
        dados: { email: 'carla@email.com' } };
    const { controller, chamadas } = criarController(validacao);
    const res = resposta();

    await controller.solicitar({ body: {} }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.deepEqual(chamadas, [['solicitar', 'carla@email.com']]);
});

test('valida o token recebido pela rota', async () => {
    const { controller, chamadas } = criarController({});
    const res = resposta();

    await controller.validarToken({ params: { token: 'jwt' } }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.deepEqual(chamadas, [['validar', 'jwt']]);
});

test('redefine a senha com dados validados', async () => {
    const dados = { token: 'jwt', senha: 'nova-senha' };
    const { controller, chamadas } = criarController({
        valido: true, erros: [], dados
    });
    const res = resposta();

    await controller.redefinir({ body: dados }, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.deepEqual(chamadas, [['redefinir', dados]]);
});

test('rejeita entradas inválidas antes de acessar o serviço', async () => {
    const erros = [{ campo: 'email', mensagem: 'Inválido.' }];
    const { controller, chamadas } = criarController({
        valido: false,
        erros,
        dados: {}
    });

    for (const metodo of ['solicitar', 'redefinir']) {
        const res = resposta();
        await controller[metodo]({ body: {} }, res, () => {});
        assert.equal(res.statusCode, 422);
        assert.deepEqual(res.body.erro.detalhes, erros);
    }
    assert.deepEqual(chamadas, []);
});

test('encaminha falhas de todas as operações ao middleware', async () => {
    const erro = new Error('falha interna');
    const service = {
        solicitar: async () => { throw erro; },
        validarToken: async () => { throw erro; },
        redefinir: async () => { throw erro; }
    };
    const validator = {
        validarSolicitacao: () => ({
            valido: true,
            erros: [],
            dados: { email: 'a@b.com' }
        }),
        validarRedefinicao: () => ({
            valido: true,
            erros: [],
            dados: { token: 'jwt', senha: 'nova-senha' }
        })
    };
    const controller = criarPasswordRecoveryController({
        passwordRecoveryService: service,
        passwordRecoveryValidator: validator
    });
    const casos = [
        ['solicitar', { body: {} }],
        ['validarToken', { params: { token: 'jwt' } }],
        ['redefinir', { body: {} }]
    ];

    for (const [metodo, req] of casos) {
        let recebido;
        await controller[metodo](req, resposta(), (falha) => { recebido = falha; });
        assert.equal(recebido, erro);
    }
});
