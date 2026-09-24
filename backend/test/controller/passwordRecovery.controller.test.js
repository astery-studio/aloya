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
