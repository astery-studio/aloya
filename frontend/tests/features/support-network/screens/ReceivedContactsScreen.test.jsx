import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

const mockUseReceivedContacts = jest.fn();

jest.mock('../../../../src/features/support-network/hooks/useReceivedContacts', () => ({
    useReceivedContacts: (propriedades) => mockUseReceivedContacts(propriedades)
}));

jest.mock('../../../../src/shared/layouts/MainLayout/MainLayout', () => ({
    MainLayout: ({ titulo, children }) => (
        <View testID="main-layout">
            <Text>{titulo}</Text>
            {children}
        </View>
    )
}));

jest.mock('../../../../src/features/support-network/components/ContactList/ContactList', () => ({
    ContactList: ({ aoAcao, aoAbrirResumo, aoTentarNovamente }) => (
        <View testID="contact-list">
            <Text
                accessibilityRole="button"
                accessibilityLabel="Aceitar teste"
                onPress={() => aoAcao('aceitar', contato)}
            >
                Aceitar
            </Text>

            <Text
                accessibilityRole="button"
                accessibilityLabel="Recusar teste"
                onPress={() => aoAcao('recusar', contato)}
            >
                Recusar
            </Text>

            <Text
                accessibilityRole="button"
                accessibilityLabel="Abrir resumo teste"
                onPress={() => aoAbrirResumo(contato)}
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
}));

jest.mock(
    '../../../../src/features/support-network/components/ContactPermissionsSummaryModal/ContactPermissionsSummaryModal',
    () => ({
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
    })
);

jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => {
    return function SimpleModal({ visivel, titulo, mensagem, acaoPrincipal, acaoSecundaria }) {
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
                        onPress={acaoPrincipal.aoPressionar}
                    >
                        {acaoPrincipal.texto}
                    </Text>
                ) : null}

                {acaoSecundaria ? (
                    <Text
                        accessibilityRole="button"
                        accessibilityLabel={acaoSecundaria.texto}
                        onPress={acaoSecundaria.aoPressionar}
                    >
                        {acaoSecundaria.texto}
                    </Text>
                ) : null}
            </View>
        );
    };
});

jest.mock('../../../../src/shared/hooks/useTheme', () => ({
    useTheme: () => ({
        escuro: false,
        cores: {
            marca: {
                primaria: '#C85A44'
            },
            interface: {
                fundo: '#F7F5F0',
                textoSecundario: '#5C5C59'
            },
            icones: {
                configuracoes: {
                    laranja: {
                        caixa: '#F7E8DA'
                    }
                }
            }
        }
    })
}));

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

test('apresenta a tela e a lista recebida', () => {
    render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    expect(screen.getByText('Contatos')).toBeOnTheScreen();

    expect(screen.getByTestId('contact-list')).toBeOnTheScreen();

    expect(mockUseReceivedContacts).toHaveBeenCalledWith({
        service: {},
        onSessaoExpirada: undefined
    });
});

test('aceita o convite sem confirmação intermediária', () => {
    const estado = criarEstado();

    mockUseReceivedContacts.mockReturnValue(estado);

    render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    fireEvent.press(
        screen.getByRole('button', {
            name: 'Aceitar teste'
        })
    );

    expect(estado.responder).toHaveBeenCalledWith(7, 'aceitar');

    expect(screen.queryByLabelText('Recusar Convite')).toBeNull();
});

test('solicita confirmação antes de recusar', () => {
    const estado = criarEstado();

    mockUseReceivedContacts.mockReturnValue(estado);

    render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    fireEvent.press(
        screen.getByRole('button', {
            name: 'Recusar teste'
        })
    );

    expect(screen.getByLabelText('Recusar Convite')).toHaveTextContent(
        'Você tem certeza que deseja recusar o convite de Julia?'
    );

    expect(estado.responder).not.toHaveBeenCalled();

    fireEvent.press(
        screen.getByRole('button', {
            name: 'Recusar'
        })
    );

    expect(estado.responder).toHaveBeenCalledWith(7, 'recusar');
});

test('abre e fecha o resumo de permissões', () => {
    render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    fireEvent.press(
        screen.getByRole('button', {
            name: 'Abrir resumo teste'
        })
    );

    expect(screen.getByTestId('permissions-summary')).toHaveTextContent('Julia');

    fireEvent.press(
        screen.getByRole('button', {
            name: 'Fechar resumo'
        })
    );

    expect(screen.queryByTestId('permissions-summary')).toBeNull();
});

test('apresenta o resultado da resposta', () => {
    const estado = criarEstado({
        resultadoAcao: {
            status: 'ativo',
            mensagem: 'Convite aceito com sucesso.'
        }
    });

    mockUseReceivedContacts.mockReturnValue(estado);

    render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    expect(screen.getByLabelText('Convite aceito com sucesso.')).toBeOnTheScreen();

    fireEvent.press(
        screen.getByRole('button', {
            name: 'OK'
        })
    );

    expect(estado.limparResultado).toHaveBeenCalledTimes(1);
});

test('apresenta erro amigável da operação', () => {
    const estado = criarEstado({
        erroAcao: 'Não foi possível responder ao convite no momento. Tente novamente.'
    });

    mockUseReceivedContacts.mockReturnValue(estado);

    render(<ReceivedContactsScreen service={{}} onSelecionarAba={jest.fn()} />);

    expect(screen.getByLabelText('Algo deu errado')).toHaveTextContent(
        'Não foi possível responder ao convite no momento. Tente novamente.'
    );

    fireEvent.press(
        screen.getByRole('button', {
            name: 'Voltar'
        })
    );

    expect(estado.limparResultado).toHaveBeenCalledTimes(1);
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
