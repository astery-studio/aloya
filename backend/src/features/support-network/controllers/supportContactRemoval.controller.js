import {
    MENSAGEM_ERRO_REMOCAO_CONTATO,
    MENSAGEM_SUCESSO_REMOCAO_CONTATO
} from '../constants/supportContactRemoval.constants.js';

function criarSupportContactRemovalController({
    service,
    contactValidator,
    removalValidator
} = {}) {
    if (
        typeof service?.remover !== 'function' ||
        typeof contactValidator?.validarContatoId !== 'function' ||
        typeof removalValidator?.validarConfirmacao !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar o controller de remoção de contato.');
    }

    async function remover(req, res, next) {
        try {
            const contato = contactValidator.validarContatoId(req.params?.contatoId);
            if (!contato.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: contato.erro.mensagem,
                        detalhes: [contato.erro]
                    }
                });
            }

            const confirmacao = removalValidator.validarConfirmacao(req.body);
            if (!confirmacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: confirmacao.erros[0].mensagem,
                        detalhes: confirmacao.erros
                    }
                });
            }

            const remocao = await service.remover({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                contatoId: contato.contatoId
            });

            res.set('Cache-Control', 'no-store');
            return res.status(200).json({
                mensagem: MENSAGEM_SUCESSO_REMOCAO_CONTATO,
                remocao
            });
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_REMOCAO_CONTATO;
            return next(erro);
        }
    }

    return Object.freeze({ remover });
}

export { criarSupportContactRemovalController };
