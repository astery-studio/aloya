//Testa expansão, estados e seleção do acordeão de categorias.
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');

    function criarIcone(nome) {
        return function IconeFalso(propriedades) {
            return React.createElement(View, {
                ...propriedades,
                testID: propriedades.testID ?? nome
            });
        };
    }

    return {
        CaretDownIcon: criarIcone('CaretDownIcon'),
        CaretUpIcon: criarIcone('CaretUpIcon'),
        CheckCircleIcon: criarIcone('CheckCircleIcon'),
        CircleIcon: criarIcone('CircleIcon'),
        UsersThreeIcon: criarIcone('UsersThreeIcon')
    };
});

import {
    SupportCategorySelector,
    calcularAlturaSelector,
    idsIguais,
    normalizarCategorias
} from '../../../../src/features/support-network/components/SupportCategorySelector/SupportCategorySelector';

const categorias = Object.freeze([
    Object.freeze({
        id: 2,
        nome: 'Parceiro'
    }),
    Object.freeze({
        id: 1,
        nome: 'Família'
    })
]);

describe('SupportCategorySelector', () => {
    test('começa recolhido por padrão', async () => {
        await render(<SupportCategorySelector categorias={categorias} aoSelecionar={jest.fn()} />);

        expect(
            screen.getByRole('button', {
                name: 'Categorias Cadastradas'
            })
        ).toHaveProp('accessibilityState', {
            expanded: false,
            disabled: false
        });

        expect(screen.queryByText('Família')).toBeNull();

        expect(screen.getByTestId('icone-expandir-categorias')).toBeOnTheScreen();

        expect(screen.getByTestId('support-category-selector')).toHaveStyle({
            width: '100%',
            maxWidth: 342,
            height: 60,
            borderWidth: 1.41,
            borderRadius: 14
        });

        expect(screen.getByTestId('icone-categorias-cadastradas')).toHaveProp('size', 18);
    });

    test('expande e recolhe as categorias pelo cabeçalho', async () => {
        await render(<SupportCategorySelector categorias={categorias} aoSelecionar={jest.fn()} />);

        const cabecalho = screen.getByRole('button', {
            name: 'Categorias Cadastradas'
        });

        await fireEvent.press(cabecalho);

        expect(screen.getByText('Família')).toBeOnTheScreen();
        expect(screen.getByText('Parceiro')).toBeOnTheScreen();

        expect(screen.getByTestId('icone-recolher-categorias')).toBeOnTheScreen();

        expect(screen.getByTestId('support-category-selector')).toHaveStyle({
            height: 164,
            borderWidth: 1.41
        });

        await fireEvent.press(cabecalho);

        expect(screen.queryByText('Família')).toBeNull();
    });

    test('pode iniciar expandido e ordena as categorias', async () => {
        await render(
            <SupportCategorySelector
                categorias={categorias}
                aoSelecionar={jest.fn()}
                inicialmenteExpandido
            />
        );

        const opcoes = screen.getAllByRole('radio');

        expect(opcoes).toHaveLength(2);
        expect(opcoes[0]).toHaveAccessibleName('Família');
        expect(opcoes[1]).toHaveAccessibleName('Parceiro');
    });

    test('indica a categoria selecionada', async () => {
        await render(
            <SupportCategorySelector
                categorias={categorias}
                categoriaId="1"
                aoSelecionar={jest.fn()}
                inicialmenteExpandido
            />
        );

        expect(
            screen.getByRole('radio', {
                name: 'Família'
            })
        ).toHaveProp('accessibilityState', {
            selected: true,
            disabled: false
        });

        expect(screen.getByTestId('categoria-selecionada-1')).toHaveProp('weight', 'fill');
        expect(screen.getByTestId('categoria-selecionada-1')).toHaveProp('color', '#2C4C3B');
    });

    test('encaminha o identificador original da categoria', async () => {
        const aoSelecionar = jest.fn();

        await render(
            <SupportCategorySelector
                categorias={categorias}
                categoriaId={1}
                aoSelecionar={aoSelecionar}
                inicialmenteExpandido
            />
        );

        await fireEvent.press(
            screen.getByRole('radio', {
                name: 'Parceiro'
            })
        );

        expect(aoSelecionar).toHaveBeenCalledWith(2);
    });

    test('desmarca a categoria atual ao pressioná-la novamente', async () => {
        const aoSelecionar = jest.fn();

        await render(
            <SupportCategorySelector
                categorias={categorias}
                categoriaId={1}
                aoSelecionar={aoSelecionar}
                inicialmenteExpandido
            />
        );

        await fireEvent.press(
            screen.getByRole('radio', {
                name: 'Família'
            })
        );

        expect(aoSelecionar).toHaveBeenCalledTimes(1);
        expect(aoSelecionar).toHaveBeenCalledWith(null);
    });

    test('mostra o estado de carregamento', async () => {
        await render(
            <SupportCategorySelector
                categorias={categorias}
                aoSelecionar={jest.fn()}
                carregando
                inicialmenteExpandido
            />
        );

        expect(screen.getByLabelText('Carregando categorias')).toBeOnTheScreen();

        expect(screen.getByText('Carregando categorias...')).toBeOnTheScreen();

        expect(screen.queryByText('Família')).toBeNull();
    });

    test('mostra o estado vazio', async () => {
        await render(
            <SupportCategorySelector
                categorias={[]}
                aoSelecionar={jest.fn()}
                inicialmenteExpandido
            />
        );

        expect(screen.getByText('Você ainda não criou nenhuma categoria.')).toBeOnTheScreen();
    });

    test('mostra o erro e permite tentar novamente', async () => {
        const aoTentarNovamente = jest.fn();

        await render(
            <SupportCategorySelector
                erro="Não foi possível carregar as categorias."
                aoSelecionar={jest.fn()}
                aoTentarNovamente={aoTentarNovamente}
                inicialmenteExpandido
            />
        );

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Não foi possível carregar as categorias.'
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Tentar carregar categorias novamente'
            })
        );

        expect(aoTentarNovamente).toHaveBeenCalledTimes(1);
    });

    test('bloqueia o acordeão quando está desabilitado', async () => {
        await render(
            <SupportCategorySelector
                categorias={categorias}
                aoSelecionar={jest.fn()}
                desabilitado
            />
        );

        const cabecalho = screen.getByRole('button', {
            name: 'Categorias Cadastradas'
        });

        expect(cabecalho).toBeDisabled();

        await fireEvent.press(cabecalho);

        expect(screen.queryByText('Família')).toBeNull();
    });

    test('bloqueia as opções sem função de seleção', async () => {
        await render(<SupportCategorySelector categorias={categorias} inicialmenteExpandido />);

        expect(
            screen.getByRole('radio', {
                name: 'Família'
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('radio', {
                name: 'Parceiro'
            })
        ).toBeDisabled();
    });

    test('ignora categorias inválidas e identificadores repetidos', () => {
        expect(
            normalizarCategorias([
                {
                    id: 2,
                    nome: 'Parceiro'
                },
                {
                    id: '2',
                    nome: 'Duplicada'
                },
                {
                    id: null,
                    nome: 'Sem identificador'
                },
                {
                    id: 3,
                    nome: '   '
                },
                null
            ])
        ).toEqual([
            {
                id: 2,
                nome: 'Parceiro'
            }
        ]);
    });

    test.each([
        [1, '1', true],
        ['categoria-a', 'categoria-a', true],
        [1, 2, false],
        [null, null, false],
        ['', '', false]
    ])('compara os identificadores %p e %p', (primeiroId, segundoId, esperado) => {
        expect(idsIguais(primeiroId, segundoId)).toBe(esperado);
    });

    test.each([
        [{ expandido: false, quantidadeCategorias: 10 }, 60],
        [{ expandido: true, quantidadeCategorias: 1 }, 112],
        [{ expandido: true, quantidadeCategorias: 2 }, 164],
        [{ expandido: true, quantidadeCategorias: 3 }, 216],
        [{ expandido: true, quantidadeCategorias: 4 }, 268],
        [{ expandido: true, quantidadeCategorias: 8 }, 268],
        [{ expandido: true, quantidadeCategorias: 0 }, 156],
        [{ expandido: true, quantidadeCategorias: 2, possuiEstado: true }, 156]
    ])('calcula a altura responsiva do seletor %#', (entrada, esperado) => {
        expect(calcularAlturaSelector(entrada)).toBe(esperado);
    });
});
