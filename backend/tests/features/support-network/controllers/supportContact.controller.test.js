import assert from 'node:assert/strict';
import test from 'node:test';

import { criarSupportContactController } from '../../../../src/features/support-network/controllers/supportContact.controller.js';

function criarResposta() {
    const estado = { headers: {}, status: null, body: null };
    return {
        estado,
        res: {
            set(nome, valor) {
                estado.headers[nome] = valor;
                return this;
            },
            status(status) {
                estado.status = status;
                return this;
            },
            json(body) {
                estado.body = body;
                return this;
            }
        }
    };
}

function criarController(service = {}) {
    return criarSupportContactController({
        service: {
            async listar() {
                return { contatos: [], resumo: { total: 0, pendentes: 0, ativos: 0 } };
            },
            ...service
        },
        resendService: {
            async reenviar() {
                return { id: 9, status: 'pendente' };
            }
        },
        validator: {
            validarContatoId(valor) {
                return { valido: true, contatoId: Number(valor) };
            }
        }
    });
}

test('lista contatos usando somente a identidade autenticada', async () => {
    const chamadas = [];
    const resultado = { contatos: [], resumo: { total: 0, pendentes: 0, ativos: 0 } };
    const controller = criarController({
            async listar(dados) {
                chamadas.push(dados);
                return resultado;
            }
    });
    const { res, estado } = criarResposta();

    await controller.listar(
        { usuario: { id: 42, papel: 'principal' }, query: { titularId: 99 } },
        res,
        assert.fail
    );

    assert.deepEqual(chamadas, [{ titularId: 42, papel: 'principal' }]);
    assert.equal(estado.status, 200);
    assert.equal(estado.body, resultado);
    assert.equal(estado.headers['Cache-Control'], 'private, no-store');
});

test('preserva erros públicos do serviço', async () => {
    const erro = Object.assign(new Error('Negado'), { status: 403, codigo: 'ACESSO_NEGADO' });
    const controller = criarController({ async listar() { throw erro; } });
    let recebido;

    await controller.listar(
        { usuario: { id: 1, papel: 'contato_apoio' } },
        criarResposta().res,
        (falha) => { recebido = falha; }
    );

    assert.equal(recebido, erro);
    assert.equal(recebido.mensagemUsuario, undefined);
});

test('atribui mensagem amigável sem expor a falha interna', async () => {
    const erro = new Error('ECONNRESET interno');
    const controller = criarController({ async listar() { throw erro; } });
    let recebido;

    await controller.listar(
        { usuario: { id: 1, papel: 'principal' } },
        criarResposta().res,
        (falha) => { recebido = falha; }
    );

    assert.equal(
        recebido.mensagemUsuario,
        'Não foi possível carregar sua Rede de Apoio no momento. Tente novamente.'
    );
});

test('rejeita configuração sem serviço de listagem', () => {
    assert.throws(() => criarSupportContactController(), /configurar o controller/);
});

test('reenvia convite usando identidade autenticada e id validado', async () => {
    const chamadas = [];
    const controller = criarSupportContactController({
        service: { async listar() {} },
        resendService: {
            async reenviar(dados) {
                chamadas.push(dados);
                return { id: 9, status: 'pendente' };
            }
        },
        validator: {
            validarContatoId() { return { valido: true, contatoId: 9 }; }
        }
    });
    const { res, estado } = criarResposta();

    await controller.reenviarConvite(
        { usuario: { id: 1, papel: 'principal' }, params: { contatoId: '9' } },
        res,
        assert.fail
    );

    assert.deepEqual(chamadas, [{ titularId: 1, papel: 'principal', contatoId: 9 }]);
    assert.equal(estado.status, 200);
    assert.equal(estado.body.mensagem, 'Convite reenviado com sucesso.');
    assert.equal(estado.headers['Cache-Control'], 'no-store');
});

test('responde erro de validação sem chamar o serviço de reenvio', async () => {
    let chamou = false;
    const controller = criarSupportContactController({
        service: { async listar() {} },
        resendService: { async reenviar() { chamou = true; } },
        validator: {
            validarContatoId() {
                return {
                    valido: false,
                    erro: { campo: 'contatoId', codigo: 'CONTATO_ID_INVALIDO', mensagem: 'Contato inválido.' }
                };
            }
        }
    });
    const { res, estado } = criarResposta();

    await controller.reenviarConvite(
        { usuario: { id: 1, papel: 'principal' }, params: { contatoId: 'x' } },
        res,
        assert.fail
    );

    assert.equal(chamou, false);
    assert.equal(estado.status, 422);
    assert.equal(estado.body.erro.mensagem, 'Contato inválido.');
});
