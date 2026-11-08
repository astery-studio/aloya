import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationResponseController } from '../../../../src/features/support-network/controllers/contactInvitationResponse.controller.js';

function resposta() {
    return {
        statusCode: null,
        body: null,
        headers: {},
        set(nome, valor) { this.headers[nome] = valor; return this; },
        status(valor) { this.statusCode = valor; return this; },
        json(valor) { this.body = valor; return this; }
    };
}

function criarController(chamadas) {
    return criarContactInvitationResponseController({
        service: {
            async consultar(token) { chamadas.push(['consultar', token]); return { titular: { nome: 'Julia' } }; },
            async cadastrarContato(token, dados) { chamadas.push(['cadastrar', token, dados]); return { mensagem: 'Conta criada.' }; },
            async aceitar(dados) { chamadas.push(['aceitar', dados]); return { mensagem: 'Convite aceito com sucesso.' }; },
            async recusar(dados) { chamadas.push(['recusar', dados]); return { mensagem: 'Convite recusado com sucesso.' }; }
        },
        invitationValidator: {
            validarTokenConvite(token) { return { valido: true, erros: [], dados: { token } }; },
            validarRespostaConvite(body) { return { valido: true, erros: [], dados: { acao: body.acao } }; }
        },
        registrationValidator: {
            validar(body) { return { valido: true, erros: [], dados: body }; }
        }
    });
}

test('consulta detalhes sem autenticar ou expor token na resposta', async () => {
    const chamadas = [];
    const controller = criarController(chamadas);
    const res = resposta();
    await controller.consultar({ params: { token: 'token-seguro' } }, res, assert.fail);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(chamadas, [['consultar', 'token-seguro']]);
    assert.equal(JSON.stringify(res.body).includes('token-seguro'), false);
});

test('cadastra contato com dados validados pelo convite', async () => {
    const chamadas = [];
    const controller = criarController(chamadas);
    const res = resposta();
    await controller.cadastrarContato(
        { params: { token: 'token-seguro' }, body: { nome: 'Maria' } },
        res,
        assert.fail
    );

    assert.equal(res.statusCode, 201);
    assert.deepEqual(chamadas[0], ['cadastrar', 'token-seguro', { nome: 'Maria' }]);
});

test('encaminha aceite e recusa usando somente a sessão autenticada', async () => {
    for (const acao of ['aceitar', 'recusar']) {
        const chamadas = [];
        const controller = criarController(chamadas);
        const res = resposta();
        await controller.responder(
            { params: { token: 'token-seguro' }, body: { acao }, usuario: { id: 25 } },
            res,
            assert.fail
        );
        assert.deepEqual(chamadas[0], [acao, { token: 'token-seguro', usuarioId: 25 }]);
    }
});

test('rejeita configuração incompleta', () => {
    assert.throws(() => criarContactInvitationResponseController(), TypeError);
});
