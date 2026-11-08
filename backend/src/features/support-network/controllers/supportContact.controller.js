import {
    MENSAGEM_ERRO_LISTAGEM_CONTATOS,
    MENSAGEM_ERRO_REENVIO_CONVITE
} from '../constants/supportContact.constants.js';

function criarSupportContactController({ service, resendService, validator } = {}) {
    if (
        typeof service?.listar !== 'function' ||
        typeof resendService?.reenviar !== 'function' ||
        typeof validator?.validarContatoId !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar o controller de contatos.');
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

    return Object.freeze({ listar, reenviarConvite });
}

export { criarSupportContactController };
