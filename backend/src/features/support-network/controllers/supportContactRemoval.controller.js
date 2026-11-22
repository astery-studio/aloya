import {
    MENSAGEM_ERRO_DESATIVACAO_CONTATO,
    MENSAGEM_ERRO_REMOCAO_CONTATO,
    MENSAGEM_SUCESSO_CANCELAMENTO_CONVITE,
    MENSAGEM_SUCESSO_DESATIVACAO_CONTATO,
    MENSAGEM_SUCESSO_REMOCAO_CONTATO
} from '../constants/supportContactRemoval.constants.js';

function criarSupportContactRemovalController({
    service,
    contactValidator,
    removalValidator
} = {}) {
    if (
        typeof service?.desativar !== 'function' ||
        typeof service?.remover !== 'function' ||
        typeof contactValidator?.validarContatoId !== 'function' ||
        typeof removalValidator?.validarConfirmacao !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar o controller de remoção de contato.');
    }

    function validarRequisicao(req, res) {
        const contato = contactValidator.validarContatoId(req.params?.contatoId);
        if (!contato.valido) {
            res.status(422).json({
                erro: {
                    codigo: 'ERRO_VALIDACAO',
                    mensagem: contato.erro.mensagem,
                    detalhes: [contato.erro]
                }
            });
            return null;
        }

        const confirmacao = removalValidator.validarConfirmacao(req.body);
        if (!confirmacao.valido) {
            res.status(422).json({
                erro: {
                    codigo: 'ERRO_VALIDACAO',
                    mensagem: confirmacao.erros[0].mensagem,
                    detalhes: confirmacao.erros
                }
            });
            return null;
        }

        return contato.contatoId;
    }

    async function remover(req, res, next) {
        try {
            const contatoId = validarRequisicao(req, res);
            if (contatoId === null) return res;

            const remocao = await service.remover({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                contatoId
            });

            const mensagem =
                remocao.statusAnterior === 'pendente'
                    ? MENSAGEM_SUCESSO_CANCELAMENTO_CONVITE
                    : MENSAGEM_SUCESSO_REMOCAO_CONTATO;

            res.set('Cache-Control', 'no-store');
            return res.status(200).json({
                mensagem,
                remocao
            });
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_REMOCAO_CONTATO;
            return next(erro);
        }
    }

    async function desativar(req, res, next) {
        try {
            const contatoId = validarRequisicao(req, res);
            if (contatoId === null) return res;

            const remocao = await service.desativar({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                contatoId
            });

            res.set('Cache-Control', 'no-store');
            return res.status(200).json({
                mensagem: MENSAGEM_SUCESSO_DESATIVACAO_CONTATO,
                remocao
            });
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_DESATIVACAO_CONTATO;
            return next(erro);
        }
    }

    return Object.freeze({ desativar, remover });
}

export { criarSupportContactRemovalController };
