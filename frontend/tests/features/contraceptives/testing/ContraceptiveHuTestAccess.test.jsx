//Testa somente a ponte provisória usada para acessar as HU-021 e HU-022.
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ContraceptiveHuTestAccess } from '../../../../src/features/contraceptives/testing/ContraceptiveHuTestAccess';

const mockEditContraceptiveScreen = jest.fn(() => null);

jest.mock('../../../../src/features/contraceptives/screens/EditContraceptiveScreen', () => ({
    EditContraceptiveScreen: (props) => mockEditContraceptiveScreen(props)
}));

jest.mock('../../../../src/shared/components/navigation/Header/Header', () => {
    const {
        Text
    } = require('react-native');

    return {
        Header: ({
            titulo
        }) => (
            <Text>
                {titulo}
            </Text>
        )
    };
});

const original = {
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

const atualizado = {
    ...original,
    nome: 'Mercilon atualizado'
};

beforeEach(() => {
    jest.clearAllMocks();
});

test('carrega os registros reais e oferece acesso à edição', async () => {
    const service = {
        listar: jest.fn().mockResolvedValue([
            original
        ])
    };

    await render(
        <ContraceptiveHuTestAccess
            service={service}
        />
    );

    expect(
        await screen.findByRole('button', {
            name: 'Editar Mercilon'
        })
    ).toBeOnTheScreen();

    expect(service.listar).toHaveBeenCalledTimes(1);
});

test('abre a tela das HU-021 e HU-022 com o item selecionado', async () => {
    const service = {
        listar: jest.fn().mockResolvedValue([
            original
        ])
    };

    await render(
        <ContraceptiveHuTestAccess
            service={service}
        />
    );

    await fireEvent.press(
        await screen.findByRole('button', {
            name: 'Editar Mercilon'
        })
    );

    expect(mockEditContraceptiveScreen).toHaveBeenCalledWith(
        expect.objectContaining({
            anticoncepcional: original,
            aoAtualizar: expect.any(Function),
            aoExcluir: expect.any(Function),
            aoVoltar: expect.any(Function)
        })
    );
});

test('atualiza o item sem solicitar novamente a lista completa', async () => {
    const service = {
        listar: jest.fn().mockResolvedValue([
            original
        ]),
        editar: jest.fn().mockResolvedValue(atualizado)
    };

    await render(
        <ContraceptiveHuTestAccess
            service={service}
        />
    );

    await fireEvent.press(
        await screen.findByRole('button', {
            name: 'Editar Mercilon'
        })
    );

    const propriedades = mockEditContraceptiveScreen.mock.calls.at(-1)[0];

    await act(async () => {
        await propriedades.aoAtualizar(atualizado);
        propriedades.aoVoltar();
    });

    expect(service.editar).toHaveBeenCalledWith('7', atualizado);
    expect(service.listar).toHaveBeenCalledTimes(1);

    expect(
        await screen.findByRole('button', {
            name: 'Editar Mercilon atualizado'
        })
    ).toBeOnTheScreen();
});

test('remove o item sem solicitar novamente a lista completa', async () => {
    const service = {
        listar: jest.fn().mockResolvedValue([
            original
        ]),
        remover: jest.fn().mockResolvedValue({
            id: '7'
        })
    };

    await render(
        <ContraceptiveHuTestAccess
            service={service}
        />
    );

    await fireEvent.press(
        await screen.findByRole('button', {
            name: 'Editar Mercilon'
        })
    );

    const propriedades = mockEditContraceptiveScreen.mock.calls.at(-1)[0];

    await act(async () => {
        await propriedades.aoExcluir('7');
        propriedades.aoVoltar();
    });

    expect(service.remover).toHaveBeenCalledWith('7');
    expect(service.listar).toHaveBeenCalledTimes(1);

    await waitFor(() => {
        expect(
            screen.queryByRole('button', {
                name: 'Editar Mercilon'
            })
        ).not.toBeOnTheScreen();
    });
});

test('encerra o acesso quando a sessão expira no carregamento', async () => {
    const falha = Object.assign(
        new Error('Autenticação necessária.'),
        {
            status: 401
        }
    );

    const onSessaoExpirada = jest.fn();

    const service = {
        listar: jest.fn().mockRejectedValue(falha)
    };

    await render(
        <ContraceptiveHuTestAccess
            service={service}
            onSessaoExpirada={onSessaoExpirada}
        />
    );

    await waitFor(() => {
        expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
    });

    expect(
        screen.queryByText('Não foi possível carregar os anticoncepcionais.')
    ).not.toBeOnTheScreen();
});