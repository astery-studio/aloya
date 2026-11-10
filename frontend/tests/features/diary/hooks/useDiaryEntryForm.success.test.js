import { act, renderHook } from '@testing-library/react-native';

jest.mock('../../../../src/features/diary/utils/diaryDate', () => ({
    ...jest.requireActual('../../../../src/features/diary/utils/diaryDate'),
    obterHojeDiario: () => '2026-11-09'
}));

import { useDiaryEntryForm } from '../../../../src/features/diary/hooks/useDiaryEntryForm';

const catalogo = {
    macrocategorias: [
        {
            id: 'corpo',
            ativa: true,
            categorias: [{ id: 'sintomas', tipoValor: 'opcoes', ativaEfetiva: true }]
        }
    ]
};

test('valida, corrige e salva um registro', async () => {
    const registro = { id: 1, data: '2026-11-09', categorias: [] };
    const service = { criarRegistro: jest.fn().mockResolvedValue(registro) };
    const onCriado = jest.fn();
    const { result } = await renderHook(() =>
        useDiaryEntryForm({ ativo: true, catalogo, service, onCriado })
    );

    await act(async () => expect(await result.current.salvar()).toBe(false));
    expect(result.current.erros.conteudo).toBeDefined();
    await act(() => result.current.alterarValor('sintomas', ['colica']));
    expect(result.current.erros.conteudo).toBeUndefined();
    await act(async () => expect(await result.current.salvar()).toBe(true));

    expect(service.criarRegistro).toHaveBeenCalledWith({
        data: '2026-11-09',
        fusoHorario: expect.any(String),
        categorias: [{ categoriaId: 'sintomas', opcoes: ['colica'] }]
    });
    expect(onCriado).toHaveBeenCalledWith(registro);
    expect(result.current.salvando).toBe(false);
});

test('reinicia os valores sempre que o modal abre', async () => {
    const { result, rerender } = await renderHook(
        ({ ativo }) => useDiaryEntryForm({ ativo, catalogo }),
        { initialProps: { ativo: false } }
    );
    await act(() => result.current.alterarValor('sintomas', ['colica']));
    await act(() => result.current.setData('2026-11-08'));
    await rerender({ ativo: true });
    expect(result.current).toMatchObject({
        data: '2026-11-09',
        valores: {},
        erros: {},
        salvando: false
    });
});

test('não salva sem serviço configurado', async () => {
    const { result } = await renderHook(() =>
        useDiaryEntryForm({ ativo: true, catalogo })
    );
    await expect(result.current.salvar()).resolves.toBe(false);
});
