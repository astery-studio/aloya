import { renderHook, waitFor } from '@testing-library/react-native';

import {
    obterFaseDoCalendario,
    useDiaryPhase
} from '../../../../src/features/diary/hooks/useDiaryPhase';

const calendario = {
    mes: '2026-11',
    possuiCiclos: true,
    diasMenstruacao: [],
    previsao: {
        faseMenstrual: { inicio: '2026-11-01', fim: '2026-11-04' },
        faseFolicular: { inicio: '2026-11-05', fim: '2026-11-12' },
        ovulacao: '2026-11-13',
        faseLutea: { inicio: '2026-11-14', fim: '2026-11-28' }
    }
};

test('identifica a fase correspondente à data', () => {
    expect(obterFaseDoCalendario(calendario, '2026-11-03')).toBe('menstruacao');
    expect(obterFaseDoCalendario(calendario, '2026-11-30')).toBeNull();
    expect(obterFaseDoCalendario(null, '2026-11-03')).toBeNull();
});

test('carrega a fase do mês selecionado', async () => {
    const service = { buscarMes: jest.fn().mockResolvedValue(calendario) };
    const { result } = await renderHook(() =>
        useDiaryPhase({ ativo: true, data: '2026-11-03', service })
    );
    await waitFor(() => expect(result.current.fase).toBe('menstruacao'));
    expect(service.buscarMes).toHaveBeenCalledWith({
        mes: '2026-11',
        signal: expect.any(AbortSignal)
    });
    expect(result.current.carregando).toBe(false);
});

test('ignora estado inativo e cancelamento', async () => {
    const service = { buscarMes: jest.fn() };
    const { result, rerender } = await renderHook(
        ({ ativo }) => useDiaryPhase({ ativo, data: 'inválida', service }),
        { initialProps: { ativo: false } }
    );
    expect(result.current).toEqual({ fase: null, carregando: false });
    await rerender({ ativo: true });
    expect(service.buscarMes).not.toHaveBeenCalled();
});

test('trata erro e sessão expirada', async () => {
    const onSessaoExpirada = jest.fn();
    const service = { buscarMes: jest.fn().mockRejectedValue({ status: 401 }) };
    const { result } = await renderHook(() =>
        useDiaryPhase({ ativo: true, data: '2026-11-03', service, onSessaoExpirada })
    );
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
    expect(result.current.fase).toBeNull();
});
