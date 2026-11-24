import { paraDataUtc } from './cyclePresentation';

const FASES_CONHECIDAS = new Set(['menstrual', 'folicular', 'ovulatoria', 'lutea']);

function dataEstaNoIntervalo(data, intervalo) {
    const referencia = paraDataUtc(data);
    const inicio = paraDataUtc(intervalo?.inicio);
    const fim = paraDataUtc(intervalo?.fim);
    return Boolean(referencia && inicio && fim && referencia >= inicio && referencia <= fim);
}

function criarCycleHomeViewModel({ previsao, fase, dataSelecionada, janelaFertil }) {
    const status = previsao?.status;
    const semCiclo = !previsao;
    const dadosInsuficientes = status === 'DADOS_INSUFICIENTES';
    const previsaoParcial = status === 'PARCIALMENTE_DISPONIVEL';
    const previsaoUltrapassada = status === 'PREVISAO_ULTRAPASSADA';
    const faseConhecida = FASES_CONHECIDAS.has(fase);
    const nivelConfiabilidade = previsao?.confiabilidadeMenstrual?.nivel?.toLowerCase() ?? null;
    const intervaloFertil = janelaFertil ?? previsao?.janelaFertilEstimada;

    return {
        estado: semCiclo ? 'semCiclo' : dadosInsuficientes ? 'dadosInsuficientes' : 'comCiclo',
        fase: faseConhecida ? fase : 'desconhecida',
        faseConhecida,
        nivelConfiabilidade,
        previsaoIncerta: previsaoParcial || previsaoUltrapassada,
        janelaFertilAtiva:
            fase === 'ovulatoria' || dataEstaNoIntervalo(dataSelecionada, intervaloFertil)
    };
}

export { criarCycleHomeViewModel };
