import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { useSharedSupportAccess } from '../../../../src/features/support-network/hooks/useSharedSupportAccess';

test('retorna o estado vazio sem consultar a API quando nenhum vínculo foi selecionado', async () => {
    const service = { consultar: jest.fn() };
    const { result } = await renderHook(() => useSharedSupportAccess({ service, vinculoId: null }));

    expect(result.current.acesso).toEqual({ status: 'vazio' });
    expect(service.consultar).not.toHaveBeenCalled();
});

test('retira o conteúdo compartilhado ao revalidar um vínculo revogado, sem encerrar a sessão', async () => {
    let retomar;
    const assinatura = jest
        .spyOn(AppState, 'addEventListener')
        .mockImplementation((_, listener) => {
            retomar = listener;
            return { remove: jest.fn() };
        });
    const onSessaoExpirada = jest.fn();
    const service = {
        consultar: jest
            .fn()
            .mockResolvedValueOnce({
                dados: { nomeTitular: 'Júlia' },
                permissoes: ['geral.fase_atual']
            })
            .mockRejectedValue(Object.assign(new Error('Acesso revogado'), { status: 403 }))
    };

    try {
        const { result } = await renderHook(() =>
            useSharedSupportAccess({ service, vinculoId: 9, onSessaoExpirada })
        );
        await waitFor(() => expect(result.current.acesso.status).toBe('disponivel'));
        expect(result.current.acesso.nomeTitular).toBe('Júlia');

        await act(async () => retomar('active'));

        expect(result.current.acesso).toEqual({ status: 'vazio' });
        expect(onSessaoExpirada).not.toHaveBeenCalled();
    } finally {
        assinatura.mockRestore();
    }
});
