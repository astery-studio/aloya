import { validarId } from './diaryHistory.controller.js';
import { validarIfMatch } from '../validators/diaryPrecondition.validator.js';

function criarDiaryMutationController({ editService, deletionService, validarEdicao } = {}) {
    async function editar(req, res, next) {
        try {
            const registro = await editService.editar(
                req.usuario.id,
                validarId(req.params.id),
                validarIfMatch(req.headers['if-match']),
                validarEdicao(req.body)
            );
            res.set('ETag', `"${registro.versao}"`);
            return res.status(200).json(registro);
        } catch (erro) {
            return next(erro);
        }
    }

    async function excluir(req, res, next) {
        try {
            await deletionService.excluir(
                req.usuario.id,
                validarId(req.params.id),
                validarIfMatch(req.headers['if-match'])
            );
            return res.status(204).send();
        } catch (erro) {
            return next(erro);
        }
    }

    return { editar, excluir };
}

export { criarDiaryMutationController };
