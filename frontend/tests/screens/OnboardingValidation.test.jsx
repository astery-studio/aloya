/**
 * Testes das validações e transições executadas durante o onboarding.
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import OnboardingScreen from '../../src/features/onboarding/screens/OnboardingScreen';

jest.mock('../../src/shared/storage/tokenStorage', () => ({ salvarToken: jest.fn() }));
jest.setTimeout(15000);
let mockPeriodoMenstrual = { inicio: '2026-08-03', fim: '2026-08-07' };
jest.mock('../../src/features/onboarding/components/MenstruationCalendar/MenstruationCalendar', () => {
    const { Pressable, Text } = require('react-native');
    return { __esModule: true, default: ({ aoAlterar }) => (
        <Pressable accessibilityRole="button" accessibilityLabel="Selecionar período"
            onPress={() => aoAlterar(mockPeriodoMenstrual)}>
            <Text>Calendário menstrual</Text>
        </Pressable>
    ) };
});

afterEach(() => {
    mockPeriodoMenstrual = { inicio: '2026-08-03', fim: '2026-08-07' };
    jest.useRealTimers();
    jest.restoreAllMocks();
});

test('cadastro explica quando o nome tem menos de três caracteres', async () => {
    const cadastrar = jest.fn();
    await render(<OnboardingScreen cadastrar={cadastrar} />);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Al');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'al@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'segredo1');
    await fireEvent.press(screen.getByRole('checkbox'));

    const avancar = screen.getByRole('button', { name: 'Avançar' });
    expect(avancar).not.toBeDisabled();
    await fireEvent.press(avancar);

    expect(screen.getByText('Nome inválido')).toBeTruthy();
    expect(screen.getAllByText(
        'O nome deve ter pelo menos 3 caracteres.'
    )).toHaveLength(2);
    expect(cadastrar).not.toHaveBeenCalled();
});

test('cadastro não avança quando o e-mail já existe', async () => {
    const verificarEmailDisponivel = jest.fn().mockResolvedValue({ disponivel: false });
    await render(<OnboardingScreen cadastrar={jest.fn()}
        verificarEmailDisponivel={verificarEmailDisponivel} />);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Carla');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'carla@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'segredo1');
    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    expect(await screen.findByText('Este e-mail já está em uso')).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
});

test('cadastro envia a duração lútea como número, sem o evento do botão', async () => {
    const cadastrar = jest.fn().mockResolvedValue({
        autenticacao: { token: 'jwt', tipo: 'Bearer' }
    });
    const seletor = () => null;
    await render(<OnboardingScreen cadastrar={cadastrar}
        renderizarSeletorCiclo={seletor}
        renderizarSeletorMenstruacao={seletor} renderizarSeletorLutea={seletor} />);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Carla');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'carla@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'segredo1');
    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012000');
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar período' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    expect(cadastrar).toHaveBeenCalledWith(expect.objectContaining({
        duracaoLuteaInformada: 14
    }));
    expect(() => JSON.stringify(cadastrar.mock.calls[0][0])).not.toThrow();
});

test('cadastro rejeita senha curta junto ao campo', async () => {
    await render(<OnboardingScreen cadastrar={jest.fn()} />);

    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Carla');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'carla@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'curta');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'curta');
    await fireEvent.press(screen.getByRole('checkbox'));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    expect(screen.getAllByText(
        'A senha deve possuir pelo menos 8 caracteres.'
    ).length).toBeGreaterThanOrEqual(1);
});

test('nome remove números e caracteres especiais durante a digitação', async () => {
    await render(<OnboardingScreen cadastrar={jest.fn()} />);

    const nome = screen.getByLabelText('Nome');
    await fireEvent.changeText(nome, 'Carla 123! Cristina');

    expect(nome.props.value).toBe('Carla Cristina');
});

async function preencherConta() {
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Carla');
    await fireEvent.changeText(screen.getByLabelText('Email'), 'carla@email.com');
    await fireEvent.changeText(screen.getByLabelText('Senha'), 'segredo1');
    await fireEvent.changeText(screen.getByLabelText('Confirmar senha'), 'segredo1');
    await fireEvent.press(screen.getByRole('checkbox'));
}

test('voltar e avançar na mesma tentativa preserva os dados', async () => {
    await render(<OnboardingScreen cadastrar={jest.fn()} />);
    await preencherConta();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012000');

    await fireEvent.press(screen.getByLabelText('Voltar'));
    expect(screen.getByLabelText('Email').props.value).toBe('carla@email.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    expect(screen.getByLabelText('Data').props.value).toBe('04/01/2000');
});

test('data de nascimento futura não solicita responsável legal', async () => {
    await render(<OnboardingScreen cadastrar={jest.fn()} />);
    await preencherConta();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    await fireEvent.changeText(screen.getByLabelText('Data'), '02022028');

    expect(screen.queryByLabelText(
        'E-mail do responsável legal (opcional)'
    )).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    expect(screen.getByText('Data inválida')).toBeTruthy();
});

test('valida e-mail do responsável ao sair do campo e durante a correção', async () => {
    await render(<OnboardingScreen cadastrar={jest.fn()} />);
    await preencherConta();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012015');
    const emailResponsavel = screen.getByLabelText(
        'E-mail do responsável legal (opcional)'
    );

    await fireEvent.changeText(emailResponsavel, 'email-invalido');
    await fireEvent(emailResponsavel, 'blur');
    expect(screen.getByText('Informe um e-mail válido.')).toBeTruthy();

    await fireEvent.changeText(emailResponsavel, 'responsavel@email.com');
    expect(screen.queryByText('Informe um e-mail válido.')).toBeNull();
});

test('rejeita menstruação futura considerando a data local', async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 8, 27, 22));
    mockPeriodoMenstrual = { inicio: '2026-09-28', fim: '2026-09-28' };
    await render(<OnboardingScreen cadastrar={jest.fn()} />);
    await preencherConta();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012000');
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar período' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    expect(screen.getByText('Data inválida')).toBeTruthy();
});

test('remove o e-mail do responsável quando a pessoa informa idade adulta', async () => {
    const cadastrar = jest.fn().mockResolvedValue({
        autenticacao: { token: 'jwt', tipo: 'Bearer' }
    });
    await render(<OnboardingScreen cadastrar={cadastrar} />);
    await preencherConta();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012015');
    await fireEvent.changeText(screen.getByLabelText(
        'E-mail do responsável legal (opcional)'
    ), 'responsavel@email.com');
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012000');
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar período' }));
    for (let etapa = 0; etapa < 4; etapa += 1) {
        await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    }

    expect(cadastrar).toHaveBeenCalledWith(expect.not.objectContaining({
        emailResponsavelLegal: expect.anything()
    }));
});

test('cancelar a saída mantém a etapa e os dados preenchidos', async () => {
    const aoVoltar = jest.fn();
    await render(<OnboardingScreen cadastrar={jest.fn()} aoVoltar={aoVoltar} />);
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Carla');
    await fireEvent.press(screen.getByLabelText('Voltar'));

    expect(screen.getByText('Sair do cadastro?')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar cadastro' }));

    expect(aoVoltar).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Nome').props.value).toBe('Carla');
});

test('sai sem confirmação quando nenhum dado foi preenchido', async () => {
    const aoVoltar = jest.fn();
    await render(<OnboardingScreen cadastrar={jest.fn()} aoVoltar={aoVoltar} />);

    await fireEvent.press(screen.getByLabelText('Voltar'));

    expect(aoVoltar).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Sair do cadastro?')).toBeNull();
});

test('confirmar a saída limpa os dados e encerra o fluxo', async () => {
    const aoVoltar = jest.fn();
    await render(<OnboardingScreen cadastrar={jest.fn()} aoVoltar={aoVoltar} />);
    await fireEvent.changeText(screen.getByLabelText('Nome'), 'Carla');
    await fireEvent.press(screen.getByLabelText('Voltar'));
    await fireEvent.press(screen.getByRole('button', { name: 'Sair e descartar' }));

    expect(aoVoltar).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Nome').props.value).toBe('');
});

test('voltar pelo sistema solicita confirmação sem mudar de etapa', async () => {
    let tratarVoltar;
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((evento, ouvinte) => {
        tratarVoltar = ouvinte;
        return { remove: jest.fn() };
    });
    await render(<OnboardingScreen cadastrar={jest.fn()} />);
    await preencherConta();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    await act(() => expect(tratarVoltar()).toBe(true));

    expect(screen.getByText('Sair do cadastro?')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar cadastro' }));
    expect(screen.getByLabelText('Data')).toBeTruthy();
    BackHandler.addEventListener.mockRestore();
});

async function chegarAEtapaFinal() {
    await preencherConta();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012000');
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar período' }));
    for (let etapa = 0; etapa < 3; etapa += 1) {
        await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    }
}

async function concluirEtapas() {
    await chegarAEtapaFinal();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
}

test('conclui o cadastro sem período menstrual quando a pessoa não sabe a data', async () => {
    const cadastrar = jest.fn().mockResolvedValue({
        autenticacao: { token: 'jwt', tipo: 'Bearer' }
    });
    await render(<OnboardingScreen cadastrar={cadastrar} />);
    await preencherConta();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012000');
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    expect(screen.getByRole('button', { name: 'Avançar' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Não sei' }));
    for (let etapa = 0; etapa < 3; etapa += 1) {
        await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    }

    await waitFor(() => expect(cadastrar).toHaveBeenCalledWith(expect.objectContaining({
        dataInicioUltimaMenstruacao: null,
        dataFimUltimaMenstruacao: null
    })));
});

test('pular uma etapa já preenchida remove o valor antes de concluir', async () => {
    const cadastrar = jest.fn().mockResolvedValue({
        autenticacao: { token: 'jwt', tipo: 'Bearer' }
    });
    await render(<OnboardingScreen cadastrar={cadastrar} />);
    await preencherConta();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012000');
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar período' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByLabelText('Voltar'));

    await fireEvent.press(screen.getByText('Pular'));
    await fireEvent.press(screen.getByText('Pular'));
    await fireEvent.press(screen.getByText('Pular'));

    expect(cadastrar).toHaveBeenCalledWith(expect.objectContaining({
        duracaoCicloInformada: null,
        duracaoMenstruacaoInformada: null,
        duracaoLuteaInformada: null
    }));
});

test('bloqueia a saída durante o envio e depois da conclusão', async () => {
    let tratarVoltar;
    let resolverCadastro;
    const cadastrar = jest.fn(() => new Promise((resolve) => {
        resolverCadastro = resolve;
    }));
    jest.spyOn(BackHandler, 'addEventListener').mockImplementation((evento, ouvinte) => {
        tratarVoltar = ouvinte;
        return { remove: jest.fn() };
    });
    await render(<OnboardingScreen cadastrar={cadastrar} />);
    await chegarAEtapaFinal();
    fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));

    await waitFor(() => expect(cadastrar).toHaveBeenCalledTimes(1));
    await act(() => expect(tratarVoltar()).toBe(true));
    expect(screen.queryByText('Sair do cadastro?')).toBeNull();

    await act(async () => resolverCadastro({
        autenticacao: { token: 'jwt', tipo: 'Bearer' }
    }));
    expect(await screen.findByText(/Esperamos que sua experiência/)).toBeTruthy();

    await act(() => expect(tratarVoltar()).toBe(true));
    expect(screen.queryByText('Sair do cadastro?')).toBeNull();
    expect(screen.getByText(/Esperamos que sua experiência/)).toBeTruthy();
});

test('conflito de e-mail no envio final retorna à etapa da conta', async () => {
    const falha = Object.assign(new Error('detalhe interno'), {
        codigo: 'EMAIL_JA_CADASTRADO'
    });
    await render(<OnboardingScreen cadastrar={jest.fn().mockRejectedValue(falha)} />);
    await concluirEtapas();

    expect(await screen.findByText('Este e-mail já está em uso')).toBeTruthy();
    expect(screen.getByLabelText('Email').props.value).toBe('carla@email.com');
    expect(screen.getByRole('button', { name: 'Fazer login' })).toBeTruthy();
    expect(screen.queryByText('detalhe interno')).toBeNull();
});

test('erro final de campo retorna à etapa indicada pelo backend', async () => {
    const falha = Object.assign(new Error('erro'), { codigo: 'ERRO_VALIDACAO',
        detalhes: [{ campo: 'dataNascimento', mensagem: 'Revise a data informada.' }] });
    await render(<OnboardingScreen cadastrar={jest.fn().mockRejectedValue(falha)} />);
    await concluirEtapas();

    expect(await screen.findByText('Revise este dado')).toBeTruthy();
    expect(screen.getByLabelText('Data').props.value).toBe('04/01/2000');
    expect(screen.getByText('Revise a data informada.')).toBeTruthy();
});

test.each([
    ['dataInicioUltimaMenstruacao', 'Revise o período informado.'],
    ['duracaoCicloInformada', 'Revise a duração do ciclo.'],
    ['duracaoMenstruacaoInformada', 'Revise a duração da menstruação.'],
    ['duracaoLuteaInformada', 'Revise a duração da fase lútea.']
])('exibe junto ao campo o erro do backend para %s', async (campo, mensagem) => {
    const falha = Object.assign(new Error('erro'), {
        codigo: 'ERRO_VALIDACAO',
        detalhes: [{ campo, mensagem }]
    });
    await render(<OnboardingScreen cadastrar={jest.fn().mockRejectedValue(falha)} />);
    await concluirEtapas();

    expect(await screen.findByText('Revise este dado')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Entendi' }));
    expect(screen.getByRole('alert')).toHaveTextContent(mensagem);
});

test('erro inesperado usa mensagem segura', async () => {
    await render(<OnboardingScreen cadastrar={jest.fn()
        .mockRejectedValue(new Error('senha do banco exposta'))} />);
    await concluirEtapas();

    expect(await screen.findByText('Algo deu errado')).toBeTruthy();
    expect(screen.getByText(
        'Ocorreu um erro ao criar sua conta. Verifique sua conexão e tente novamente.'
    )).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeTruthy();
    expect(screen.queryByText('senha do banco exposta')).toBeNull();
});
