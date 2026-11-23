import {
    MENSAGEM_ERRO_ATUALIZACAO_VINCULO,
    MENSAGEM_SUCESSO_ATUALIZACAO_VINCULO
} from '../constants/contactLink.constants.js';

function criarContactLinkController({ service, contactValidator, linkValidator } = {}) {
    if (
        typeof service?.consultar !== 'function' ||
        typeof service?.atualizar !== 'function' ||
        typeof contactValidator?.validarContatoId !== 'function' ||
        typeof linkValidator?.validarAtualizacao !== 'function'
    ) {
        throw new TypeError('Não foi possível configurar o controller de vínculo.');
    }

    function validarContato(req, res) {
        const validacao = contactValidator.validarContatoId(req.params?.contatoId);
        if (validacao.valido) return validacao.contatoId;

        res.status(422).json({
            erro: {
                codigo: 'ERRO_VALIDACAO',
                mensagem: validacao.erro.mensagem,
                detalhes: [validacao.erro]
            }
        });
        return null;
    }

    async function consultar(req, res, next) {
        try {
            const contatoId = validarContato(req, res);
            if (contatoId === null) return res;

            const configuracao = await service.consultar({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                contatoId
            });

            res.set('Cache-Control', 'private, no-store');
            return res.status(200).json(configuracao);
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_ATUALIZACAO_VINCULO;
            return next(erro);
        }
    }

    async function atualizar(req, res, next) {
        try {
            const contatoId = validarContato(req, res);
            if (contatoId === null) return res;

            const validacao = linkValidator.validarAtualizacao(req.body);
            if (!validacao.valido) {
                return res.status(422).json({
                    erro: {
                        codigo: 'ERRO_VALIDACAO',
                        mensagem: validacao.erros[0].mensagem,
                        detalhes: validacao.erros
                    }
                });
            }

            const vinculo = await service.atualizar({
                titularId: req.usuario.id,
                papel: req.usuario.papel,
                contatoId,
                ...validacao.dados
            });

            res.set('Cache-Control', 'no-store');
            return res.status(200).json({
                mensagem: MENSAGEM_SUCESSO_ATUALIZACAO_VINCULO,
                vinculo
            });
        } catch (erro) {
            if (!erro.status) erro.mensagemUsuario = MENSAGEM_ERRO_ATUALIZACAO_VINCULO;
            return next(erro);
        }
    }

    return Object.freeze({ atualizar, consultar });
}

export { criarContactLinkController };
