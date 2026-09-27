/**
 * Testes das validações e transições executadas durante o onboarding.
 */
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import OnboardingScreen from '../../screens/onboarding/OnboardingScreen';

jest.mock('../../services/auth/tokenStorage', () => ({ salvarToken: jest.fn() }));
jest.mock('../../features/onboarding/MenstruationCalendar/MenstruationCalendar', () => {
    const { Pressable, Text } = require('react-native');
    return { __esModule: true, default: ({ aoAlterar }) => (
        <Pressable accessibilityRole="button" accessibilityLabel="Selecionar período"
            onPress={() => aoAlterar({ inicio: '2026-08-03', fim: '2026-08-07' })}>
            <Text>Calendário menstrual</Text>
        </Pressable>
    ) };
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

    expect(await screen.findByText('E-mail já cadastrado')).toBeTruthy();
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

async function concluirEtapas() {
    await preencherConta();
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.changeText(screen.getByLabelText('Data'), '04012000');
    await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar período' }));
    for (let etapa = 0; etapa < 4; etapa += 1) {
        await fireEvent.press(screen.getByRole('button', { name: 'Avançar' }));
    }
}

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

test('erro inesperado usa mensagem segura', async () => {
    await render(<OnboardingScreen cadastrar={jest.fn()
        .mockRejectedValue(new Error('senha do banco exposta'))} />);
    await concluirEtapas();

    expect(await screen.findByText('Algo deu errado')).toBeTruthy();
    expect(screen.getByText(
        'Não foi possível criar sua conta agora. Tente novamente em instantes.'
    )).toBeTruthy();
    expect(screen.queryByText('senha do banco exposta')).toBeNull();
});
