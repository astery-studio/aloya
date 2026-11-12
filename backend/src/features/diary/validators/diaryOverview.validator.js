// Valida a fase usada para calcular o resumo personalizado do Diário.
import { AppError } from '../../../shared/errors/AppError.js';

const FASES = new Set(['menstrual', 'folicular', 'ovulatoria', 'lutea']);

function validarResumoDiario(query = {}) {
    if (
        !query ||
        typeof query !== 'object' ||
        Array.isArray(query) ||
        Object.keys(query).some((campo) => campo !== 'fase') ||
        !FASES.has(query.fase)
    ) {
        throw new AppError('Informe uma fase válida.', 422, 'FASE_RESUMO_DIARIO_INVALIDA');
    }
    return { fase: query.fase };
}

export { validarResumoDiario };
