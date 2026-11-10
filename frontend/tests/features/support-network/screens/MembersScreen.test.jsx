import { act, fireEvent, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const mockUseSupportContacts = jest.fn();
const mockUseSupportCategories = jest.fn();

let mockContactListProps;
let mockResumoProps;

jest.mock('../../../../src/features/support-network/hooks/useSupportContacts', () => ({
    useSupportContacts: (...argumentos) => mockUseSupportContacts(...argumentos)
}));

jest.mock('../../../../src/features/support-network/hooks/useSupportCategories', () => ({
    useSupportCategories: (...argumentos) => mockUseSupportCategories(...argumentos)
}));

jest.mock('../../../../src/features/support-network/components/ContactList/ContactList', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        ContactList: (propriedades) => {
            mockContactListProps = propriedades;

            return React.createElement(
                View,
                {
                    testID: 'contact-list-mock'
                },
                ...propriedades.contatos.map((contato) =>
                    React.createElement(
                        Text,
                        {
                            key: contato.id
                        },
                        contato.identificacao
                    )
                ),
                propriedades.contatos[0]
                    ? React.createElement(
                          Pressable,
                          {
                              accessibilityRole: 'button',
                              accessibilityLabel: 'Ação do primeiro contato',
                              onPress: () =>
                                  propriedades.aoAcao('reenviar', propriedades.contatos[0])
                          },
                          React.createElement(Text, null, 'Ação')
                      )
                    : null,
                propriedades.contatos[1]
                    ? React.createElement(
                          Pressable,
                          {
                              accessibilityRole: 'button',
                              accessibilityLabel: 'Abrir resumo de Beatriz',
                              onPress: () => propriedades.aoAbrirResumo(propriedades.contatos[1])
                          },
                          React.createElement(Text, null, 'Resumo')
                      )
                    : null
            );
        }
    };
});

jest.mock(
    '../../../../src/features/support-network/components/ContactFiltersModal/ContactFiltersModal',
    () => {
        const React = require('react');
        const { Pressable, Text } = require('react-native');

        return {
            ContactFiltersModal: (propriedades) => {
                if (!propriedades.visivel) {
                    return null;
                }

                return React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Aplicar filtro de teste',
                        onPress: () =>
                            propriedades.aoAplicar({
                                estados: ['ativo'],
                                categoriaIds: [],
                                permissaoIndividual: true
                            })
                    },
                    React.createElement(Text, null, 'Filtros abertos')
                );
            }
        };
    }
);

jest.mock(
    '../../../../src/features/support-network/components/ContactPermissionsSummaryModal/ContactPermissionsSummaryModal',
    () => ({
        ContactPermissionsSummaryModal: (propriedades) => {
            mockResumoProps = propriedades;

            return null;
        }
    })
);

import {
    MembersScreen,
    filtrarContatos
} from '../../../../src/features/support-network/screens/MembersScreen';

const contatos = [
    {
        id: 1,
        identificacao: 'Ana',
        status: 'pendente',
        vinculo: {
            tipo: 'categoria',
            categoria: {
                id: 10,
                nome: 'Família'
            },
            permissoes: []
        }
    },
    {
        id: 2,
        identificacao: 'Beatriz',
        status: 'ativo',
        vinculo: {
            tipo: 'individual',
            categoria: null,
            permissoes: ['geral.fase_atual']
        }
    }
];

function criarEstado(substituicoes = {}) {
    return {
        contatos,
        carregando: false,
        atualizando: false,
        erro: null,
        erroAcao: null,
        resultadoAcao: null,
        contatoEmAndamentoId: null,
        acaoEmAndamento: null,
        atualizarLista: jest.fn(),
        reenviarConvite: jest.fn(),
        limparResultadoAcao: jest.fn(),
        ...substituicoes
    };
}

describe('MembersScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockContactListProps = null;
        mockResumoProps = null;

        mockUseSupportContacts.mockReturnValue(criarEstado());

        mockUseSupportCategories.mockReturnValue({
            categorias: [
                {
                    id: 10,
                    nome: 'Família'
                }
            ],
            carregando: false,
            erro: null
        });
    });

    test('carrega os contatos e categorias pelos serviços recebidos', async () => {
        const service = {};
        const categoriasService = {};

        await render(<MembersScreen service={service} categoriasService={categoriasService} />);

        expect(mockUseSupportContacts).toHaveBeenCalledWith({
            service,
            onSessaoExpirada: undefined
        });

        expect(mockUseSupportCategories).toHaveBeenCalledWith({
            service: categoriasService,
            onSessaoExpirada: undefined
        });

        expect(screen.getByText('Rede de Apoio')).toBeOnTheScreen();

        expect(screen.getByText('Ana')).toBeOnTheScreen();

        expect(screen.getByText('Beatriz')).toBeOnTheScreen();
    });

    test('aplica E entre estado e tipo de permissão', () => {
        expect(
            filtrarContatos(contatos, {
                estados: ['ativo'],
                categoriaIds: [],
                permissaoIndividual: true
            }).map(({ id }) => id)
        ).toEqual([2]);

        expect(
            filtrarContatos(contatos, {
                estados: ['pendente'],
                categoriaIds: [10],
                permissaoIndividual: false
            }).map(({ id }) => id)
        ).toEqual([1]);

        expect(
            filtrarContatos(contatos, {
                estados: ['ativo'],
                categoriaIds: [10],
                permissaoIndividual: false
            })
        ).toEqual([]);
    });

    test('abre e aplica os filtros', async () => {
        await render(<MembersScreen />);

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Filtrar contatos'
            })
        );

        expect(screen.getByText('Filtros abertos')).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Aplicar filtro de teste'
            })
        );

        expect(mockContactListProps.contatos.map(({ id }) => id)).toEqual([2]);

        expect(
            screen.getByRole('button', {
                name: 'Limpar filtros de contatos'
            })
        ).toBeOnTheScreen();
    });

    test('limpa os filtros aplicados', async () => {
        await render(<MembersScreen />);

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Filtrar contatos'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Aplicar filtro de teste'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Limpar filtros de contatos'
            })
        );

        expect(mockContactListProps.contatos.map(({ id }) => id)).toEqual([1, 2]);
    });

    test('abre categorias e cadastro de contato', async () => {
        const onAbrirCategorias = jest.fn();

        const onAdicionarContato = jest.fn();

        await render(
            <MembersScreen
                onAbrirCategorias={onAbrirCategorias}
                onAdicionarContato={onAdicionarContato}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Abrir categorias de permissão'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Adicionar novo contato à Rede de Apoio'
            })
        );

        expect(onAbrirCategorias).toHaveBeenCalledTimes(1);

        expect(onAdicionarContato).toHaveBeenCalledTimes(1);
    });

    test('reenvia convite pelo card', async () => {
        const reenviarConvite = jest.fn();

        mockUseSupportContacts.mockReturnValue(
            criarEstado({
                reenviarConvite
            })
        );

        await render(<MembersScreen />);

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Ação do primeiro contato'
            })
        );

        expect(reenviarConvite).toHaveBeenCalledWith(1);
    });

    test('mostra alertas provisórios de edição e remoção', async () => {
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});

        await render(<MembersScreen />);

        await act(async () => {
            mockContactListProps.aoAcao('alterar_vinculo', contatos[1]);
            await Promise.resolve();
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Alterar vínculo',
            expect.stringContaining('HU-030')
        );

        await act(async () => {
            mockContactListProps.aoAcao('remover', contatos[0]);
            await Promise.resolve();
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Cancelar convite',
            expect.stringContaining('HU-031')
        );
    });

    test('abre o resumo com as permissões do contato', async () => {
        await render(<MembersScreen />);

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Abrir resumo de Beatriz'
            })
        );

        expect(mockResumoProps).toMatchObject({
            visivel: true,
            perspectiva: 'enviado',
            nomeContato: 'Beatriz',
            permissoes: ['geral.fase_atual'],
            vinculo: contatos[1].vinculo
        });
    });
});
