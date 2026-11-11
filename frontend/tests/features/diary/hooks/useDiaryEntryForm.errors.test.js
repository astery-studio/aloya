import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
    MENSAGEM_SALVAMENTO,
    useDiaryEntryForm
} from '../../../../src/features/diary/hooks/useDiaryEntryForm';

const catalogo = {
    macrocategorias: [
        {
            id: 'corpo',
            ativa: true,
            categorias: [{ id: 'sintomas', tipoValor: 'opcoes', ativaEfetiva: true }]
        }
    ]
};

async function formularioPreenchido(service, extras = {}) {
    const hook = await renderHook(() =>
        useDiaryEntryForm({ ativo: true, catalogo, service, ...extras })
    );
    await act(() => hook.result.current.alterarValor('sintomas', ['colica']));
    return hook;
}

test.each([{ mensagemUsuario: 'Falha conhecida.' }, new Error('interno')])(
    'apresenta falha de salvamento %#',
    async (falha) => {
        const service = { criarRegistro: jest.fn().mockRejectedValue(falha) };
        const { result } = await formularioPreenchido(service);
        await act(async () => expect(await result.current.salvar()).toBe(false));
        expect(result.current.erros).toEqual({});
        expect(result.current.erroSalvamento).toBe(MENSAGEM_SALVAMENTO);
        expect(result.current.salvando).toBe(false);
        await act(() => result.current.limparErroSalvamento());
        expect(result.current.erroSalvamento).toBeNull();
    }
);

test('encerra a sessão ao receber erro 401', async () => {
    const onSessaoExpirada = jest.fn();
    const service = { criarRegistro: jest.fn().mockRejectedValue({ status: 401 }) };
    const { result } = await formularioPreenchido(service, { onSessaoExpirada });
    await act(() => result.current.salvar());
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
});

test('impede dois salvamentos simultâneos', async () => {
    let resolver;
    const service = {
        criarRegistro: jest.fn(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        )
    };
    const { result } = await formularioPreenchido(service);
    let primeiro;
    await act(() => {
        primeiro = result.current.salvar();
    });
    await waitFor(() => expect(result.current.salvando).toBe(true));
    await expect(result.current.salvar()).resolves.toBe(false);
    await act(() => resolver({ id: 1, data: '2026-11-09' }));
    await act(() => primeiro);
    expect(service.criarRegistro).toHaveBeenCalledTimes(1);
});
