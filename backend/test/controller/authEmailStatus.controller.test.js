import test from 'node:test';
import assert from 'node:assert/strict';
import { criarAuthController } from '../../src/controllers/auth.controller.js';
function resposta() {
    return {
        statusCode: null,
        body: null,
        status(codigo) { this.statusCode = codigo; return this; },
        json(body) { this.body = body; return this; }
    };
}
function controller({ validacao, service }) {
    return criarAuthController({
        authService: service,
        authValidator: { validarEmail: () => validacao },
        parentalConsentService: service,
        parentalConsentValidator: {}
    });
}
test('valida e consulta a disponibilidade do e-mail', async () => {
    const chamadas = [];
    const service = {
        async verificarEmailDisponivel(email) {
            chamadas.push(email);
            return { disponivel: true };
        }
    };
    const validacao = { valido: true, erros: [], dados: { email: 'a@b.com' } };
    const instancia = controller({ validacao, service });
    const res = resposta();
    await instancia.verificarEmail({ body: {} }, res, () => {});
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { disponivel: true });
    assert.deepEqual(chamadas, ['a@b.com']);
});
test('rejeita e-mail inválido sem consultar o serviço', async () => {
    const erros = [{ campo: 'email', mensagem: 'Inválido.' }];
    const instancia = controller({ validacao: { valido: false, erros } });
    const res = resposta();
    await instancia.verificarEmail({ body: {} }, res, () => {});
    assert.equal(res.statusCode, 422);
    assert.deepEqual(res.body.erro.detalhes, erros);
});
test('consulta estado do consentimento e encaminha falhas', async () => {
    const erro = new Error('falha');
    const service = {
        verificarEmailDisponivel: async () => { throw erro; },
        verificarAcessoRedeApoio: async () => ({ acessoLiberado: false })
    };
    const instancia = controller({ validacao: { valido: true, dados: {} }, service });
    const res = resposta();
    await instancia.consultarStatusConsentimento({ usuario: { id: 7 } }, res, () => {});
    assert.deepEqual(res.body, { acessoLiberado: false });
    let recebido;
    await instancia.verificarEmail({ body: {} }, resposta(), (e) => { recebido = e; });
    assert.equal(recebido, erro);
});
