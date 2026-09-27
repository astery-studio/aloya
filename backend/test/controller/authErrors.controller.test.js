import test from 'node:test';
import assert from 'node:assert/strict';
import { criarAuthController } from '../../src/controllers/auth.controller.js';
function res() {
    return {
        statusCode: null,
        body: null,
        status(codigo) { this.statusCode = codigo; return this; },
        json(body) { this.body = body; return this; }
    };
}
test('rejeita solicitação e reenvio parentais inválidos', async () => {
    const erros = [{ campo: 'email', mensagem: 'Inválido.' }];
    const invalida = () => ({ valido: false, erros, dados: {} });
    const controller = criarAuthController({
        authService: {},
        authValidator: {},
        parentalConsentService: {},
        parentalConsentValidator: { validarSolicitacao: invalida, validarReenvio: invalida }
    });
    for (const metodo of ['solicitarConsentimento', 'reenviarConsentimento']) {
        const resposta = res();
        await controller[metodo]({ body: {} }, resposta, () => {});
        assert.equal(resposta.statusCode, 422);
        assert.deepEqual(resposta.body.erro.detalhes, erros);
    }
});
test('encaminha falhas de cadastro e consentimento', async () => {
    const erro = new Error('falha');
    const falhar = async () => { throw erro; };
    const valida = () => ({ valido: true, erros: [], dados: { token: 't' } });
    const controller = criarAuthController({
        authService: { cadastrar: falhar },
        authValidator: { validarCadastro: valida },
        parentalConsentService: {
            solicitar: falhar,
            reenviar: falhar,
            confirmar: falhar,
            verificarAcessoRedeApoio: falhar
        },
        parentalConsentValidator: {
            validarSolicitacao: valida,
            validarReenvio: valida,
            validarToken: valida
        }
    });
    const casos = [
        ['cadastrar', { body: {}, headers: {} }],
        ['solicitarConsentimento', { body: {}, usuario: { id: 1 } }],
        ['reenviarConsentimento', { body: {}, usuario: { id: 1 } }],
        ['confirmarConsentimento', { params: { token: 't' } }],
        ['consultarStatusConsentimento', { usuario: { id: 1 } }]
    ];
    for (const [metodo, req] of casos) {
        let recebido;
        await controller[metodo](req, res(), (e) => { recebido = e; });
        assert.equal(recebido, erro);
    }
});
