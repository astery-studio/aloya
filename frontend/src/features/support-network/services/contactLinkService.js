import { endpoints } from '../../../shared/services/api/endpoints';
import { corContatoEhValida, iconeContatoEhValido } from '../constants/contactAppearanceOptions';

const MENSAGEM_ERRO_ATUALIZACAO =
    'Não foi possível atualizar o vínculo deste contato. Tente novamente.';

const TIPOS_VINCULO = Object.freeze(['categoria', 'individual']);

function criarErroLocal(codigo = 'RESPOSTA_VINCULO_INVALIDA') {
    const erro = new Error(MENSAGEM_ERRO_ATUALIZACAO);
    erro.codigo = codigo;
    erro.mensagemUsuario = MENSAGEM_ERRO_ATUALIZACAO;
    return erro;
}

function ehObjeto(valor) {
    return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

function ehTexto(valor) {
    return typeof valor === 'string' && valor.trim().length > 0;
}

function normalizarPermissoes(permissoes) {
    if (!Array.isArray(permissoes) || permissoes.some((item) => !ehTexto(item))) {
        throw criarErroLocal();
    }

    return Object.freeze(permissoes.map((item) => item.trim()));
}

function normalizarCategoria(categoria) {
    if (
        !ehObjeto(categoria) ||
        !Number.isSafeInteger(categoria.id) ||
        categoria.id <= 0 ||
        !ehTexto(categoria.nome)
    ) {
        throw criarErroLocal();
    }

    return Object.freeze({
        id: categoria.id,
        nome: categoria.nome.trim(),
        permissoes: normalizarPermissoes(categoria.permissoes)
    });
}

function normalizarConfiguracao(resposta) {
    const atual = resposta?.vinculoAtual;
    const proximo = resposta?.proximoVinculo;

    if (
        !ehObjeto(resposta) ||
        !ehObjeto(resposta.contato) ||
        !Number.isSafeInteger(resposta.contato.id) ||
        resposta.contato.id <= 0 ||
        !ehTexto(resposta.contato.email) ||
        !iconeContatoEhValido(resposta.contato.iconeId) ||
        !corContatoEhValida(resposta.contato.corId) ||
        !ehObjeto(atual) ||
        !TIPOS_VINCULO.includes(atual.tipo) ||
        !ehObjeto(proximo) ||
        !TIPOS_VINCULO.includes(proximo.tipo) ||
        atual.tipo === proximo.tipo ||
        !ehTexto(resposta.versao) ||
        Number.isNaN(Date.parse(resposta.versao))
    ) {
        throw criarErroLocal();
    }

    const categoriaAtual = atual.categoria === null ? null : normalizarCategoria(atual.categoria);
    const categorias = Array.isArray(proximo.categorias)
        ? proximo.categorias.map(normalizarCategoria)
        : null;

    if (
        categorias === null ||
        (atual.tipo === 'categoria' && categoriaAtual === null) ||
        (atual.tipo === 'individual' && categoriaAtual !== null)
    ) {
        throw criarErroLocal();
    }

    return Object.freeze({
        contato: Object.freeze({
            id: resposta.contato.id,
            nome: ehTexto(resposta.contato.nome) ? resposta.contato.nome.trim() : null,
            email: resposta.contato.email.trim(),
            iconeId: resposta.contato.iconeId,
            corId: resposta.contato.corId
        }),
        vinculoAtual: Object.freeze({
            tipo: atual.tipo,
            categoria: categoriaAtual,
            permissoes: normalizarPermissoes(atual.permissoes)
        }),
        proximoVinculo: Object.freeze({
            tipo: proximo.tipo,
            permissoesPreenchidas: normalizarPermissoes(proximo.permissoesPreenchidas),
            categorias: Object.freeze(categorias)
        }),
        versao: new Date(resposta.versao).toISOString()
    });
}

function normalizarAtualizacao(resposta) {
    if (
        !ehObjeto(resposta) ||
        resposta.mensagem !== 'Vínculo atualizado com sucesso.' ||
        !ehObjeto(resposta.vinculo) ||
        !Number.isSafeInteger(resposta.vinculo.contatoId) ||
        resposta.vinculo.contatoId <= 0 ||
        !TIPOS_VINCULO.includes(resposta.vinculo.tipo)
    ) {
        throw criarErroLocal();
    }

    return Object.freeze({
        mensagem: resposta.mensagem,
        vinculo: Object.freeze({ ...resposta.vinculo })
    });
}

function validarContatoId(contatoId) {
    if (!Number.isSafeInteger(contatoId) || contatoId <= 0) {
        throw criarErroLocal('CONTATO_ID_INVALIDO');
    }
    return contatoId;
}

function criarContactLinkService({ requisicaoAutenticada } = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço de vínculo.');
    }

    let atualizacaoEmAndamento = null;

    async function consultar(contatoId, { signal } = {}) {
        const id = validarContatoId(contatoId);
        const opcoes = {
            metodo: 'GET',
            caminho: endpoints.vinculoContatoRedeApoio(id)
        };

        if (signal !== undefined) opcoes.signal = signal;

        return normalizarConfiguracao(await requisicaoAutenticada(opcoes));
    }

    function atualizar(contatoId, alteracao) {
        let id;
        try {
            id = validarContatoId(contatoId);
        } catch (erro) {
            return Promise.reject(erro);
        }

        if (atualizacaoEmAndamento) return atualizacaoEmAndamento;

        atualizacaoEmAndamento = Promise.resolve()
            .then(() =>
                requisicaoAutenticada({
                    metodo: 'PATCH',
                    caminho: endpoints.vinculoContatoRedeApoio(id),
                    corpo: alteracao
                })
            )
            .then(normalizarAtualizacao)
            .finally(() => {
                atualizacaoEmAndamento = null;
            });

        return atualizacaoEmAndamento;
    }

    return Object.freeze({ atualizar, consultar });
}

export {
    MENSAGEM_ERRO_ATUALIZACAO,
    criarContactLinkService,
    normalizarAtualizacao,
    normalizarConfiguracao
};
