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

test('inicia a criação com a data recebida da tela de origem', async () => {
    const { result } = await renderHook(() =>
        useDiaryEntryForm({
            ativo: true,
            dataInicial: '2026-11-05',
            catalogo
        })
    );

    expect(result.current.data).toBe('2026-11-05');
});

test('não salva sem serviço configurado', async () => {
    const { result } = await renderHook(() => useDiaryEntryForm({ ativo: true, catalogo }));
    await expect(result.current.salvar()).resolves.toBe(false);
});

test('pré-preenche a edição e só salva depois de uma alteração real', async () => {
    const registroInicial = {
        id: 7,
        data: '2026-11-08',
        versao: 3,
        categorias: [{ id: 'sintomas', opcoes: [{ id: 'colica' }] }]
    };
    const atualizado = { ...registroInicial, versao: 4, categorias: [] };
    const service = { editarRegistro: jest.fn().mockResolvedValue(atualizado) };
    const onSalvo = jest.fn();
    const { result } = await renderHook(() =>
        useDiaryEntryForm({
            ativo: true,
            modo: 'editar',
            registroInicial,
            catalogo,
            service,
            onSalvo
        })
    );

    expect(result.current.valores).toEqual({ sintomas: ['colica'] });
    expect(result.current.alterado).toBe(false);
    await expect(result.current.salvar()).resolves.toBe(false);
    expect(service.editarRegistro).not.toHaveBeenCalled();

    await act(() => result.current.alterarValor('sintomas', ['fadiga']));
    expect(result.current.alterado).toBe(true);
    await act(async () => expect(await result.current.salvar()).toBe(true));
    expect(service.editarRegistro).toHaveBeenCalledWith(7, 3, {
        data: '2026-11-08',
        fusoHorario: expect.any(String),
        categorias: [{ categoriaId: 'sintomas', opcoes: ['fadiga'] }]
    });
    expect(onSalvo).toHaveBeenCalledWith(atualizado);

    await act(() => result.current.alterarValor('sintomas', ['colica']));
    expect(result.current.alterado).toBe(false);
});

test('mantém uma categoria desativada ao salvar alterações no registro antigo', async () => {
    const catalogoComInativa = {
        macrocategorias: [
            ...catalogo.macrocategorias,
            {
                id: 'emocional',
                ativa: false,
                categorias: [{ id: 'anotacao_livre', tipoValor: 'texto', ativaEfetiva: false }]
            }
        ]
    };
    const registroInicial = {
        id: 9,
        data: '2026-11-08',
        versao: 1,
        categorias: [
            { id: 'sintomas', opcoes: [{ id: 'colica' }] },
            { id: 'anotacao_livre', texto: 'Dado histórico preservado.' }
        ]
    };
    const service = {
        editarRegistro: jest.fn().mockResolvedValue({ ...registroInicial, versao: 2 })
    };
    const { result } = await renderHook(() =>
        useDiaryEntryForm({
            ativo: true,
            modo: 'editar',
            registroInicial,
            catalogo: catalogoComInativa,
            service
        })
    );

    await act(() => result.current.alterarValor('sintomas', ['fadiga']));
    await act(async () => expect(await result.current.salvar()).toBe(true));

    expect(service.editarRegistro).toHaveBeenCalledWith(9, 1, {
        data: '2026-11-08',
        fusoHorario: expect.any(String),
        categorias: [
            { categoriaId: 'sintomas', opcoes: ['fadiga'] },
            { categoriaId: 'anotacao_livre', texto: 'Dado histórico preservado.' }
        ]
    });
});
