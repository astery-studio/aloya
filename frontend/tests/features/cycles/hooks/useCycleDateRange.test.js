import { act, renderHook } from '@testing-library/react-native';
import { useCycleDateRange } from '../../../../src/features/cycles/hooks/useCycleDateRange';

test('adiciona dias nas duas pontas preservando a referência e as datas já carregadas', async () => {
    const { result } = await renderHook(() =>
        useCycleDateRange({ dataBase: '2026-11-13', faseAtual: 'lutea' })
    );
    const inicio = result.current.dias;
    expect(inicio).toHaveLength(16);
    expect(inicio[3]).toMatchObject({ data: '2026-11-13', hoje: true, fase: 'lutea' });

    await act(() => result.current.carregarDias('anteriores'));
    expect(result.current.dias).toHaveLength(30);
    expect(result.current.dias.slice(14)).toEqual(inicio);

    await act(() => result.current.carregarDias('posteriores'));
    expect(result.current.dias).toHaveLength(44);
    expect(result.current.dias.slice(14, 30)).toEqual(inicio);
});
