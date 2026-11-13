import { AppError } from '../../../shared/errors/AppError.js';

function traduzirErroMutacao(erro) {
    if (erro?.code === 'P2002') {
        return new AppError(
            'Já existe um registro para esta data.',
            409,
            'REGISTRO_DIARIO_DUPLICADO'
        );
    }
    if (['P2025', 'P2034'].includes(erro?.code)) {
        return new AppError(
            'O registro foi alterado em outro dispositivo.',
            409,
            'CONFLITO_DIARIO'
        );
    }
    return erro;
}

function validarDependenciasEdicao({ prisma, bootstrap, phaseService, thermalRecalculation }) {
    if (
        typeof prisma?.$transaction !== 'function' ||
        !bootstrap?.garantir ||
        !phaseService?.resolver ||
        !thermalRecalculation?.recalcularPorDatas
    ) {
        throw new TypeError('Não foi possível configurar a edição do Diário.');
    }
}

export { traduzirErroMutacao, validarDependenciasEdicao };
