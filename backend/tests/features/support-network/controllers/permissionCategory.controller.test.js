//Testa as respostas HTTP e o uso seguro da identidade da sessão.
import test from 'node:test';
import assert from 'node:assert/strict';

import { criarPermissionCategoryController } from '../../../../src/features/support-network/controllers/permissionCategory.controller.js';

//Cria uma resposta Express controlada para os testes.
function criarRespostaMock() {
    return {
        statusRecebido: null,
        corpoRecebido: null,
        cabecalhos: {},

        set(nome, valor) {
            this.cabecalhos[nome] = valor;

            return this;
        },

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

//Cria os dados seguros devolvidos pelo validator.
function criarValidacaoValida() {
    return {
        valido: true,
        erros: [],
        dados: {
            nome: 'Família',
            nomeNormalizado: 'família',
            dadosVisiveis: ['geral.fase_atual']
        }
    };
}

//Cria o resultado devolvido pelo service.
function criarCategoriaCriada() {
    return {
        id: 10,
        nome: 'Família',
        dadosVisiveis: ['geral.fase_atual'],
        quantidadeContatos: 0,
        criadoEm: new Date('2026-09-24T10:00:00.000Z'),
        atualizadoEm: new Date('2026-09-24T10:00:00.000Z')
    };
}

function criarValidacaoEdicaoValida() {
    return {
        valido: true,
        erros: [],
        dados: {
            nome: 'Namorado',
            nomeNormalizado: 'namorado',
            dadosVisiveis: ['geral.fase_atual'],
            atualizadoEm: new Date('2026-10-26T12:00:00.000Z'),
            quantidadeContatosConfirmada: null
        }
    };
}

test('retorna 422 e não chama o service quando o nome está vazio', async () => {
    let serviceChamado = false;

    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return {
                    valido: false,
                    erros: [
                        {
                            campo: 'nome',
                            mensagem: 'Dê um nome para a categoria.'
                        }
                    ],
                    dados: {}
                };
            }
        },
        permissionCategoryService: {
            async criarCategoria() {
                serviceChamado = true;
            }
        }
    });

    const res = criarRespostaMock();

    await controller.criarCategoria(
        {
            body: {
                nome: '   ',
                dadosVisiveis: ['geral.fase_atual']
            },
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        res,
        assert.fail
    );

    assert.equal(serviceChamado, false);
    assert.equal(res.statusRecebido, 422);

    assert.deepEqual(res.corpoRecebido, {
        erro: {
            codigo: 'ERRO_VALIDACAO',
            mensagem: 'Dê um nome para a categoria.',
            detalhes: [
                {
                    campo: 'nome',
                    mensagem: 'Dê um nome para a categoria.'
                }
            ]
        }
    });
});

test('retorna a mensagem exigida quando nenhuma permissão foi selecionada', async () => {
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return {
                    valido: false,
                    erros: [
                        {
                            campo: 'dadosVisiveis',
                            mensagem:
                                'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.'
                        }
                    ],
                    dados: {}
                };
            }
        },
        permissionCategoryService: {
            async criarCategoria() {
                assert.fail('O service não deveria ser chamado.');
            }
        }
    });

    const res = criarRespostaMock();

    await controller.criarCategoria(
        {
            body: {
                nome: 'Família',
                dadosVisiveis: []
            },
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        res,
        assert.fail
    );

    assert.equal(res.statusRecebido, 422);
    assert.equal(
        res.corpoRecebido.erro.mensagem,
        'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.'
    );
});

test('cria a categoria usando somente a identidade da sessão', async () => {
    let dadosRecebidos = null;
    const categoria = criarCategoriaCriada();

    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida();
            }
        },
        permissionCategoryService: {
            async criarCategoria(dados) {
                dadosRecebidos = dados;

                return categoria;
            }
        }
    });

    const res = criarRespostaMock();

    await controller.criarCategoria(
        {
            body: {
                titularId: 999,
                papel: 'administrador',
                nome: 'Família',
                dadosVisiveis: ['geral.fase_atual']
            },
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        res,
        assert.fail
    );

    assert.deepEqual(dadosRecebidos, {
        titularId: 7,
        papel: 'principal',
        nome: 'Família',
        dadosVisiveis: ['geral.fase_atual']
    });

    assert.equal(res.statusRecebido, 201);
    assert.equal(res.cabecalhos['Cache-Control'], 'no-store');

    assert.deepEqual(res.corpoRecebido, {
        mensagem: 'Categoria criada com sucesso.',
        categoria
    });
});

test('encaminha o conflito de nome sem substituir sua mensagem', async () => {
    const erroDuplicidade = new Error('Você já tem uma categoria com esse nome.');

    erroDuplicidade.status = 409;
    erroDuplicidade.codigo = 'CATEGORIA_NOME_DUPLICADO';

    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida();
            }
        },
        permissionCategoryService: {
            async criarCategoria() {
                throw erroDuplicidade;
            }
        }
    });

    let erroRecebido = null;

    await controller.criarCategoria(
        {
            body: {},
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        criarRespostaMock(),
        (erro) => {
            erroRecebido = erro;
        }
    );

    assert.equal(erroRecebido, erroDuplicidade);
    assert.equal(erroRecebido.mensagemUsuario, undefined);
});

test('define mensagem pública segura para erro interno inesperado', async () => {
    const erroInterno = new Error('Detalhes privados do banco');

    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida();
            }
        },
        permissionCategoryService: {
            async criarCategoria() {
                throw erroInterno;
            }
        }
    });

    let erroRecebido = null;

    await controller.criarCategoria(
        {
            body: {},
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        criarRespostaMock(),
        (erro) => {
            erroRecebido = erro;
        }
    );

    assert.equal(erroRecebido, erroInterno);
    assert.equal(
        erroRecebido.mensagemUsuario,
        'Ocorreu um erro ao criar sua categoria. Verifique sua conexão e tente novamente.'
    );
    assert.equal(erroRecebido.status, undefined);
});

test('não devolve nome normalizado nem titularId na resposta', async () => {
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida();
            }
        },
        permissionCategoryService: {
            async criarCategoria() {
                return criarCategoriaCriada();
            }
        }
    });

    const res = criarRespostaMock();

    await controller.criarCategoria(
        {
            body: {},
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        res,
        assert.fail
    );

    const respostaSerializada = JSON.stringify(res.corpoRecebido);

    assert.equal(respostaSerializada.includes('nomeNormalizado'), false);
    assert.equal(respostaSerializada.includes('titularId'), false);
});

test('lista categorias usando somente a identidade da sessão', async () => {
    const categorias = [criarCategoriaCriada()];
    let dadosRecebidos = null;
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida();
            }
        },
        permissionCategoryService: {
            async listarCategorias(dados) {
                dadosRecebidos = dados;

                return categorias;
            }
        }
    });
    const res = criarRespostaMock();

    await controller.listarCategorias(
        {
            query: {
                titularId: 999,
                papel: 'administrador'
            },
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        res,
        assert.fail
    );

    assert.deepEqual(dadosRecebidos, {
        titularId: 7,
        papel: 'principal'
    });
    assert.equal(res.statusRecebido, 200);
    assert.equal(res.cabecalhos['Cache-Control'], 'private, no-store');
    assert.equal(res.cabecalhos.Pragma, 'no-cache');
    assert.deepEqual(res.corpoRecebido, { categorias });
});

test('devolve coleção vazia quando não existem categorias', async () => {
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida();
            }
        },
        permissionCategoryService: {
            async listarCategorias() {
                return [];
            }
        }
    });
    const res = criarRespostaMock();

    await controller.listarCategorias(
        {
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        res,
        assert.fail
    );

    assert.deepEqual(res.corpoRecebido, {
        categorias: []
    });
});

test('define a mensagem pública exigida quando a listagem falha', async () => {
    const erroInterno = new Error('Detalhes privados do banco');
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida();
            }
        },
        permissionCategoryService: {
            async listarCategorias() {
                throw erroInterno;
            }
        }
    });
    let erroRecebido = null;

    await controller.listarCategorias(
        {
            usuario: {
                id: 7,
                papel: 'principal'
            }
        },
        criarRespostaMock(),
        (erro) => {
            erroRecebido = erro;
        }
    );

    assert.equal(erroRecebido, erroInterno);
    assert.equal(
        erroRecebido.mensagemUsuario,
        'Não foi possível carregar suas categorias no momento. Tente novamente.'
    );
});

test('preserva erros públicos controlados durante a listagem', async () => {
    const erroControlado = new Error('Somente a titular pode consultar categorias de permissão.');

    erroControlado.status = 403;
    erroControlado.codigo = 'ACAO_NAO_PERMITIDA';

    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarCriacaoCategoria() {
                return criarValidacaoValida();
            }
        },
        permissionCategoryService: {
            async listarCategorias() {
                throw erroControlado;
            }
        }
    });
    let erroRecebido = null;

    await controller.listarCategorias(
        {
            usuario: {
                id: 7,
                papel: 'contato_apoio'
            }
        },
        criarRespostaMock(),
        (erro) => {
            erroRecebido = erro;
        }
    );

    assert.equal(erroRecebido, erroControlado);
    assert.equal(erroRecebido.mensagemUsuario, undefined);
});

test('atualiza categoria e devolve a mensagem do protótipo', async () => {
    const categoria = {
        ...criarCategoriaCriada(),
        nome: 'Namorado'
    };
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarIdCategoria() {
                return 10;
            },
            validarEdicaoCategoria() {
                return criarValidacaoEdicaoValida();
            }
        },
        permissionCategoryService: {
            async editarCategoria() {
                return categoria;
            }
        }
    });
    const res = criarRespostaMock();

    await controller.editarCategoria(
        {
            params: {id: '10'},
            body: {},
            usuario: {id: 7, papel: 'principal'}
        },
        res,
        assert.fail
    );

    assert.equal(res.statusRecebido, 200);
    assert.equal(res.cabecalhos['Cache-Control'], 'no-store');
    assert.deepEqual(res.corpoRecebido, {
        mensagem: 'Categoria atualizada com sucesso.',
        categoria
    });
});

test('edita usando somente o id e o papel da sessão autenticada', async () => {
    let parametrosRecebidos = null;
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarIdCategoria() {
                return 10;
            },
            validarEdicaoCategoria() {
                return criarValidacaoEdicaoValida();
            }
        },
        permissionCategoryService: {
            async editarCategoria(parametros) {
                parametrosRecebidos = parametros;
                return criarCategoriaCriada();
            }
        }
    });

    await controller.editarCategoria(
        {
            params: {id: '10'},
            body: {titularId: 999, papel: 'administrador'},
            usuario: {id: 7, papel: 'principal'}
        },
        criarRespostaMock(),
        assert.fail
    );

    assert.deepEqual(parametrosRecebidos, {
        titularId: 7,
        papel: 'principal',
        categoriaId: 10,
        nome: 'Namorado',
        dadosVisiveis: ['geral.fase_atual'],
        atualizadoEm: new Date('2026-10-26T12:00:00.000Z'),
        quantidadeContatosConfirmada: null
    });
});

test('retorna 400 sem chamar o service quando o id da categoria é inválido', async () => {
    let serviceChamado = false;
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarIdCategoria() {
                throw new TypeError('Identificador de categoria inválido.');
            }
        },
        permissionCategoryService: {
            async editarCategoria() {
                serviceChamado = true;
            }
        }
    });
    const res = criarRespostaMock();

    await controller.editarCategoria(
        {params: {id: '../10'}, body: {}, usuario: {id: 7, papel: 'principal'}},
        res,
        assert.fail
    );

    assert.equal(serviceChamado, false);
    assert.equal(res.statusRecebido, 400);
    assert.deepEqual(res.corpoRecebido, {
        erro: {
            codigo: 'ID_CATEGORIA_INVALIDO',
            mensagem: 'Identificador de categoria inválido.'
        }
    });
});

test('retorna 422 e mantém o service intacto quando a edição é inválida', async () => {
    let serviceChamado = false;
    const validacao = {
        valido: false,
        erros: [{
            campo: 'dadosVisiveis',
            mensagem: 'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.'
        }],
        dados: {}
    };
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarIdCategoria() {
                return 10;
            },
            validarEdicaoCategoria() {
                return validacao;
            }
        },
        permissionCategoryService: {
            async editarCategoria() {
                serviceChamado = true;
            }
        }
    });
    const res = criarRespostaMock();

    await controller.editarCategoria(
        {params: {id: '10'}, body: {}, usuario: {id: 7, papel: 'principal'}},
        res,
        assert.fail
    );

    assert.equal(serviceChamado, false);
    assert.equal(res.statusRecebido, 422);
    assert.deepEqual(res.corpoRecebido.erro.detalhes, validacao.erros);
});

test('retorna a quantidade necessária para montar o modal de impacto', async () => {
    const erroImpacto = new Error(
        'Esta alteração afetará imediatamente 2 contato(s) vinculado(s) a esta categoria. Deseja continuar?'
    );
    erroImpacto.status = 409;
    erroImpacto.codigo = 'CONFIRMACAO_IMPACTO_NECESSARIA';
    erroImpacto.quantidadeContatos = 2;
    const controller = criarPermissionCategoryController({
        permissionCategoryValidator: {
            validarIdCategoria() {
                return 10;
            },
            validarEdicaoCategoria() {
                return criarValidacaoEdicaoValida();
            }
        },
        permissionCategoryService: {
            async editarCategoria() {
                throw erroImpacto;
            }
        }
    });
    const res = criarRespostaMock();

    await controller.editarCategoria(
        {params: {id: '10'}, body: {}, usuario: {id: 7, papel: 'principal'}},
        res,
        assert.fail
    );

    assert.equal(res.statusRecebido, 409);
    assert.deepEqual(res.corpoRecebido, {
        erro: {
            codigo: 'CONFIRMACAO_IMPACTO_NECESSARIA',
            mensagem: erroImpacto.message,
            detalhes: {quantidadeContatos: 2}
        }
    });
});
