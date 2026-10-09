//Testa o formulário compartilhado de cadastro e edição de anticoncepcionais.
import { act, renderHook } from '@testing-library/react-native';
import { INTENSIDADES_ALERTA } from '../../../../src/features/contraceptives/constants/contraceptiveOptions';
import {
    criarDadosIniciais,
    dadosSaoIguais,
    useContraceptiveForm
} from '../../../../src/features/contraceptives/hooks/useContraceptiveForm';

const anticoncepcionalCadastrado = Object.freeze({
    id: '7',
    nome: 'Mercilon',
    tipo: 'pilula',
    intensidadeAlerta: 'critico',
    dataValidade: null,
    programacao: Object.freeze({
        horarios: Object.freeze(['08:00', '20:00']),
        frequenciaId: 'pilula_continuo',
        dataPrimeiroUso: '2026-09-25',
        periodosPausa: Object.freeze([])
    })
});

test('começa vazio no modo de cadastro', async () => {
    const { result } = await renderHook(() => useContraceptiveForm(jest.fn()));

    expect(result.current.dados).toEqual({
        id: null,
        nome: '',
        tipo: '',
        frequenciaId: '',
        horarios: [],
        intensidadeAlerta: '',
        dataValidade: '',
        dataPrimeiroUso: ''
    });

    expect(result.current.modoEdicao).toBe(false);
    expect(result.current.possuiAlteracoes).toBe(false);
    expect(result.current.podeEnviar).toBe(true);
});

test('preenche a edição com os dados atuais sem compartilhar o array original', async () => {
    const { result } = await renderHook(() => useContraceptiveForm(
        jest.fn(),
        anticoncepcionalCadastrado
    ));

    expect(result.current.dados).toEqual({
        id: '7',
        nome: 'Mercilon',
        tipo: 'pilula',
        frequenciaId: 'pilula_continuo',
        horarios: ['08:00', '20:00'],
        intensidadeAlerta: 'critico',
        dataValidade: '',
        dataPrimeiroUso: '2026-09-25'
    });

    expect(result.current.dados.horarios).not.toBe(
        anticoncepcionalCadastrado.programacao.horarios
    );

    expect(result.current.modoEdicao).toBe(true);
    expect(result.current.possuiAlteracoes).toBe(false);
    expect(result.current.podeEnviar).toBe(false);
});

test('detecta uma alteração real e volta ao estado inalterado quando ela é desfeita', async () => {
    const { result } = await renderHook(() => useContraceptiveForm(
        jest.fn(),
        anticoncepcionalCadastrado
    ));

    await act(() => result.current.alterar('nome', 'Mercilon atualizado'));

    expect(result.current.possuiAlteracoes).toBe(true);
    expect(result.current.podeEnviar).toBe(true);

    await act(() => result.current.alterar('nome', ' Mercilon '));

    expect(result.current.possuiAlteracoes).toBe(false);
    expect(result.current.podeEnviar).toBe(false);
});

test('não considera a ordem dos horários como uma alteração real', async () => {
    const { result } = await renderHook(() => useContraceptiveForm(
        jest.fn(),
        anticoncepcionalCadastrado
    ));

    await act(() => result.current.alterar('horarios', ['20:00', '08:00']));

    expect(result.current.possuiAlteracoes).toBe(false);
});

test('preserva os dados quando o mesmo tipo é selecionado novamente', async () => {
    const { result } = await renderHook(() => useContraceptiveForm(
        jest.fn(),
        anticoncepcionalCadastrado
    ));

    await act(() => result.current.selecionarTipo('pilula'));

    expect(result.current.dados.frequenciaId).toBe('pilula_continuo');
    expect(result.current.dados.horarios).toEqual(['08:00', '20:00']);
    expect(result.current.dados.dataPrimeiroUso).toBe('2026-09-25');
    expect(result.current.possuiAlteracoes).toBe(false);
});

test('limpa frequência e horários quando o tipo realmente muda', async () => {
    const { result } = await renderHook(() => useContraceptiveForm(
        jest.fn(),
        anticoncepcionalCadastrado
    ));

    await act(() => result.current.selecionarTipo('injetavel'));

    expect(result.current.dados).toEqual(expect.objectContaining({
        tipo: 'injetavel',
        frequenciaId: '',
        horarios: [],
        dataValidade: '',
        dataPrimeiroUso: ''
    }));

    expect(result.current.possuiAlteracoes).toBe(true);
});

test('preserva múltiplos horários ao trocar a frequência da pílula', async () => {
    const { result } = await renderHook(() => useContraceptiveForm(jest.fn()));

    await act(() => result.current.selecionarTipo('pilula'));
    await act(() => result.current.alterar('horarios', ['08:30', '18:45']));
    await act(() => result.current.selecionarFrequencia('pilula_21_7'));

    expect(result.current.dados.horarios).toEqual(['08:30', '18:45']);
    expect(result.current.dados.frequenciaId).toBe('pilula_21_7');
});

test('não envia uma edição que permanece inalterada', async () => {
    const onSubmit = jest.fn();
    const { result } = await renderHook(() => useContraceptiveForm(
        onSubmit,
        anticoncepcionalCadastrado
    ));

    let retorno;

    await act(async () => {
        retorno = await result.current.enviar();
    });

    expect(retorno).toBe(false);
    expect(onSubmit).not.toHaveBeenCalled();
});

test('envia a edição preservando o identificador original', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { result } = await renderHook(() => useContraceptiveForm(
        onSubmit,
        anticoncepcionalCadastrado
    ));

    await act(() => result.current.alterar('nome', 'Mercilon atualizado'));

    let retorno;

    await act(async () => {
        retorno = await result.current.enviar();
    });

    expect(retorno).toBe(true);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        id: '7',
        nome: 'Mercilon atualizado',
        tipo: 'pilula',
        intensidadeAlerta: 'critico'
    }));
});

test('mantém os dados e mostra a mensagem correta quando a atualização falha', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('falha interna'));
    const { result } = await renderHook(() => useContraceptiveForm(
        onSubmit,
        anticoncepcionalCadastrado
    ));

    await act(() => result.current.alterar('nome', 'Mercilon atualizado'));

    await act(async () => {
        await result.current.enviar();
    });

    expect(result.current.dados.nome).toBe('Mercilon atualizado');

    expect(result.current.alerta).toEqual({
        tipo: 'rede',
        titulo: 'Algo deu errado',
        mensagem: 'Ocorreu um erro ao atualizar. Verifique sua conexão e tente novamente.'
    });
});

test('usa textos breves nos erros de validação e de rede do cadastro', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('sem conexão'));
    const { result } = await renderHook(() => useContraceptiveForm(onSubmit));

    await act(async () => result.current.enviar());

    expect(result.current.alerta).toEqual(expect.objectContaining({
        titulo: 'Nome não informado',
        mensagem: 'Informe o nome do anticoncepcional.'
    }));

    await act(() => result.current.alterar('nome', 'Mercilon'));
    await act(() => result.current.selecionarTipo('pilula'));
    await act(() => result.current.selecionarFrequencia('pilula_continuo'));
    await act(async () => result.current.enviar());

    expect(result.current.alerta.titulo).toBe('Horário não informado');

    await act(() => result.current.alterar('horarios', ['08:30']));
    await act(async () => result.current.enviar());

    expect(result.current.alerta).toEqual({
        tipo: 'rede',
        titulo: 'Não foi possível salvar',
        mensagem: 'Verifique sua conexão e tente novamente.'
    });
});

test('ignora tentativas de alterar propriedades internas ou protegidas', async () => {
    const { result } = await renderHook(() => useContraceptiveForm(
        jest.fn(),
        anticoncepcionalCadastrado
    ));

    let retorno;

    await act(() => {
        retorno = result.current.alterar('usuarioId', 99);
    });

    expect(retorno).toBe(false);
    expect(result.current.dados).not.toHaveProperty('usuarioId');
    expect(result.current.possuiAlteracoes).toBe(false);
});

test('compara cópias equivalentes sem depender da referência dos objetos', () => {
    const primeiro = criarDadosIniciais(anticoncepcionalCadastrado);
    const segundo = criarDadosIniciais(anticoncepcionalCadastrado);

    expect(primeiro).not.toBe(segundo);
    expect(dadosSaoIguais(primeiro, segundo)).toBe(true);
});

test('descreve os três níveis de intensidade', () => {
    expect(INTENSIDADES_ALERTA.map(({ descricao }) => descricao)).toEqual([
        '1 aviso no horário programado.',
        '2 avisos: no horário e 10 min depois.',
        '3 avisos: no horário, 5 e 10 min depois.'
    ]);
});