import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const mockUseReceivedContacts = jest.fn();

jest.mock('../../../../src/features/support-network/hooks/useReceivedContacts', () => ({
    useReceivedContacts: (propriedades) => mockUseReceivedContacts(propriedades)
}));

jest.mock('../../../../src/shared/layouts/MainLayout/MainLayout', () => {
    const { Text, View } = require('react-native');

    return {
        MainLayout: ({ titulo, children }) => (
            <View testID="main-layout">
                <Text>{titulo}</Text>
                {children}
            </View>
        )
    };
});

jest.mock('../../../../src/features/support-network/components/ContactList/ContactList', () => {
    const { Text, View } = require('react-native');

    const contatoRecebido = {
        id: 7,
        identificacao: 'Julia',
        email: 'julia@exemplo.com',
        status: 'pendente',
        vinculo: {
            tipo: 'categoria',
            nomeCategoria: 'Profissional',
            permissoes: ['consultas']
        }
    };

    return {
        ContactList: ({ aoAcao, aoAbrirResumo, aoTentarNovamente }) => (
            <View testID="contact-list">
                <Text
                    accessibilityRole="button"
                    accessibilityLabel="Aceitar teste"
                    onPress={() => aoAcao('aceitar', contatoRecebido)}
                >
                    Aceitar
                </Text>

                <Text
                    accessibilityRole="button"
                    accessibilityLabel="Recusar teste"
                    onPress={() => aoAcao('recusar', contatoRecebido)}
                >
                    Recusar
                </Text>

                <Text
                    accessibilityRole="button"
                    accessibilityLabel="Abrir resumo teste"
                    onPress={() => aoAbrirResumo(contatoRecebido)}
                >
                    Resumo
                </Text>

                <Text
                    accessibilityRole="button"
                    accessibilityLabel="Tentar listar novamente"
                    onPress={aoTentarNovamente}
                >
                    Tentar novamente
                </Text>
            </View>
        )
    };
});

jest.mock(
    '../../../../src/features/support-network/components/ContactPermissionsSummaryModal/ContactPermissionsSummaryModal',
    () => {
        const { Text, View } = require('react-native');

        return {
            ContactPermissionsSummaryModal: ({ visivel, nomeContato, aoFechar }) =>
                visivel ? (
                    <View testID="permissions-summary">
                        <Text>{nomeContato}</Text>

                        <Text
                            accessibilityRole="button"
                            accessibilityLabel="Fechar resumo"
                            onPress={aoFechar}
                        >
                            Fechar
                        </Text>
                    </View>
                ) : null
        };
    }
);

jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => {
    const { Text, View } = require('react-native');

    function SimpleModal({ visivel, titulo, mensagem, acaoPrincipal, acaoSecundaria }) {
        if (!visivel) {
            return null;
        }

        return (
            <View accessibilityRole="alert" accessibilityLabel={titulo}>
                <Text>{titulo}</Text>

                {mensagem ? <Text>{mensagem}</Text> : null}

                {acaoPrincipal ? (
                    <Text
                        accessibilityRole="button"
                        accessibilityLabel={acaoPrincipal.texto}
                        accessibilityState={{
                            disabled: Boolean(acaoPrincipal.desativado)
                        }}
                        onPress={acaoPrincipal.aoPressionar}
                    >
                        {acaoPrincipal.texto}
                    </Text>
                ) : null}

                {acaoSecundaria ? (
                    <Text
                        accessibilityRole="button"
                        accessibilityLabel={acaoSecundaria.texto}
                        accessibilityState={{
                            disabled: Boolean(acaoSecundaria.desativado)
                        }}
                        onPress={acaoSecundaria.aoPressionar}
                    >
                        {acaoSecundaria.texto}
                    </Text>
                ) : null}
            </View>
        );
    }

    return {
        __esModule: true,
        default: SimpleModal
    };
});

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    BellIcon: () => null,
    WarningCircleIcon: () => null
}));

import {
    ReceivedContactsScreen,
    obterNomeContato
} from '../../../../src/features/support-network/screens/ReceivedContactsScreen/ReceivedContactsScreen';

const contato = {
    id: 7,
    identificacao: 'Julia',
    email: 'julia@exemplo.com',
    status: 'pendente',
    vinculo: {
        tipo: 'categoria',
        nomeCategoria: 'Profissional',
        permissoes: ['consultas']
    }
};

function criarEstado(sobrescritas = {}) {
    return {
        contatos: [contato],
        resumo: {
            total: 1,
            pendentes: 1,
            ativos: 0
        },
        carregando: false,
        atualizando: false,
        erro: null,
        erroAcao: null,
        resultadoAcao: null,
        contatoEmAndamentoId: null,
        acaoEmAndamento: null,
        tentarNovamente: jest.fn(),
        atualizarLista: jest.fn(),
        responder: jest.fn().mockResolvedValue(true),
        limparResultado: jest.fn(),
        ...sobrescritas
    };
}

beforeEach(() => {
    jest.clearAllMocks();

    mockUseReceivedContacts.mockReturnValue(criarEstado());
});

test('apresenta a tela e a lista recebida', async () => {
    await render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    expect(screen.getByText('Contatos')).toBeOnTheScreen();

    expect(screen.getByTestId('contact-list')).toBeOnTheScreen();

    expect(mockUseReceivedContacts).toHaveBeenCalledWith({
        service: {},
        onSessaoExpirada: undefined
    });
});

test('aceita o convite sem confirmação intermediária', async () => {
    const estado = criarEstado();

    mockUseReceivedContacts.mockReturnValue(estado);

    await render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Aceitar teste'
        })
    );

    expect(estado.responder).toHaveBeenCalledWith(7, 'aceitar');

    expect(screen.queryByLabelText('Recusar Convite')).toBeNull();
});

test('solicita confirmação antes de recusar', async () => {
    const estado = criarEstado();

    mockUseReceivedContacts.mockReturnValue(estado);

    await render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Recusar teste'
        })
    );

    expect(screen.getByLabelText('Recusar Convite')).toBeOnTheScreen();

    expect(
        screen.getByText(
            'Você tem certeza que deseja recusar o convite de Julia? Esta ação não pode ser desfeita.'
        )
    ).toBeOnTheScreen();

    expect(estado.responder).not.toHaveBeenCalled();

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Recusar'
        })
    );

    expect(estado.responder).toHaveBeenCalledWith(7, 'recusar');
});

test('cancela a recusa sem responder o convite', async () => {
    const estado = criarEstado();

    mockUseReceivedContacts.mockReturnValue(estado);

    await render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Recusar teste'
        })
    );

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Cancelar'
        })
    );

    expect(screen.queryByLabelText('Recusar Convite')).toBeNull();

    expect(estado.responder).not.toHaveBeenCalled();
});

test('abre e fecha o resumo de permissões', async () => {
    await render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Abrir resumo teste'
        })
    );

    expect(screen.getByTestId('permissions-summary')).toBeOnTheScreen();

    expect(screen.getByText('Julia')).toBeOnTheScreen();

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Fechar resumo'
        })
    );

    expect(screen.queryByTestId('permissions-summary')).toBeNull();
});

test('apresenta o resultado da resposta', async () => {
    const estado = criarEstado({
        resultadoAcao: {
            status: 'ativo',
            mensagem: 'Convite aceito com sucesso.'
        }
    });

    mockUseReceivedContacts.mockReturnValue(estado);

    await render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    expect(screen.getByLabelText('Convite aceito com sucesso.')).toBeOnTheScreen();

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'OK'
        })
    );

    expect(estado.limparResultado).toHaveBeenCalledTimes(1);
});

test('apresenta erro amigável da operação', async () => {
    const mensagem = 'Não foi possível responder ao convite no momento. Tente novamente.';

    const estado = criarEstado({
        erroAcao: mensagem
    });

    mockUseReceivedContacts.mockReturnValue(estado);

    await render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    expect(screen.getByLabelText('Algo deu errado')).toBeOnTheScreen();

    expect(screen.getByText(mensagem)).toBeOnTheScreen();

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Voltar'
        })
    );

    expect(estado.limparResultado).toHaveBeenCalledTimes(1);
});

test('encaminha a nova tentativa da listagem', async () => {
    const estado = criarEstado();

    mockUseReceivedContacts.mockReturnValue(estado);

    await render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Tentar listar novamente'
        })
    );

    expect(estado.tentarNovamente).toHaveBeenCalledTimes(1);
});

test.each([
    [
        {
            identificacao: 'Ana'
        },
        'Ana'
    ],
    [
        {
            nome: 'Beatriz'
        },
        'Beatriz'
    ],
    [
        {
            email: 'carla@exemplo.com'
        },
        'carla@exemplo.com'
    ],
    [{}, 'Contato']
])('normaliza a identificação do contato', (valor, esperado) => {
    expect(obterNomeContato(valor)).toBe(esperado);
});
