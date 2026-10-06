import { criarCyclePredictionService } from '../../../../src/features/cycles/services/cyclePredictionService';

test('busca a previsão pela rota autenticada', async () => {
    const previsao = { status: 'DISPONIVEL', proximoInicioEstimado: '2026-10-29' };
    const requisicaoAutenticada = jest.fn().mockResolvedValue({ previsao });
    const service = criarCyclePredictionService({ requisicaoAutenticada });

    await expect(service.buscar()).resolves.toBe(previsao);
    expect(requisicaoAutenticada).toHaveBeenCalledWith({
        caminho: '/cycles/prediction',
        signal: undefined
    });
});

test('rejeita respostas sem contrato de previsão', async () => {
    const service = criarCyclePredictionService({
        requisicaoAutenticada: jest.fn().mockResolvedValue({})
    });

    await expect(service.buscar()).rejects.toThrow('previsão inválida');
});
