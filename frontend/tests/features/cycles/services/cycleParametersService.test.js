import { criarCycleParametersService } from '../../../../src/features/cycles/services/cycleParametersService';
import { endpoints } from '../../../../src/shared/services/api/endpoints';

const parametros = {
    duracaoCicloInformada: 30,
    duracaoMenstruacaoInformada: 6,
    duracaoLuteaInformada: 13
};

describe('cycleParametersService', () => {
    test('rejeita configuração sem cliente HTTP', () => {
        expect(() => criarCycleParametersService()).toThrow('configurar');
    });

    test('consulta sem fabricar um signal ausente', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({ parametros });
        const service = criarCycleParametersService({ requisicaoAutenticada });
        await service.buscar();
        expect(requisicaoAutenticada).toHaveBeenCalledWith({ caminho: endpoints.parametrosCiclo });
    });
    test('consulta os parâmetros com cancelamento', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({ parametros });
        const service = criarCycleParametersService({ requisicaoAutenticada });
        const signal = new AbortController().signal;

        await expect(service.buscar({ signal })).resolves.toEqual(parametros);
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            caminho: endpoints.parametrosCiclo,
            signal
        });
    });

    test('atualiza usando somente os campos permitidos', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({ parametros });
        const service = criarCycleParametersService({ requisicaoAutenticada });

        await expect(service.atualizar(parametros)).resolves.toEqual(parametros);
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'PATCH',
            caminho: endpoints.parametrosCiclo,
            corpo: parametros
        });
    });

    test('reaproveita a atualização enquanto ela está em andamento', async () => {
        let concluir;
        const requisicaoAutenticada = jest.fn(
            () =>
                new Promise((resolve) => {
                    concluir = resolve;
                })
        );
        const service = criarCycleParametersService({ requisicaoAutenticada });
        const primeira = service.atualizar(parametros);
        const segunda = service.atualizar(parametros);

        expect(segunda).toBe(primeira);
        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);
        concluir({ parametros });
        await primeira;
    });
});
