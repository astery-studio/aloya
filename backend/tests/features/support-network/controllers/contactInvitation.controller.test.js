import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationController } from '../../../../src/features/support-network/controllers/contactInvitation.controller.js';

function criarResposta() {
    return {
        statusRecebido: null,
        corpo: null,
        headers: {},
        set(nome, valor) {
            this.headers[nome] = valor;
        },
        status(valor) {
            this.statusRecebido = valor;
            return this;
        },
        json(valor) {
            this.corpo = valor;
            return this;
        }
    };
}

function criarController(service = {}) {
    return criarContactInvitationController({
        service: {
            consultarEmail:
                service.consultarEmail ||
                (async ({ email }) => ({ email, contaContatoCadastrada: true })),
            criarConvite: service.criarConvite || (async () => ({ id: 1, status: 'pendente' }))
        },
        validator: {
            validarConsultaEmail: (body) =>
                body?.email === 'invalido'
                    ? {
                          valido: false,
                          erros: [{ campo: 'email', mensagem: 'Informe um e-mail válido.' }]
                      }
                    : { valido: true, erros: [], dados: { email: body.email } },
            validarCriacaoConvite: (body) => ({ valido: true, erros: [], dados: body })
        }
    });
}

test('consulta e-mail usando exclusivamente a titular da sessão', async () => {
    let recebido;
    const controller = criarController({
        consultarEmail: async (dados) => {
            recebido = dados;
            return { contaContatoCadastrada: true };
        }
    });
    const res = criarResposta();

    await controller.consultarEmail(
        {
            usuario: { id: 4, papel: 'principal' },
            body: { email: 'contato@example.com', titularId: 99 }
        },
        res,
        assert.fail
    );

    assert.deepEqual(recebido, { titularId: 4, papel: 'principal', email: 'contato@example.com' });
    assert.equal(res.statusRecebido, 200);
    assert.equal(res.headers['Cache-Control'], 'private, no-store');
});

test('devolve a mensagem exata para e-mail inválido', async () => {
    const res = criarResposta();
    await criarController().consultarEmail(
        { usuario: { id: 4, papel: 'principal' }, body: { email: 'invalido' } },
        res,
        assert.fail
    );

    assert.equal(res.statusRecebido, 422);
    assert.equal(res.corpo.erro.mensagem, 'Informe um e-mail válido.');
});

test('cria convite pendente e responde com a mensagem da HU-028', async () => {
    const res = criarResposta();
    await criarController().criarConvite(
        {
            usuario: { id: 4, papel: 'principal' },
            body: { email: 'contato@example.com', categoriaId: 2 }
        },
        res,
        assert.fail
    );

    assert.equal(res.statusRecebido, 201);
    assert.equal(res.corpo.mensagem, 'Convite enviado com sucesso.');
    assert.equal(res.corpo.convite.status, 'pendente');
});

test('encaminha falha inesperada com mensagem pública amigável', async () => {
    const falha = new Error('detalhe interno do SMTP');
    const controller = criarController({
        criarConvite: async () => {
            throw falha;
        }
    });
    let encaminhado;

    await controller.criarConvite(
        {
            usuario: { id: 4, papel: 'principal' },
            body: { email: 'contato@example.com', categoriaId: 2 }
        },
        criarResposta(),
        (erro) => {
            encaminhado = erro;
        }
    );

    assert.equal(encaminhado, falha);
    assert.equal(
        encaminhado.mensagemUsuario,
        'Ocorreu um erro ao enviar convite. Verifique sua conexão e tente novamente.'
    );
});
