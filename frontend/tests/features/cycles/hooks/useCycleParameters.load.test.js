import { renderHook, waitFor } from '@testing-library/react-native';

import { useCycleParameters } from '../../../../src/features/cycles/hooks/useCycleParameters';

const parametros = {
    duracaoCicloInformada: 28,
    duracaoMenstruacaoInformada: 5,
    duracaoLuteaInformada: 14
};

test('carrega parâmetros e permite tentar novamente', async () => {
    const service = { buscar: jest.fn().mockResolvedValue(parametros) };
    const { result } = await renderHook(() => useCycleParameters({ service }));
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.valores).toEqual(parametros);
    result.current.tentarNovamente();
    await waitFor(() => expect(service.buscar).toHaveBeenCalledTimes(2));
});

test('trata falha de carregamento e sessão expirada', async () => {
    const onSessaoExpirada = jest.fn();
    const service = { buscar: jest.fn().mockRejectedValue(new Error('rede')) };
    const { result, rerender } = await renderHook(
        ({ atual }) => useCycleParameters({ service: atual, onSessaoExpirada }),
        { initialProps: { atual: service } }
    );
    await waitFor(() => expect(result.current.erroCarregamento).toBe(true));
    const expirado = { buscar: jest.fn().mockRejectedValue({ status: 401 }) };
    await rerender({ atual: expirado });
    await waitFor(() => expect(onSessaoExpirada).toHaveBeenCalled());
});

test('ignora cancelamento da consulta', async () => {
    const service = { buscar: jest.fn().mockRejectedValue({ name: 'AbortError' }) };
    const { result } = await renderHook(() => useCycleParameters({ service }));
    await waitFor(() => expect(service.buscar).toHaveBeenCalled());
    expect(result.current.erroCarregamento).toBe(false);
});
