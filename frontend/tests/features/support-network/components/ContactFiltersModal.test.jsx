//Testa rascunho, aplicação e limpeza dos filtros de contatos.
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');

    function criarIcone(nome) {
        return function Icone(propriedades) {
            return React.createElement(View, {
                ...propriedades,
                testID: propriedades.testID ?? nome
            });
        };
    }

    return {
        CheckCircleIcon: criarIcone('CheckCircleIcon'),
        CircleIcon: criarIcone('CircleIcon')
    };
});

import {
    ESTADOS_CONTATO,
    ContactFiltersModal,
    filtrosEstaoVazios,
    normalizarCategorias,
    normalizarFiltros
} from '../../../../src/features/support-network/components/ContactFiltersModal/ContactFiltersModal';

const categorias = Object.freeze([
    Object.freeze({
        id: 2,
        nome: 'Parceiro'
    }),
    Object.freeze({
        id: 1,
        nome: 'Família'
    }),
    Object.freeze({
        id: 3,
        nome: 'Profissionais'
    }),
    Object.freeze({
        id: 4,
        nome: 'Rede Próxima'
    })
]);

describe('ContactFiltersModal', () => {
    test('não apresenta conteúdo quando está invisível', async () => {
        await render(
            <ContactFiltersModal
                visivel={false}
                filtros={{}}
                categorias={categorias}
                aoAplicar={jest.fn()}
                aoFechar={jest.fn()}
            />
        );

        expect(screen.queryByText('Filtrar Contatos')).toBeNull();
    });

    test('apresenta estados e categorias do protótipo', async () => {
        await render(
            <ContactFiltersModal
                visivel
                filtros={{}}
                categorias={categorias}
                aoAplicar={jest.fn()}
                aoFechar={jest.fn()}
            />
        );

        expect(screen.getByText('Filtrar Contatos')).toBeOnTheScreen();

        expect(screen.getByText('FILTRO DE TIPO DE CONTATO')).toBeOnTheScreen();

        expect(screen.getByText('FILTRO DE TIPO DE PERMISSÃO')).toBeOnTheScreen();

        expect(screen.getAllByRole('checkbox')).toHaveLength(9);

        expect(
            screen.getByRole('checkbox', {
                name: 'Convite Recusado, filtro de tipo de contato'
            })
        ).toBeOnTheScreen();

        expect(
            screen.getByRole('checkbox', {
                name: 'Permissões Individuais, filtro de tipo de permissão'
            })
        ).toBeOnTheScreen();
    });

    test('restaura os filtros aplicados ao abrir', async () => {
        await render(
            <ContactFiltersModal
                visivel
                filtros={{
                    estados: ['pendente', 'ativo'],
                    categoriaIds: [2],
                    permissaoIndividual: true
                }}
                categorias={categorias}
                aoAplicar={jest.fn()}
                aoFechar={jest.fn()}
            />
        );

        expect(
            screen.getByRole('checkbox', {
                name: 'Pendente, filtro de tipo de contato'
            })
        ).toBeChecked();

        expect(
            screen.getByRole('checkbox', {
                name: 'Ativo, filtro de tipo de contato'
            })
        ).not.toBeChecked();

        expect(
            screen.getByRole('checkbox', {
                name: 'Parceiro, filtro de tipo de permissão'
            })
        ).toBeChecked();

        expect(
            screen.getByRole('checkbox', {
                name: 'Permissões Individuais, filtro de tipo de permissão'
            })
        ).toBeChecked();
    });

    test('permite selecionar vários filtros e aplicar', async () => {
        const aoAplicar = jest.fn();

        await render(
            <ContactFiltersModal
                visivel
                filtros={{}}
                categorias={categorias}
                aoAplicar={aoAplicar}
                aoFechar={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('checkbox', {
                name: 'Ativo, filtro de tipo de contato'
            })
        );

        await fireEvent.press(
            screen.getByRole('checkbox', {
                name: 'Família, filtro de tipo de permissão'
            })
        );

        await fireEvent.press(
            screen.getByRole('checkbox', {
                name: 'Permissões Individuais, filtro de tipo de permissão'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Aplicar filtros de contatos'
            })
        );

        expect(aoAplicar).toHaveBeenCalledWith({
            estados: ['ativo'],
            categoriaIds: [1],
            permissaoIndividual: true
        });
    });

    test('permite selecionar somente um tipo de contato', async () => {
        const aoAplicar = jest.fn();

        await render(
            <ContactFiltersModal
                visivel
                filtros={{}}
                categorias={categorias}
                aoAplicar={aoAplicar}
                aoFechar={jest.fn()}
            />
        );

        const ativo = screen.getByRole('checkbox', {
            name: 'Ativo, filtro de tipo de contato'
        });
        const pendente = screen.getByRole('checkbox', {
            name: 'Pendente, filtro de tipo de contato'
        });

        await fireEvent.press(ativo);
        expect(ativo).toBeChecked();

        await fireEvent.press(pendente);
        expect(ativo).not.toBeChecked();
        expect(pendente).toBeChecked();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Aplicar filtros de contatos'
            })
        );

        expect(aoAplicar).toHaveBeenCalledWith({
            estados: ['pendente'],
            categoriaIds: [],
            permissaoIndividual: false
        });
    });

    test('limpa somente o rascunho antes de aplicar', async () => {
        const aoAplicar = jest.fn();

        await render(
            <ContactFiltersModal
                visivel
                filtros={{
                    estados: ['recusado'],
                    categoriaIds: [3],
                    permissaoIndividual: true
                }}
                categorias={categorias}
                aoAplicar={aoAplicar}
                aoFechar={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Limpar filtros de contatos'
            })
        );

        for (const filtro of screen.getAllByRole('checkbox')) {
            expect(filtro).not.toBeChecked();
        }

        expect(aoAplicar).not.toHaveBeenCalled();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Aplicar filtros de contatos'
            })
        );

        expect(aoAplicar).toHaveBeenCalledWith({
            estados: [],
            categoriaIds: [],
            permissaoIndividual: false
        });
    });

    test('fecha sem aplicar ao tocar fora do modal', async () => {
        const aoAplicar = jest.fn();
        const aoFechar = jest.fn();

        await render(
            <ContactFiltersModal
                visivel
                filtros={{}}
                categorias={categorias}
                aoAplicar={aoAplicar}
                aoFechar={aoFechar}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Fechar modal'
            })
        );

        expect(aoFechar).toHaveBeenCalledTimes(1);
        expect(aoAplicar).not.toHaveBeenCalled();
    });

    test('não fecha ao interagir com o conteúdo do modal', async () => {
        const aoFechar = jest.fn();

        await render(
            <ContactFiltersModal
                visivel
                filtros={{}}
                categorias={categorias}
                aoAplicar={jest.fn()}
                aoFechar={aoFechar}
            />
        );

        const pararPropagacao = jest.fn();

        fireEvent(screen.getByTestId('app-modal-caixa'), 'touchEnd', {
            stopPropagation: pararPropagacao
        });

        expect(pararPropagacao).toHaveBeenCalledTimes(1);
        expect(aoFechar).not.toHaveBeenCalled();
    });

    test('ordena e remove categorias inválidas', () => {
        expect(
            normalizarCategorias([
                {
                    id: 2,
                    nome: 'Parceiro'
                },
                {
                    id: 1,
                    nome: 'Família'
                },
                {
                    id: '2',
                    nome: 'Duplicada'
                },
                {
                    id: null,
                    nome: 'Inválida'
                }
            ])
        ).toEqual([
            {
                id: 1,
                nome: 'Família'
            },
            {
                id: 2,
                nome: 'Parceiro'
            }
        ]);
    });

    test('remove filtros desconhecidos', () => {
        expect(
            normalizarFiltros(
                {
                    estados: ['ativo', 'desconhecido'],
                    categoriaIds: [1, 999],
                    permissaoIndividual: true
                },
                categorias
            )
        ).toEqual({
            estados: ['ativo'],
            categoriaIds: [1],
            permissaoIndividual: true
        });
    });

    test('identifica uma seleção vazia', () => {
        expect(
            filtrosEstaoVazios({
                estados: [],
                categoriaIds: [],
                permissaoIndividual: false
            })
        ).toBe(true);
    });

    test('mantém fechado o catálogo de estados', () => {
        expect(ESTADOS_CONTATO.map(({ id }) => id)).toEqual([
            'pendente',
            'ativo',
            'inativo',
            'recusado'
        ]);

        expect(Object.isFrozen(ESTADOS_CONTATO)).toBe(true);
    });
});
