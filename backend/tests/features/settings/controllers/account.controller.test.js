//Este teste serve para testar o controller de conta, garantindo que as funcionalidades relacionadas à conta do usuário funcionem corretamente
import test from 'node:test';
import assert from 'node:assert/strict';

import { criarAccountController } from '../../../../src/features/settings/controllers/account.controller.js';

//Função para criar um mock de resposta HTTP
function criarRespostaMock() {
    return {
        statusRecebido: null,
        corpoRecebido: null,

        status(status) {
            this.statusRecebido = status;

            return this;
        },

        json(corpo) {
            this.corpoRecebido = corpo;

            return this;
        }
    };
}

//Testes para o controller de conta
test('retorna os dados cadastrados da própria conta', async function () {
    const accountController = criarAccountController({
        accountService: {
            async buscarConfiguracoes() {
                return {
                    id: 1,
                    nome: 'Aloya Teste',
                    email: 'aloya@email.com',
                    identidadeGenero: 'Mulher Cisgênero',
                    dataNascimento: '2000-04-08',
                    temaVisual: 'automatico'
                };
            }
        },

        accountValidator: {}
    });

    const req = {
        usuario: {
            id: 1
        }
    };

    const res = criarRespostaMock();

    await accountController.buscarConfiguracoes(req, res, assert.fail);

    assert.equal(res.statusRecebido, 200);
    assert.equal(res.corpoRecebido.configuracoes.email, 'aloya@email.com');

    assert.equal(res.corpoRecebido.configuracoes.temaVisual, 'automatico');
});

test('atualiza o tema da própria conta autenticada', async function () {
    let usuarioIdRecebido = null;
    let dadosRecebidos = null;

    const accountController = criarAccountController({
        accountService: {
            async atualizarConfiguracoes(usuarioId, dados) {
                usuarioIdRecebido = usuarioId;
                dadosRecebidos = dados;

                return {
                    configuracoes: {
                        temaVisual: 'escuro'
                    },
                    consentimentoParentalNecessario: false
                };
            }
        },

        accountValidator: {
            validarAtualizacao() {
                return {
                    valido: true,
                    erros: [],
                    dados: {
                        temaVisual: 'escuro'
                    }
                };
            }
        }
    });

    const res = criarRespostaMock();

    await accountController.atualizarConfiguracoes(
        {
            body: {
                temaVisual: 'escuro'
            },
            usuario: {
                id: 7
            }
        },
        res,
        assert.fail
    );

    assert.equal(usuarioIdRecebido, 7);
    assert.deepEqual(dadosRecebidos, {
        temaVisual: 'escuro'
    });
    assert.equal(res.statusRecebido, 200);
    assert.equal(res.corpoRecebido.configuracoes.temaVisual, 'escuro');
});

test('define mensagem segura quando a atualização do tema falha', async function () {
    const erroInterno = new Error('detalhe interno do banco');
    let erroEncaminhado = null;

    const accountController = criarAccountController({
        accountService: {
            async atualizarConfiguracoes() {
                throw erroInterno;
            }
        },

        accountValidator: {
            validarAtualizacao() {
                return {
                    valido: true,
                    erros: [],
                    dados: {
                        temaVisual: 'claro'
                    }
                };
            }
        }
    });

    await accountController.atualizarConfiguracoes(
        {
            body: {
                temaVisual: 'claro'
            },
            usuario: {
                id: 7
            }
        },
        criarRespostaMock(),
        function proximo(erro) {
            erroEncaminhado = erro;
        }
    );

    assert.equal(erroEncaminhado, erroInterno);
    assert.equal(
        erroEncaminhado.mensagemUsuario,
        'Ocorreu um erro ao atualizar seus dados. Tente novamente.'
    );
});

//Teste para retornar erro de validação quando a atualização é inválida
test('retorna 422 quando a atualização é inválida', async function () {
    const accountController = criarAccountController({
        accountService: {},

        accountValidator: {
            validarAtualizacao() {
                return {
                    valido: false,
                    erros: [
                        {
                            campo: 'email',
                            mensagem: 'Informe um e-mail válido.'
                        }
                    ]
                };
            }
        }
    });

    const req = {
        body: {},
        usuario: {
            id: 1
        }
    };

    //Cria um mock de resposta HTTP
    const res = criarRespostaMock();

    await accountController.atualizarConfiguracoes(req, res, assert.fail);

    assert.equal(res.statusRecebido, 422);

    assert.equal(res.corpoRecebido.erro.codigo, 'ERRO_VALIDACAO');
});
