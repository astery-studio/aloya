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

export { traduzirErroMutacao };
