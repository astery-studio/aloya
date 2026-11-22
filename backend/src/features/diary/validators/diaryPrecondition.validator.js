import { AppError } from '../../../shared/errors/AppError.js';

function validarIfMatch(valor) {
    const correspondencia = typeof valor === 'string' && valor.match(/^"(0|[1-9]\d*)"$/);
    const versao = correspondencia ? Number(correspondencia[1]) : -1;
    if (!Number.isSafeInteger(versao) || versao < 0) {
        throw new AppError(
            'Informe a versão atual do registro no cabeçalho If-Match.',
            428,
            'PRECONDICAO_DIARIO_OBRIGATORIA'
        );
    }
    return versao;
}

export { validarIfMatch };
