import { act, renderHook } from '@testing-library/react-native';
import { INTENSIDADES_ALERTA } from '../../../features/contraceptives/constants/contraceptiveOptions';
import { useContraceptiveForm } from '../../../features/contraceptives/hooks/useContraceptiveForm';

test('preserva múltiplos horários ao trocar a frequência da pílula', async () => {
    const { result } = await renderHook(() => useContraceptiveForm(jest.fn()));

    await act(() => result.current.selecionarTipo('pilula'));
    await act(() => result.current.alterar('horarios', ['08:30', '18:45']));
    await act(() => result.current.selecionarFrequencia('pilula_21_7'));

    expect(result.current.dados.horarios).toEqual(['08:30', '18:45']);
    expect(result.current.dados.frequenciaId).toBe('pilula_21_7');
});

test('usa textos breves nos erros de validação e de rede', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('sem conexão'));
    const { result } = await renderHook(() => useContraceptiveForm(onSubmit));

    await act(() => result.current.enviar());
    expect(result.current.alerta).toEqual(expect.objectContaining({
        titulo: 'Nome não informado', mensagem: 'Informe o nome do anticoncepcional.'
    }));

    await act(() => result.current.alterar('nome', 'Mercilon'));
    await act(() => result.current.selecionarTipo('pilula'));
    await act(() => result.current.selecionarFrequencia('pilula_continuo'));
    await act(() => result.current.enviar());
    expect(result.current.alerta.titulo).toBe('Horário não informado');

    await act(() => result.current.alterar('horarios', ['08:30']));
    await act(() => result.current.enviar());
    expect(result.current.alerta).toEqual({
        tipo: 'rede', titulo: 'Não foi possível salvar',
        mensagem: 'Verifique sua conexão e tente novamente.'
    });
});

test('descreve os três níveis de intensidade', () => {
    expect(INTENSIDADES_ALERTA.map(({ descricao }) => descricao)).toEqual([
        '1 aviso no horário programado.',
        '2 avisos: no horário e 10 min depois.',
        '3 avisos: no horário, 5 e 10 min depois.'
    ]);
});
