//Testa atualização, confirmação, concorrência e estados assíncronos da tela de edição.
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { EditContraceptiveScreen } from '../../../../src/features/contraceptives/screens/EditContraceptiveScreen';

const mockContraceptiveForm = jest.fn(() => null);
const mockSimpleModal = jest.fn(() => null);

jest.mock('../../../../src/features/contraceptives/forms/ContraceptiveForm', () => ({
    ContraceptiveForm: (props) => mockContraceptiveForm(props)
}));

jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => ({
    __esModule: true,
    default: (props) => mockSimpleModal(props)
}));

jest.mock('../../../../src/shared/components/navigation/Header/Header', () => {
    const { Text } = require('react-native');

    return {
        Header: ({ titulo }) => <Text>{titulo}</Text>
    };
});

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    PillIcon: () => null,
    WarningCircleIcon: () => null
}));

const anticoncepcional = {
    id: '7',
    nome: 'Mercilon',
    tipo: 'pilula',
    intensidadeAlerta: 'critico',
    dataValidade: null,
    programacao: {
        horarios: ['08:00'],
        frequenciaId: 'pilula_continuo',
        dataPrimeiroUso: '2026-09-25'
    }
};

const anticoncepcionalAtualizado = {
    ...anticoncepcional,
    nome: 'Mercilon atualizado'
};

//Cria uma promessa controlada pelo teste para simular uma API que ainda não respondeu.
function criarPromessaControlada() {
    let resolver;
    let rejeitar;
    const promessa = new Promise((resolve, reject) => {
        resolver = resolve;
        rejeitar = reject;
    });

    return {
        promessa,
        resolver,
        rejeitar
    };
}

//Retorna a versão mais recente de um modal pelo seu título.
function obterModal(titulo) {
    return mockSimpleModal.mock.calls
        .map(([propriedades]) => propriedades)
        .filter((propriedades) => propriedades.titulo === titulo)
        .at(-1);
}

beforeEach(() => {
    jest.clearAllMocks();
});

test('mostra o título, o formulário preenchido e a ação de apagar', async () => {
    const aoAtualizar = jest.fn();

    await render(
        <EditContraceptiveScreen
            anticoncepcional={anticoncepcional}
            aoAtualizar={aoAtualizar}
            aoExcluir={jest.fn()}
            aoVoltar={jest.fn()}
        />
    );

    expect(screen.getByText('Editar o Anticoncepcional')).toBeOnTheScreen();
    expect(screen.getByRole('button', {name: 'Apagar medicação'})).toBeEnabled();

    expect(mockContraceptiveForm).toHaveBeenCalledWith(expect.objectContaining({
        anticoncepcional,
        salvando: false,
        onSubmit: expect.any(Function)
    }));
});

test('mostra uma mensagem segura quando o registro não foi informado', async () => {
    await render(
        <EditContraceptiveScreen
            aoVoltar={jest.fn()}
        />
    );

    expect(screen.getByText('Anticoncepcional indisponível')).toBeOnTheScreen();
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar os dados para edição.');
    expect(mockContraceptiveForm).not.toHaveBeenCalled();
});

test('atualiza e mostra o sucesso somente depois da resposta', async () => {
    const aoAtualizar = jest.fn().mockResolvedValue(anticoncepcionalAtualizado);
    const aoVoltar = jest.fn();

    await render(
        <EditContraceptiveScreen
            anticoncepcional={anticoncepcional}
            aoAtualizar={aoAtualizar}
            aoExcluir={jest.fn()}
            aoVoltar={aoVoltar}
        />
    );

    const propriedadesFormulario = mockContraceptiveForm.mock.calls.at(-1)[0];

    await act(async () => {
        await propriedadesFormulario.onSubmit(anticoncepcionalAtualizado);
    });

    expect(aoAtualizar).toHaveBeenCalledTimes(1);
    expect(aoAtualizar).toHaveBeenCalledWith(anticoncepcionalAtualizado);

    const modalSucesso = obterModal('Anticoncepcional atualizado com sucesso');

    expect(modalSucesso.visivel).toBe(true);
    expect(aoVoltar).not.toHaveBeenCalled();

    await act(async () => {
        modalSucesso.acaoPrincipal.aoPressionar();
    });

    expect(aoVoltar).toHaveBeenCalledTimes(1);
});

test('bloqueia duas atualizações iniciadas antes da próxima renderização', async () => {
    const requisicao = criarPromessaControlada();
    const aoAtualizar = jest.fn().mockReturnValue(requisicao.promessa);

    await render(
        <EditContraceptiveScreen
            anticoncepcional={anticoncepcional}
            aoAtualizar={aoAtualizar}
            aoExcluir={jest.fn()}
            aoVoltar={jest.fn()}
        />
    );

    const propriedadesFormulario = mockContraceptiveForm.mock.calls.at(-1)[0];
    let primeiraAtualizacao;
    let segundaAtualizacao;

    await act(async () => {
        primeiraAtualizacao = propriedadesFormulario.onSubmit(anticoncepcionalAtualizado);
        segundaAtualizacao = await propriedadesFormulario.onSubmit(anticoncepcionalAtualizado);
    });

    expect(segundaAtualizacao).toBe(false);
    expect(aoAtualizar).toHaveBeenCalledTimes(1);

    await act(async () => {
        requisicao.resolver(anticoncepcionalAtualizado);
        await primeiraAtualizacao;
    });

    expect(obterModal('Anticoncepcional atualizado com sucesso').visivel).toBe(true);
});

test('não transforma falha de atualização em sucesso', async () => {
    const falha = new Error('erro interno');
    const aoAtualizar = jest.fn().mockRejectedValue(falha);

    await render(
        <EditContraceptiveScreen
            anticoncepcional={anticoncepcional}
            aoAtualizar={aoAtualizar}
            aoExcluir={jest.fn()}
            aoVoltar={jest.fn()}
        />
    );

    const propriedadesFormulario = mockContraceptiveForm.mock.calls.at(-1)[0];

    await expect(
        act(async () => propriedadesFormulario.onSubmit(anticoncepcionalAtualizado))
    ).rejects.toThrow('erro interno');

    expect(obterModal('Anticoncepcional atualizado com sucesso')?.visivel).not.toBe(true);
});

test('abre a confirmação sem remover no primeiro toque', async () => {
    const aoExcluir = jest.fn();

    await render(
        <EditContraceptiveScreen
            anticoncepcional={anticoncepcional}
            aoAtualizar={jest.fn()}
            aoExcluir={aoExcluir}
            aoVoltar={jest.fn()}
        />
    );

    await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}));

    expect(aoExcluir).not.toHaveBeenCalled();

    const confirmacao = obterModal('Apagar anticoncepcional');

    expect(confirmacao.visivel).toBe(true);
    expect(confirmacao.mensagem).toBe('Tem certeza que deseja remover este anticoncepcional? Os alertas programados para ele serão cancelados.');
    expect(confirmacao.acaoPrincipal.texto).toBe('Remover');
    expect(confirmacao.acaoSecundaria.texto).toBe('Cancelar');
});

test('remove somente depois da confirmação e mostra o sucesso', async () => {
    const aoExcluir = jest.fn().mockResolvedValue(undefined);

    await render(
        <EditContraceptiveScreen
            anticoncepcional={anticoncepcional}
            aoAtualizar={jest.fn()}
            aoExcluir={aoExcluir}
            aoVoltar={jest.fn()}
        />
    );

    await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}));

    const confirmacao = obterModal('Apagar anticoncepcional');

    await act(async () => {
        await confirmacao.acaoPrincipal.aoPressionar();
    });

    expect(aoExcluir).toHaveBeenCalledTimes(1);
    expect(aoExcluir).toHaveBeenCalledWith('7');
    expect(obterModal('Anticoncepcional removido com sucesso').visivel).toBe(true);
});

test('bloqueia duas exclusões iniciadas antes da próxima renderização', async () => {
    const requisicao = criarPromessaControlada();
    const aoExcluir = jest.fn().mockReturnValue(requisicao.promessa);

    await render(
        <EditContraceptiveScreen
            anticoncepcional={anticoncepcional}
            aoAtualizar={jest.fn()}
            aoExcluir={aoExcluir}
            aoVoltar={jest.fn()}
        />
    );

    await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}));

    const confirmacao = obterModal('Apagar anticoncepcional');
    let primeiraExclusao;
    let segundaExclusao;

    await act(async () => {
        primeiraExclusao = confirmacao.acaoPrincipal.aoPressionar();
        segundaExclusao = await confirmacao.acaoPrincipal.aoPressionar();
    });

    expect(segundaExclusao).toBe(false);
    expect(aoExcluir).toHaveBeenCalledTimes(1);

    await act(async () => {
        requisicao.resolver();
        await primeiraExclusao;
    });

    expect(obterModal('Anticoncepcional removido com sucesso').visivel).toBe(true);
});

test('mantém a tela e mostra erro amigável quando a remoção falha', async () => {
    const aoExcluir = jest.fn().mockRejectedValue(new Error('erro interno'));

    await render(
        <EditContraceptiveScreen
            anticoncepcional={anticoncepcional}
            aoAtualizar={jest.fn()}
            aoExcluir={aoExcluir}
            aoVoltar={jest.fn()}
        />
    );

    await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}));

    const confirmacao = obterModal('Apagar anticoncepcional');

    await act(async () => {
        await confirmacao.acaoPrincipal.aoPressionar();
    });

    const erro = obterModal('Algo deu errado');

    expect(erro.visivel).toBe(true);
    expect(erro.mensagem).toBe('Ocorreu um erro ao deletar. Verifique sua conexão e tente novamente.');
    expect(screen.getByText('Editar o Anticoncepcional')).toBeOnTheScreen();
});

test('desativa a remoção quando a ação não foi fornecida', async () => {
    await render(
        <EditContraceptiveScreen
            anticoncepcional={anticoncepcional}
            aoAtualizar={jest.fn()}
            aoVoltar={jest.fn()}
        />
    );

    expect(screen.getByRole('button', {name: 'Apagar medicação'})).toBeDisabled();
});