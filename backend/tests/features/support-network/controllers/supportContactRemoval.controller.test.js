import assert from 'node:assert/strict';
import test from 'node:test';

import { criarSupportContactRemovalController } from '../../../../src/features/support-network/controllers/supportContactRemoval.controller.js';

function resposta() {
    const estado = { status: null, body: null, headers: {} };
    return {
        estado,
        res: {
            set(nome, valor) {
                estado.headers[nome] = valor;
                return this;
            },
            status(valor) {
                estado.status = valor;
                return this;
            },
            json(valor) {
                estado.body = valor;
                return this;
            }
        }
    };
}

function controllerCom(sobrescritas = {}) {
    return criarSupportContactRemovalController({
        service: sobrescritas.service ?? {
            async desativar() {
                return { id: 9, status: 'revogado' };
            },
            async remover() {
                return { id: 9, status: 'removido', statusAnterior: 'ativo' };
            }
        },
        contactValidator: sobrescritas.contactValidator ?? {
            validarContatoId() {
                return { valido: true, contatoId: 9 };
            }
        },
        removalValidator: sobrescritas.removalValidator ?? {
            validarConfirmacao() {
                return { valido: true, dados: { confirmado: true } };
            }
        }
    });
}

test('remove usando somente a identidade autenticada e responde sucesso', async () => {
    const chamadas = [];
    const controller = controllerCom({
        service: {
            async desativar() {},
            async remover(dados) {
                chamadas.push(dados);
                return {
                    id: 9,
                    status: 'removido',
                    statusAnterior: 'ativo',
                    sessoesEncerradas: 1
                };
            }
        }
    });
    const { res, estado } = resposta();

    await controller.remover(
        {
            usuario: { id: 1, papel: 'principal' },
            params: { contatoId: '9' },
            body: { confirmado: true, titularId: 999 }
        },
        res,
        assert.fail
    );

    assert.deepEqual(chamadas, [{ titularId: 1, papel: 'principal', contatoId: 9 }]);
    assert.equal(estado.status, 200);
    assert.equal(estado.body.mensagem, 'Contato removido com sucesso.');
    assert.equal(estado.headers['Cache-Control'], 'no-store');
});

test('desativa o contato pelo fluxo específico', async () => {
    const chamadas = [];
    const controller = controllerCom({
        service: {
            async remover() {},
            async desativar(dados) {
                chamadas.push(dados);
                return { id: 9, status: 'revogado', statusAnterior: 'ativo' };
            }
        }
    });
    const { res, estado } = resposta();

    await controller.desativar(
        {
            usuario: { id: 1, papel: 'principal' },
            params: { contatoId: '9' },
            body: { confirmado: true }
        },
        res,
        assert.fail
    );

    assert.deepEqual(chamadas, [{ titularId: 1, papel: 'principal', contatoId: 9 }]);
    assert.equal(estado.status, 200);
    assert.equal(estado.body.mensagem, 'Contato desativado com sucesso.');
});

test('não chama o serviço sem identificador ou confirmação válidos', async () => {
    let chamadas = 0;
    const service = {
        async desativar() {
            chamadas += 1;
        },
        async remover() {
            chamadas += 1;
        }
    };
    const idInvalido = controllerCom({
        service,
        contactValidator: {
            validarContatoId() {
                return {
                    valido: false,
                    erro: { campo: 'contatoId', mensagem: 'Contato inválido.' }
                };
            }
        }
    });
    const semConfirmacao = controllerCom({
        service,
        removalValidator: {
            validarConfirmacao() {
                return {
                    valido: false,
                    erros: [{ campo: 'confirmado', mensagem: 'Confirme a remoção.' }]
                };
            }
        }
    });

    const primeira = resposta();
    await idInvalido.remover(
        { usuario: { id: 1 }, params: { contatoId: 'x' }, body: {} },
        primeira.res,
        assert.fail
    );
    const segunda = resposta();
    await semConfirmacao.remover(
        { usuario: { id: 1 }, params: { contatoId: '9' }, body: {} },
        segunda.res,
        assert.fail
    );

    assert.equal(chamadas, 0);
    assert.equal(primeira.estado.status, 422);
    assert.equal(segunda.estado.status, 422);
});

test('preserva erro público e mascara falha interna', async () => {
    const publico = Object.assign(new Error('Não encontrado'), { status: 404 });
    const interno = new Error('detalhes do banco');
    let recebidoPublico;
    let recebidoInterno;

    await controllerCom({
        service: {
            async desativar() {},
            async remover() {
                throw publico;
            }
        }
    }).remover(
        { usuario: { id: 1 }, params: { contatoId: '9' }, body: { confirmado: true } },
        resposta().res,
        (erro) => {
            recebidoPublico = erro;
        }
    );
    await controllerCom({
        service: {
            async desativar() {},
            async remover() {
                throw interno;
            }
        }
    }).remover(
        { usuario: { id: 1 }, params: { contatoId: '9' }, body: { confirmado: true } },
        resposta().res,
        (erro) => {
            recebidoInterno = erro;
        }
    );

    assert.equal(recebidoPublico.mensagemUsuario, undefined);
    assert.equal(
        recebidoInterno.mensagemUsuario,
        'Não foi possível remover este contato. Tente novamente.'
    );
});

test('rejeita configuração incompleta', () => {
    assert.throws(
        () => criarSupportContactRemovalController(),
        /configurar o controller de remoção/
    );
});
