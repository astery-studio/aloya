import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useCycleParameters } from '../../../../src/features/cycles/hooks/useCycleParameters';

const parametros = { duracaoCicloInformada: 28, duracaoMenstruacaoInformada: 5, duracaoLuteaInformada: 14 };

async function preparar(atualizar, callbacks = {}) {
    const service = { buscar: jest.fn().mockResolvedValue(parametros), atualizar };
    const hook = await renderHook(() => useCycleParameters({ service, ...callbacks }));
    await waitFor(() => expect(hook.result.current.carregando).toBe(false));
    await act(() => hook.result.current.alterar('duracaoCicloInformada', 30));
    return { ...hook, service };
}

test('salva e fecha a confirmação', async () => {
    const onAtualizados = jest.fn();
    const atualizado = { ...parametros, duracaoCicloInformada: 30 };
    const { result } = await preparar(jest.fn().mockResolvedValue(atualizado), { onAtualizados });
    await act(() => result.current.salvar());
    expect(result.current.sucesso).toBe(true);
    expect(onAtualizados).toHaveBeenCalledWith(atualizado);
    await act(() => result.current.fecharSucesso());
    expect(result.current.sucesso).toBe(false);
});

test('apresenta e fecha uma falha de salvamento', async () => {
    const { result } = await preparar(jest.fn().mockRejectedValue({ mensagemUsuario: 'Falhou' }));
    await act(() => result.current.salvar());
    expect(result.current.erroSalvar).toBe('Falhou');
    await act(() => result.current.fecharErro());
    expect(result.current.erroSalvar).toBeNull();
});

test('expira a sessão ao salvar', async () => {
    const onSessaoExpirada = jest.fn();
    const atualizar = jest.fn().mockRejectedValue({ status: 401 });
    const { result } = await preparar(atualizar, { onSessaoExpirada });
    await act(() => result.current.salvar());
    expect(onSessaoExpirada).toHaveBeenCalled();
    expect(atualizar).toHaveBeenCalledTimes(1);
});
