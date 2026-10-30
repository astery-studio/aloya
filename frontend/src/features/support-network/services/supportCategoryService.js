//Cria, lista, edita e exclui categorias de permissão usando a sessão autenticada.
import { endpoints } from '../../../shared/services/api/endpoints';
import { gruposPermissoes, permissoesGerais } from '../constants/permissionOptions';
import { acaoExclusaoEhValida } from '../constants/categoryDeletionOptions';
import { criarSupportCategory } from '../domain/SupportCategory';

const MENSAGEM_LISTAGEM_INVALIDA =
    'Não foi possível carregar suas categorias no momento. Tente novamente.';

const ordemDasPermissoes = Object.freeze([
    ...permissoesGerais.map((permissao) => permissao.id),
    ...gruposPermissoes.flatMap((grupo) => grupo.permissoes.map((permissao) => permissao.id))
]);

const permissoesPermitidas = new Set(ordemDasPermissoes);

function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
        return false;
    }

    const prototipo = Object.getPrototypeOf(valor);

    return prototipo === Object.prototype || prototipo === null;
}

function criarErroLocal(mensagem, codigo) {
    const erro = new Error(mensagem);

    erro.codigo = codigo;
    erro.mensagemUsuario = mensagem;

    return erro;
}

function validarCategoriaId(categoriaId) {
    if (!Number.isSafeInteger(categoriaId) || categoriaId <= 0) {
        throw criarErroLocal('O identificador da categoria é inválido.', 'ID_CATEGORIA_INVALIDO');
    }

    return categoriaId;
}

function validarAtualizadoEm(atualizadoEm) {
    if (
        typeof atualizadoEm !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(atualizadoEm)
    ) {
        throw criarErroLocal('A versão da categoria é inválida.', 'VERSAO_CATEGORIA_INVALIDA');
    }

    const data = new Date(atualizadoEm);

    if (Number.isNaN(data.getTime()) || data.toISOString() !== atualizadoEm) {
        throw criarErroLocal('A versão da categoria é inválida.', 'VERSAO_CATEGORIA_INVALIDA');
    }

    return atualizadoEm;
}

function validarQuantidadeConfirmada(quantidadeContatosConfirmada) {
    if (quantidadeContatosConfirmada === undefined) {
        return undefined;
    }

    if (!Number.isSafeInteger(quantidadeContatosConfirmada) || quantidadeContatosConfirmada < 0) {
        throw criarErroLocal(
            'A confirmação de impacto é inválida.',
            'CONFIRMACAO_IMPACTO_INVALIDA'
        );
    }

    return quantidadeContatosConfirmada;
}

function prepararDadosCategoria(dados) {
    if (!ehObjetoSimples(dados)) {
        throw criarErroLocal('Os dados da categoria são inválidos.', 'DADOS_CATEGORIA_INVALIDOS');
    }

    const camposPermitidos = ['nome', 'dadosVisiveis'];

    const camposRecebidos = Object.keys(dados);

    const possuiCampoProibido = camposRecebidos.some((campo) => !camposPermitidos.includes(campo));

    if (
        possuiCampoProibido ||
        camposRecebidos.length !== camposPermitidos.length ||
        typeof dados.nome !== 'string' ||
        !Array.isArray(dados.dadosVisiveis)
    ) {
        throw criarErroLocal('Os dados da categoria são inválidos.', 'DADOS_CATEGORIA_INVALIDOS');
    }

    const nome = dados.nome.normalize('NFKC').trim().replace(/\s+/gu, ' ');

    const nomeInvalido =
        nome.length === 0 || [...nome].length > 15 || /[\u0000-\u001F\u007F<>]/u.test(nome);

    const permissoesInvalidas =
        dados.dadosVisiveis.length === 0 ||
        dados.dadosVisiveis.length > ordemDasPermissoes.length ||
        dados.dadosVisiveis.some(
            (permissao) => typeof permissao !== 'string' || !permissoesPermitidas.has(permissao)
        );

    if (nomeInvalido || permissoesInvalidas) {
        throw criarErroLocal('Os dados da categoria são inválidos.', 'DADOS_CATEGORIA_INVALIDOS');
    }

    const permissoesRecebidas = new Set(dados.dadosVisiveis);

    const dadosVisiveis = Object.freeze(
        ordemDasPermissoes.filter((permissao) => permissoesRecebidas.has(permissao))
    );

    return Object.freeze({
        nome,
        dadosVisiveis
    });
}

function prepararEdicaoCategoria(categoriaId, dados) {
    const id = validarCategoriaId(categoriaId);

    if (!ehObjetoSimples(dados)) {
        throw criarErroLocal('Os dados da categoria são inválidos.', 'DADOS_CATEGORIA_INVALIDOS');
    }

    const camposPermitidos = new Set([
        'nome',
        'dadosVisiveis',
        'atualizadoEm',
        'quantidadeContatosConfirmada'
    ]);

    if (Object.keys(dados).some((campo) => !camposPermitidos.has(campo))) {
        throw criarErroLocal('Os dados da categoria são inválidos.', 'DADOS_CATEGORIA_INVALIDOS');
    }

    const categoria = prepararDadosCategoria({
        nome: dados.nome,
        dadosVisiveis: dados.dadosVisiveis
    });

    const atualizadoEm = validarAtualizadoEm(dados.atualizadoEm);

    const quantidadeContatosConfirmada = validarQuantidadeConfirmada(
        dados.quantidadeContatosConfirmada
    );

    const corpo = {
        nome: categoria.nome,
        dadosVisiveis: categoria.dadosVisiveis,
        atualizadoEm
    };

    if (quantidadeContatosConfirmada !== undefined) {
        corpo.quantidadeContatosConfirmada = quantidadeContatosConfirmada;
    }

    return Object.freeze({
        categoriaId: id,
        corpo: Object.freeze(corpo)
    });
}

function prepararListaCategorias(resposta) {
    if (!Array.isArray(resposta?.categorias)) {
        throw criarErroLocal(MENSAGEM_LISTAGEM_INVALIDA, 'RESPOSTA_CATEGORIAS_INVALIDA');
    }

    try {
        return Object.freeze(
            resposta.categorias.map((categoria) => criarSupportCategory(categoria))
        );
    } catch {
        throw criarErroLocal(MENSAGEM_LISTAGEM_INVALIDA, 'RESPOSTA_CATEGORIAS_INVALIDA');
    }
}

function prepararImpactoExclusao(resposta, categoriaIdEsperado) {
    const categoria = resposta?.categoria;
    const contatos = resposta?.contatos;

    const estruturaValida =
        ehObjetoSimples(resposta) &&
        ehObjetoSimples(categoria) &&
        categoria.id === categoriaIdEsperado &&
        typeof categoria.nome === 'string' &&
        categoria.nome.trim().length > 0 &&
        categoria.nome === categoria.nome.trim() &&
        validarDataSemLancar(categoria.atualizadoEm) &&
        Number.isSafeInteger(resposta.quantidadeContatos) &&
        resposta.quantidadeContatos >= 0 &&
        Array.isArray(contatos) &&
        contatos.length === resposta.quantidadeContatos;

    if (!estruturaValida) {
        throw criarErroLocal(
            'Não foi possível carregar os dados da categoria. Tente novamente.',
            'RESPOSTA_IMPACTO_EXCLUSAO_INVALIDA'
        );
    }

    const ids = new Set();
    const contatosSeguros = [];

    for (const contato of contatos) {
        const contatoValido =
            ehObjetoSimples(contato) &&
            Number.isSafeInteger(contato.vinculoId) &&
            contato.vinculoId > 0 &&
            !ids.has(contato.vinculoId) &&
            typeof contato.nome === 'string' &&
            contato.nome.trim().length > 0 &&
            contato.nome === contato.nome.trim();

        if (!contatoValido) {
            throw criarErroLocal(
                'Não foi possível carregar os dados da categoria. Tente novamente.',
                'RESPOSTA_IMPACTO_EXCLUSAO_INVALIDA'
            );
        }

        ids.add(contato.vinculoId);

        contatosSeguros.push(
            Object.freeze({
                vinculoId: contato.vinculoId,
                nome: contato.nome
            })
        );
    }

    return Object.freeze({
        categoria: Object.freeze({
            id: categoria.id,
            nome: categoria.nome,
            atualizadoEm: categoria.atualizadoEm
        }),
        quantidadeContatos: resposta.quantidadeContatos,
        contatos: Object.freeze(contatosSeguros)
    });
}

function validarDataSemLancar(valor) {
    try {
        validarAtualizadoEm(valor);
        return true;
    } catch {
        return false;
    }
}

function prepararDecisoesExclusao(decisoes) {
    if (!Array.isArray(decisoes)) {
        throw criarErroLocal(
            'As decisões dos contatos são inválidas.',
            'DECISOES_CONTATOS_INVALIDAS'
        );
    }

    const ids = new Set();
    const decisoesSeguras = [];

    for (const decisao of decisoes) {
        const campos = ehObjetoSimples(decisao) ? Object.keys(decisao) : [];

        const decisaoValida =
            ehObjetoSimples(decisao) &&
            campos.length === 2 &&
            campos.includes('vinculoId') &&
            campos.includes('acao') &&
            Number.isSafeInteger(decisao.vinculoId) &&
            decisao.vinculoId > 0 &&
            !ids.has(decisao.vinculoId) &&
            acaoExclusaoEhValida(decisao.acao);

        if (!decisaoValida) {
            throw criarErroLocal(
                'As decisões dos contatos são inválidas.',
                'DECISOES_CONTATOS_INVALIDAS'
            );
        }

        ids.add(decisao.vinculoId);

        decisoesSeguras.push(
            Object.freeze({
                vinculoId: decisao.vinculoId,
                acao: decisao.acao
            })
        );
    }

    return Object.freeze(decisoesSeguras);
}

function prepararExclusaoCategoria(categoriaId, dados) {
    const id = validarCategoriaId(categoriaId);

    if (
        !ehObjetoSimples(dados) ||
        Object.keys(dados).length !== 2 ||
        !Object.hasOwn(dados, 'atualizadoEm') ||
        !Object.hasOwn(dados, 'decisoes')
    ) {
        throw criarErroLocal('Os dados da exclusão são inválidos.', 'DADOS_EXCLUSAO_INVALIDOS');
    }

    return Object.freeze({
        categoriaId: id,
        corpo: Object.freeze({
            atualizadoEm: validarAtualizadoEm(dados.atualizadoEm),
            decisoes: prepararDecisoesExclusao(dados.decisoes)
        })
    });
}

function prepararResultadoExclusao(resposta, categoriaIdEsperado) {
    const resultado = resposta?.resultado;

    const valido =
        ehObjetoSimples(resposta) &&
        ehObjetoSimples(resultado) &&
        resultado.categoriaId === categoriaIdEsperado &&
        Number.isSafeInteger(resultado.quantidadeAcessosRemovidos) &&
        resultado.quantidadeAcessosRemovidos >= 0 &&
        Number.isSafeInteger(resultado.quantidadeAcessosMantidos) &&
        resultado.quantidadeAcessosMantidos >= 0;

    if (!valido) {
        throw criarErroLocal(
            'Não foi possível confirmar a exclusão da categoria.',
            'RESPOSTA_EXCLUSAO_INVALIDA'
        );
    }

    return Object.freeze({
        categoriaId: resultado.categoriaId,
        quantidadeAcessosRemovidos: resultado.quantidadeAcessosRemovidos,
        quantidadeAcessosMantidos: resultado.quantidadeAcessosMantidos
    });
}

function criarSupportCategoryService({ requisicaoAutenticada } = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço de categorias.');
    }

    let criacaoEmAndamento = null;
    let chaveDaCriacao = null;

    const edicoesEmAndamento = new Map();
    const exclusoesEmAndamento = new Map();

    async function listarCategorias({ signal } = {}) {
        const opcoes = {
            metodo: 'GET',
            caminho: endpoints.categoriasPermissao
        };

        if (signal !== undefined) {
            opcoes.signal = signal;
        }

        const resposta = await requisicaoAutenticada(opcoes);

        return prepararListaCategorias(resposta);
    }

    function criarCategoria(dados) {
        const dadosSeguros = prepararDadosCategoria(dados);

        const chaveAtual = JSON.stringify(dadosSeguros);

        if (criacaoEmAndamento) {
            if (chaveAtual === chaveDaCriacao) {
                return criacaoEmAndamento;
            }

            return Promise.reject(
                criarErroLocal(
                    'Aguarde a criação da categoria atual.',
                    'CRIACAO_CATEGORIA_EM_ANDAMENTO'
                )
            );
        }

        chaveDaCriacao = chaveAtual;
        const controle = new AbortController();
        let temporizador;
        const prazo = new Promise((_, rejeitar) => {
            temporizador = setTimeout(() => {
                rejeitar(
                    criarErroLocal(
                        'Não foi possível concluir o salvamento a tempo. Tente novamente.',
                        'TEMPO_SALVAMENTO_ESGOTADO'
                    )
                );
                controle.abort();
            }, 15000);
        });
        const envio = new Promise((resolve) => {
            resolve(
                requisicaoAutenticada({
                    metodo: 'POST',
                    caminho: endpoints.categoriasPermissao,
                    corpo: dadosSeguros,
                    signal: controle.signal
                })
            );
        });
        criacaoEmAndamento = Promise.race([envio, prazo])
            .then((resposta) => criarSupportCategory(resposta?.categoria))
            .finally(() => {
                clearTimeout(temporizador);
                criacaoEmAndamento = null;
                chaveDaCriacao = null;
            });

        return criacaoEmAndamento;
    }

    function editarCategoria(categoriaId, dados) {
        const edicao = prepararEdicaoCategoria(categoriaId, dados);

        const chaveAtual = JSON.stringify(edicao.corpo);

        const edicaoAtual = edicoesEmAndamento.get(edicao.categoriaId);

        if (edicaoAtual) {
            if (edicaoAtual.chave === chaveAtual) {
                return edicaoAtual.promessa;
            }

            return Promise.reject(
                criarErroLocal(
                    'Aguarde a atualização atual da categoria.',
                    'EDICAO_CATEGORIA_EM_ANDAMENTO'
                )
            );
        }

        let promessa;

        promessa = requisicaoAutenticada({
            metodo: 'PUT',
            caminho: `${endpoints.categoriasPermissao}/${edicao.categoriaId}`,
            corpo: edicao.corpo
        })
            .then((resposta) => criarSupportCategory(resposta?.categoria))
            .finally(() => {
                const atual = edicoesEmAndamento.get(edicao.categoriaId);

                if (atual?.promessa === promessa) {
                    edicoesEmAndamento.delete(edicao.categoriaId);
                }
            });

        edicoesEmAndamento.set(edicao.categoriaId, {
            chave: chaveAtual,
            promessa
        });

        return promessa;
    }

    async function consultarImpactoExclusao(categoriaId, { signal } = {}) {
        const id = validarCategoriaId(categoriaId);

        const opcoes = {
            metodo: 'GET',
            caminho: `${endpoints.categoriasPermissao}/${id}/deletion-impact`
        };

        if (signal !== undefined) {
            opcoes.signal = signal;
        }

        const resposta = await requisicaoAutenticada(opcoes);

        return prepararImpactoExclusao(resposta, id);
    }

    function excluirCategoria(categoriaId, dados) {
        const exclusao = prepararExclusaoCategoria(categoriaId, dados);

        const chaveAtual = JSON.stringify(exclusao.corpo);

        const exclusaoAtual = exclusoesEmAndamento.get(exclusao.categoriaId);

        if (exclusaoAtual) {
            if (exclusaoAtual.chave === chaveAtual) {
                return exclusaoAtual.promessa;
            }

            return Promise.reject(
                criarErroLocal(
                    'Aguarde a exclusão atual da categoria.',
                    'EXCLUSAO_CATEGORIA_EM_ANDAMENTO'
                )
            );
        }

        let promessa;

        promessa = requisicaoAutenticada({
            metodo: 'DELETE',
            caminho: `${endpoints.categoriasPermissao}/${exclusao.categoriaId}`,
            corpo: exclusao.corpo
        })
            .then((resposta) => prepararResultadoExclusao(resposta, exclusao.categoriaId))
            .finally(() => {
                const atual = exclusoesEmAndamento.get(exclusao.categoriaId);

                if (atual?.promessa === promessa) {
                    exclusoesEmAndamento.delete(exclusao.categoriaId);
                }
            });

        exclusoesEmAndamento.set(exclusao.categoriaId, {
            chave: chaveAtual,
            promessa
        });

        return promessa;
    }

    return Object.freeze({
        criarCategoria,
        editarCategoria,
        listarCategorias,
        consultarImpactoExclusao,
        excluirCategoria
    });
}

export { criarSupportCategoryService };
