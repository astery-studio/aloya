import { endpoints } from '../../../shared/services/api/endpoints';

const MENSAGEM_ERRO_LISTAGEM =
    'Não foi possível carregar sua Rede de Apoio no momento. Tente novamente.';
const MENSAGEM_ERRO_RESPOSTA = 'Não foi possível responder ao convite no momento. Tente novamente.';

function criarErroLocal(mensagem, codigo) {
    const erro = new Error(mensagem);
    erro.codigo = codigo;
    erro.mensagemUsuario = mensagem;
    return erro;
}

function ehObjeto(valor) {
    return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

function normalizarConviteRecebido(contato) {
    const idValido = Number.isSafeInteger(contato?.id) && contato.id > 0;
    const statusValido = ['pendente', 'ativo'].includes(contato?.status);
    const identificacaoValida =
        typeof contato?.identificacao === 'string' && contato.identificacao.trim().length > 0;
    const vinculoValido =
        ehObjeto(contato?.vinculo) &&
        ['categoria', 'individual'].includes(contato.vinculo.tipo) &&
        Array.isArray(contato.vinculo.permissoes);

    if (!idValido || !statusValido || !identificacaoValida || !vinculoValido) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_RECEBIDOS_INVALIDA');
    }

    return Object.freeze({
        ...contato,
        identificacao: contato.identificacao.trim(),
        vinculo: Object.freeze({
            ...contato.vinculo,
            permissoes: Object.freeze(
                contato.vinculo.permissoes.filter((item) => typeof item === 'string')
            )
        })
    });
}

function normalizarListagem(resposta) {
    if (!ehObjeto(resposta) || !Array.isArray(resposta.contatos) || !ehObjeto(resposta.resumo)) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_RECEBIDOS_INVALIDA');
    }

    const contatos = Object.freeze(resposta.contatos.map(normalizarConviteRecebido));
    const resumoCalculado = {
        total: contatos.length,
        pendentes: contatos.filter(({ status }) => status === 'pendente').length,
        ativos: contatos.filter(({ status }) => status === 'ativo').length
    };

    if (
        resposta.resumo.total !== resumoCalculado.total ||
        resposta.resumo.pendentes !== resumoCalculado.pendentes ||
        resposta.resumo.ativos !== resumoCalculado.ativos
    ) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_RECEBIDOS_INVALIDA');
    }

    return Object.freeze({
        contatos,
        resumo: Object.freeze(resumoCalculado)
    });
}

function validarConviteId(conviteId) {
    if (!Number.isSafeInteger(conviteId) || conviteId <= 0) {
        throw criarErroLocal('Convite inválido.', 'CONVITE_ID_INVALIDO');
    }
    return conviteId;
}

function validarAcao(acao) {
    if (!['aceitar', 'recusar'].includes(acao)) {
        throw criarErroLocal('Escolha aceitar ou recusar o convite.', 'ACAO_CONVITE_INVALIDA');
    }
    return acao;
}

function normalizarResposta(resposta, acao) {
    const statusEsperado = acao === 'aceitar' ? 'ativo' : 'recusado';
    const mensagemEsperada =
        acao === 'aceitar' ? 'Convite aceito com sucesso.' : 'Convite recusado com sucesso.';

    if (
        !ehObjeto(resposta) ||
        resposta.status !== statusEsperado ||
        resposta.mensagem !== mensagemEsperada
    ) {
        throw criarErroLocal(MENSAGEM_ERRO_RESPOSTA, 'RESPOSTA_CONVITE_INVALIDA');
    }

    return Object.freeze({ status: resposta.status, mensagem: resposta.mensagem });
}

function criarReceivedContactsService({ requisicaoAutenticada } = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço de contatos recebidos.');
    }

    const respostasEmAndamento = new Map();

    async function listarRecebidos({ signal } = {}) {
        const opcoes = {
            metodo: 'GET',
            caminho: endpoints.contatosRecebidos
        };
        if (signal !== undefined) opcoes.signal = signal;

        return normalizarListagem(await requisicaoAutenticada(opcoes));
    }

    function responderConvite(conviteId, acao) {
        let id;
        let acaoValidada;

        try {
            id = validarConviteId(conviteId);
            acaoValidada = validarAcao(acao);
        } catch (erro) {
            return Promise.reject(erro);
        }

        if (respostasEmAndamento.has(id)) {
            return respostasEmAndamento.get(id);
        }

        const requisicao = Promise.resolve()
            .then(() =>
                requisicaoAutenticada({
                    metodo: 'POST',
                    caminho: endpoints.responderContatoRecebido(id),
                    corpo: { acao: acaoValidada }
                })
            )
            .then((resposta) => normalizarResposta(resposta, acaoValidada))
            .finally(() => respostasEmAndamento.delete(id));

        respostasEmAndamento.set(id, requisicao);
        return requisicao;
    }

    return Object.freeze({ listarRecebidos, responderConvite });
}

export {
    MENSAGEM_ERRO_LISTAGEM,
    MENSAGEM_ERRO_RESPOSTA,
    criarReceivedContactsService,
    normalizarConviteRecebido,
    normalizarListagem
};
