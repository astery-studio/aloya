import { act, renderHook } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { useBreathingAnimation } from '../../../../src/features/cycles/hooks/useBreathingAnimation';

const configuracao = {
    duracaoInspiracao: 1000,
    duracaoExpiracao: 2000,
    escalaMaxima: 1.6
};

let movimento;
let transicoes;

beforeEach(() => {
    jest.useFakeTimers();
    movimento = { start: jest.fn(), stop: jest.fn() };
    transicoes = [];
    jest.spyOn(Animated, 'loop').mockReturnValue(movimento);
    jest.spyOn(Animated, 'timing').mockImplementation(() => ({
        start: (callback) => {
            if (callback) transicoes.push(callback);
        }
    }));
});

afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
});

async function mudarInstrucao(duracao) {
    await act(() => jest.advanceTimersByTime(duracao));
    expect(transicoes).toHaveLength(1);
    await act(() => transicoes.shift()());
}

test('alterna as instruções e interrompe o movimento ao fechar', async () => {
    const { result, rerender } = await renderHook(
        ({ ativo }) => useBreathingAnimation({ ...configuracao, ativo }),
        { initialProps: { ativo: true } }
    );

    expect(result.current.instrucao).toBe('Inspire');
    expect(movimento.start).toHaveBeenCalledTimes(1);
    await mudarInstrucao(1000);
    expect(result.current.instrucao).toBe('Expire');
    await mudarInstrucao(2000);
    expect(result.current.instrucao).toBe('Inspire');
    await mudarInstrucao(1000);
    expect(result.current.instrucao).toBe('Expire');

    await act(() => jest.advanceTimersByTime(2000));
    expect(transicoes).toHaveLength(1);
    await rerender({ ativo: false });
    await act(() => transicoes.shift()());
    await act(() => jest.advanceTimersByTime(5000));

    expect(result.current.instrucao).toBe('Inspire');
    expect(movimento.stop).toHaveBeenCalledTimes(1);
    expect(transicoes).toHaveLength(0);
});
