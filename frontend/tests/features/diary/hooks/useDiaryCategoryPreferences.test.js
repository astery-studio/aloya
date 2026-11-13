import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
    MENSAGEM_ERRO,
    aplicarPreferencia,
    obterEstadoPreferencia,
    useDiaryCategoryPreferences
} from '../../../../src/features/diary/hooks/useDiaryCategoryPreferences';

function criarCatalogo(versao = 0) {
    return {
        versao,
        macrocategorias: [
            {
                id: 'energia_sono',
                nome: 'Energia e Sono',
                ativa: true,
                categorias: [
                    {
                        id: 'energia',
                        nome: 'Energia',
                        ativaIndividual: false,
                        ativaEfetiva: false
                    },
                    {
                        id: 'qualidade_sono',
                        nome: 'Qualidade do sono',
                        ativaIndividual: true,
                        ativaEfetiva: true
                    }
                ]
            }
        ]
    };
}

test('reativar uma macro liga automaticamente todas as categorias', () => {
    const desligado = aplicarPreferencia(criarCatalogo(), {
        tipo: 'macrocategoria',
        id: 'energia_sono',
        ativa: false
    });
    expect(desligado.macrocategorias[0].categorias).toEqual([
        expect.objectContaining({ id: 'energia', ativaIndividual: false, ativaEfetiva: false }),
        expect.objectContaining({
            id: 'qualidade_sono',
            ativaIndividual: true,
            ativaEfetiva: false
        })
    ]);

    const religado = aplicarPreferencia(desligado, {
        tipo: 'macrocategoria',
        id: 'energia_sono',
        ativa: true
    });
    expect(religado.macrocategorias[0].categorias).toEqual([
        expect.objectContaining({ id: 'energia', ativaIndividual: true, ativaEfetiva: true }),
        expect.objectContaining({
            id: 'qualidade_sono',
            ativaIndividual: true,
            ativaEfetiva: true
        })
    ]);
});

test('reativa a macro e adota todas as categorias devolvidas como ativas', async () => {
    const inicial = aplicarPreferencia(criarCatalogo(), {
        tipo: 'macrocategoria',
        id: 'energia_sono',
        ativa: false
    });
    const atualizado = aplicarPreferencia(criarCatalogo(1), {
        tipo: 'macrocategoria',
        id: 'energia_sono',
        ativa: true
    });
    const service = {
        buscarCatalogo: jest.fn().mockResolvedValue(inicial),
        atualizarMacrocategoria: jest.fn().mockResolvedValue(atualizado)
    };
    const { result } = await renderHook(() => useDiaryCategoryPreferences({ service }));
    await waitFor(() => expect(result.current.catalogo).toBe(inicial));

    await act(() => result.current.alterarMacrocategoria('energia_sono', true));

    expect(service.atualizarMacrocategoria).toHaveBeenCalledWith('energia_sono', true, 0);
    expect(result.current.catalogo).toBe(atualizado);
});

test('persiste imediatamente e adota o catálogo devolvido pelo servidor', async () => {
    const inicial = criarCatalogo();
    const atualizado = aplicarPreferencia(criarCatalogo(1), {
        tipo: 'categoria',
        id: 'qualidade_sono',
        ativa: false
    });
    let resolver;
    const service = {
        buscarCatalogo: jest.fn().mockResolvedValue(inicial),
        atualizarCategoria: jest.fn(
            () =>
                new Promise((resolve) => {
                    resolver = resolve;
                })
        )
    };
    const { result } = await renderHook(() => useDiaryCategoryPreferences({ service }));
    await waitFor(() => expect(result.current.catalogo).toBe(inicial));

    let salvamento;
    await act(async () => {
        salvamento = result.current.alterarCategoria('qualidade_sono', false);
        await Promise.resolve();
    });
    expect(result.current.catalogo.macrocategorias[0].categorias[1].ativaEfetiva).toBe(false);
    expect(result.current.salvando).toBe('categoria:qualidade_sono');
    expect(service.atualizarCategoria).toHaveBeenCalledWith('qualidade_sono', false, 0);

    await act(async () => {
        resolver(atualizado);
        await salvamento;
    });
    await waitFor(() => expect(result.current.catalogo).toBe(atualizado));
    expect(result.current.salvando).toBeNull();
});

test('reverte o toggle e mostra erro amigável quando a persistência falha', async () => {
    const inicial = criarCatalogo();
    const service = {
        buscarCatalogo: jest.fn().mockResolvedValue(inicial),
        atualizarMacrocategoria: jest.fn().mockRejectedValue(new Error('falha interna'))
    };
    const { result } = await renderHook(() => useDiaryCategoryPreferences({ service }));
    await waitFor(() => expect(result.current.catalogo).toBe(inicial));

    await act(() => result.current.alterarMacrocategoria('energia_sono', false));

    expect(result.current.catalogo).toBe(inicial);
    expect(result.current.catalogo.macrocategorias[0].ativa).toBe(true);
    expect(result.current.erro).toBe(MENSAGEM_ERRO);
});

test('sincroniza a versão e repete uma alteração após conflito', async () => {
    const inicial = criarCatalogo();
    const sincronizado = criarCatalogo(2);
    const atualizado = aplicarPreferencia(criarCatalogo(3), {
        tipo: 'macrocategoria',
        id: 'energia_sono',
        ativa: false
    });
    const service = {
        buscarCatalogo: jest
            .fn()
            .mockResolvedValueOnce(inicial)
            .mockResolvedValueOnce(sincronizado),
        atualizarMacrocategoria: jest
            .fn()
            .mockRejectedValueOnce({ status: 409 })
            .mockResolvedValueOnce(atualizado)
    };
    const { result } = await renderHook(() => useDiaryCategoryPreferences({ service }));
    await waitFor(() => expect(result.current.catalogo).toBe(inicial));

    await act(() => result.current.alterarMacrocategoria('energia_sono', false));

    expect(service.atualizarMacrocategoria).toHaveBeenNthCalledWith(2, 'energia_sono', false, 2);
    expect(result.current.catalogo).toBe(atualizado);
    expect(result.current.erro).toBeNull();
});

test('informa sessão expirada durante o carregamento', async () => {
    const onSessaoExpirada = jest.fn();
    const service = { buscarCatalogo: jest.fn().mockRejectedValue({ status: 401 }) };
    const { result } = await renderHook(() =>
        useDiaryCategoryPreferences({ service, onSessaoExpirada })
    );

    await waitFor(() => expect(result.current.erro).toBe(MENSAGEM_ERRO));
    expect(result.current.erroCarregamento).toBe(true);
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
});

test('consulta estados e preserva catálogos ausentes', () => {
    const catalogo = criarCatalogo();
    expect(obterEstadoPreferencia(catalogo, { tipo: 'macrocategoria', id: 'energia_sono' })).toBe(
        true
    );
    expect(obterEstadoPreferencia(catalogo, { tipo: 'categoria', id: 'energia' })).toBe(false);
    expect(obterEstadoPreferencia(catalogo, { tipo: 'categoria', id: 'inexistente' })).toBeUndefined();
    expect(obterEstadoPreferencia(null, { tipo: 'categoria', id: 'energia' })).toBeUndefined();
    expect(aplicarPreferencia(null, { tipo: 'categoria', id: 'energia', ativa: true })).toBeNull();
});

test('fica inativo sem serviço e permite fechar o erro', async () => {
    const inativo = await renderHook(() =>
        useDiaryCategoryPreferences({ ativo: false, service: {} })
    );
    expect(inativo.result.current.catalogo).toBeNull();
    expect(inativo.result.current.carregando).toBe(false);
    await expect(inativo.result.current.alterarCategoria('energia', true)).resolves.toBe(false);
    await expect(inativo.result.current.tentarNovamente()).resolves.toBe(false);
    await act(() => inativo.result.current.fecharErro());
    await inativo.unmount();
});

test('ignora cancelamento do catálogo ao desmontar', async () => {
    let sinal;
    const service = {
        buscarCatalogo: jest.fn(({ signal }) => {
            sinal = signal;
            return new Promise((_resolve, reject) => {
                signal.addEventListener('abort', () =>
                    reject(Object.assign(new Error('cancelado'), { name: 'AbortError' }))
                );
            });
        })
    };
    const hook = await renderHook(() => useDiaryCategoryPreferences({ service }));
    await waitFor(() => expect(sinal).toBeDefined());
    await hook.unmount();
    expect(sinal.aborted).toBe(true);
});

test('aceita conflito já aplicado pelo servidor e tenta novamente após erro', async () => {
    const inicial = criarCatalogo();
    const sincronizado = aplicarPreferencia(criarCatalogo(2), {
        tipo: 'categoria',
        id: 'qualidade_sono',
        ativa: false
    });
    const service = {
        buscarCatalogo: jest
            .fn()
            .mockResolvedValueOnce(inicial)
            .mockResolvedValueOnce(sincronizado),
        atualizarCategoria: jest
            .fn()
            .mockRejectedValueOnce({ status: 409 })
            .mockRejectedValueOnce(new Error('rede'))
            .mockResolvedValueOnce(sincronizado)
    };
    const hook = await renderHook(() => useDiaryCategoryPreferences({ service }));
    await waitFor(() => expect(hook.result.current.catalogo).toBe(inicial));

    await act(() => hook.result.current.alterarCategoria('qualidade_sono', false));
    expect(service.atualizarCategoria).toHaveBeenCalledTimes(1);
    expect(hook.result.current.catalogo).toBe(sincronizado);

    await act(() => hook.result.current.alterarCategoria('qualidade_sono', true));
    expect(hook.result.current.erro).toBe(MENSAGEM_ERRO);
    await act(() => hook.result.current.tentarNovamente());
    expect(hook.result.current.erro).toBeNull();
    await hook.unmount();
});

test('informa sessão expirada durante a persistência', async () => {
    const onSessaoExpirada = jest.fn();
    const service = {
        buscarCatalogo: jest.fn().mockResolvedValue(criarCatalogo()),
        atualizarCategoria: jest.fn().mockRejectedValue({ status: 401 })
    };
    const hook = await renderHook(() =>
        useDiaryCategoryPreferences({ service, onSessaoExpirada })
    );
    await waitFor(() => expect(hook.result.current.catalogo).not.toBeNull());
    await act(() => hook.result.current.alterarCategoria('energia', true));
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
    await act(() => hook.result.current.fecharErro());
    expect(hook.result.current.erro).toBeNull();
    await hook.unmount();
});
