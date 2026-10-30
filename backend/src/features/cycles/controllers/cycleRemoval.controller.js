import { AppError } from '../../../shared/errors/AppError.js';

function validarService(cycleRemovalService) {
    if (
        typeof cycleRemovalService?.removerDia !== 'function' ||
        typeof cycleRemovalService?.excluirCiclo !== 'function'
    ) {
        throw new TypeError('O serviço de remoção de ciclos é inválido.');
    }
}

function tratarFalha(next, erro) {
    if (erro instanceof AppError) return next(erro);

    const falha = new AppError(
        'Não foi possível excluir o registro de menstruação. Tente novamente.',
        500,
        'ERRO_REMOCAO_CICLO'
    );
    falha.mensagemUsuario = falha.message;
    return next(falha);
}

function criarCycleRemovalController({ cycleRemovalService } = {}) {
    validarService(cycleRemovalService);

    async function removerDia(req, res, next) {
        try {
            const resultado = await cycleRemovalService.removerDia({
                usuarioId: req.usuario.id,
                cicloId: req.params.cicloId,
                data: req.params.data
            });

            res.set('Cache-Control', 'no-store');
            return res.status(200).json(resultado);
        } catch (erro) {
            return tratarFalha(next, erro);
        }
    }

    async function excluirCiclo(req, res, next) {
        try {
            const resultado = await cycleRemovalService.excluirCiclo({
                usuarioId: req.usuario.id,
                cicloId: req.params.cicloId
            });

            res.set('Cache-Control', 'no-store');
            return res.status(200).json(resultado);
        } catch (erro) {
            return tratarFalha(next, erro);
        }
    }

    return Object.freeze({ removerDia, excluirCiclo });
}

export { criarCycleRemovalController };
