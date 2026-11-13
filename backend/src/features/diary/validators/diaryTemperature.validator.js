import { AppError } from '../../../shared/errors/AppError.js';

function validarTemperatura(entrada, decimal) {
    if (decimal.valorEscalado < 320 || decimal.valorEscalado > 420) {
        throw new AppError(
            'Informe uma temperatura entre 32,0 e 42,0 °C.',
            422,
            'TEMPERATURA_FORA_INTERVALO_TECNICO'
        );
    }
    const perturbada = entrada.perturbada ?? false;
    const motivo = entrada.motivoPerturbacao;
    if (typeof perturbada !== 'boolean') {
        throw new AppError('Informe se a medição foi perturbada.', 422, 'MEDICAO_TERMICA_INVALIDA');
    }
    if (
        motivo !== undefined &&
        (!perturbada ||
            typeof motivo !== 'string' ||
            [...motivo].length < 1 ||
            [...motivo].length > 200)
    ) {
        throw new AppError(
            'Informe um motivo válido para a perturbação.',
            422,
            'MEDICAO_TERMICA_INVALIDA'
        );
    }
    return {
        ...decimal,
        medicaoTemperatura: {
            valorOriginal: String(entrada.valor),
            unidade: 'celsius',
            precisaoCasas: decimal.casasDecimais,
            perturbada,
            motivoPerturbacao: motivo ?? null,
            estadoUtilizacao: perturbada ? 'nao_utilizada_interferencia' : 'elegivel'
        }
    };
}

export { validarTemperatura };
