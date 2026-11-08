import { MENSAGEM_ERRO_LISTAGEM_CONTATOS } from '../constants/supportContact.constants.js';

function criarSupportContactController({ service } = {}) {
    if (typeof service?.listar !== 'function') {
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

    return Object.freeze({ listar });
}

export { criarSupportContactController };
