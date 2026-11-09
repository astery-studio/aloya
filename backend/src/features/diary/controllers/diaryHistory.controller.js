import { AppError } from '../../../shared/errors/AppError.js';

function validarId(texto) {
    if (!/^\d+$/.test(texto)) {
        throw new AppError('Registro não encontrado.', 404, 'REGISTRO_DIARIO_NAO_ENCONTRADO');
    }
    const id = Number(texto);
    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError('Registro não encontrado.', 404, 'REGISTRO_DIARIO_NAO_ENCONTRADO');
    }
    return id;
}

function criarDiaryHistoryController({ historyService, detailService, validarHistorico } = {}) {
    async function listar(req, res, next) {
        try {
            const consulta = validarHistorico(req.query);
            const pagina = await historyService.listar(req.usuario.id, consulta);
            return res.status(200).json(pagina);
        } catch (erro) {
            return next(erro);
        }
    }

    async function buscar(req, res, next) {
        try {
            const registro = await detailService.buscar(req.usuario.id, validarId(req.params.id));
            res.set('ETag', `"${registro.versao}"`);
            return res.status(200).json(registro);
        } catch (erro) {
            return next(erro);
        }
    }

    return { listar, buscar };
}

export { criarDiaryHistoryController, validarId };
