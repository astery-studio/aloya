import {
    MENSAGEM_ERRO_LISTAGEM_CONTATOS,
    MENSAGEM_ERRO_REENVIO_CONVITE
} from '../constants/supportContact.constants.js';

function criarSupportContactController({
    service,
    resendService,
    responseService,
    validator
} = {}) {
    if (
        typeof service?.listar !== 'function' ||
        typeof service?.listarRecebidos !== 'function' ||
        typeof resendService?.reenviar !== 'function' ||
        typeof responseService?.responderRecebido !== 'function' ||
        typeof validator?.validarContatoId !== 'function' ||
        typeof validator?.validarRespostaConvite !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar o controller de contatos.');
    }

    async function listarRecebidos(req, res, next) {
        try {
            const resultado = await service.listarRecebidos({
                usuarioId: req.usuario.id,
                papel: req.usuario.papel
            });

            res.set('Cache-Control', 'private, no-store');
            return res.status(200).json(resultado);
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_LISTAGEM_CONTATOS;
            return next(erro);
        }
    }

    async function responderRecebido(req, res, next) {
        let acao = null;

        try {
            const convite = validator.validarContatoId(req.params.conviteId);
            const resposta = validator.validarRespostaConvite(req.body);

            if (!convite.valido || !resposta.valido) {
                const erroValidacao = convite.valido ? resposta.erro : convite.erro;
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: erroValidacao.mensagem,
                        detalhes: [erroValidacao]
                    }
                });
            }

            acao = resposta.acao;
            const resultado = await responseService.responderRecebido({
                conviteId: convite.contatoId,
                usuarioId: req.usuario.id,
                acao
            });

            res.set('Cache-Control', 'no-store');
            return res.status(200).json(resultado);
        } catch (erro) {
            if (!erro.status) {
                erro.mensagemUsuario =
                    acao === 'recusar'
                        ? 'Ocorreu um erro ao recusar convite. Verifique sua conexão e tente novamente.'
                        : 'Ocorreu um erro ao aceitar convite. Verifique sua conexão e tente novamente.';
            }
            return next(erro);
        }
    }

    async function listar(req, res, next) {
        try {
            const resultado = await service.listar({
                titularId: req.usuario.id,
                papel: req.usuario.papel
            });

            res.set('Cache-Control', 'private, no-store');
            return res.status(200).json(resultado);
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_LISTAGEM_CONTATOS;
            return next(erro);
        }
    }

    async function reenviarConvite(req, res, next) {
        try {
            const validacao = validator.validarContatoId(req.params.contatoId);
            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: validacao.erro.mensagem,
                        detalhes: [validacao.erro]
                    }
                });
            }

            const convite = await resendService.reenviar({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                contatoId: validacao.contatoId
            });

            res.set('Cache-Control', 'no-store');
            return res.status(200).json({
                mensagem: 'Convite reenviado com sucesso.',
                convite
            });
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_REENVIO_CONVITE;
            return next(erro);
        }
    }

    return Object.freeze({
        listar,
        listarRecebidos,
        reenviarConvite,
        responderRecebido
    });
}

export { criarSupportContactController };
