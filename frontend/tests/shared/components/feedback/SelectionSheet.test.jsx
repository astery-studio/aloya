import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => {
    const React = require('react');
    const { View } = require('react-native');

    function BottomSheet({ children, visivel, onFechar }) {
        return React.createElement(
            View,
            {
                testID: 'bottom-sheet',
                visivel,
                onFechar
            },
            children
        );
    }

    return {
        BottomSheet
    };
});

jest.mock('../../../../src/shared/layouts/BottomSheet/BottomSheetLayout', () => {
    const React = require('react');
    const { Text, View } = require('react-native');

    function BottomSheetLayout({ children, titulo, onFechar }) {
        return React.createElement(
            View,
            {
                testID: 'bottom-sheet-layout',
                onFechar
            },
            React.createElement(Text, null, titulo),
            children
        );
    }

    return {
        BottomSheetLayout
    };
});

import { SelectionSheet } from '../../../../src/shared/components/feedback/SelectionSheet/SelectionSheet';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

const IconeTeste = jest.fn(() => null);

const opcoes = [
    {
        id: 'mensal',
        label: 'Mensal',
        descricao: 'Uma vez por mês'
    },
    {
        id: 'trimestral',
        label: 'Trimestral',
        descricao: 'Uma vez a cada três meses'
    },
    {
        id: 'anual',
        label: 'Anual'
    }
];

function renderizarSeletor(propriedades = {}, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <SelectionSheet
                visivel
                titulo="Selecionar frequência"
                opcoes={opcoes}
                valorSelecionado="mensal"
                onSelecionar={jest.fn()}
                onFechar={jest.fn()}
                {...propriedades}
            />
        </ThemeProvider>
    );
}

describe('SelectionSheet', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renderiza título e propriedades do painel', async () => {
        const onFechar = jest.fn();

        await renderizarSeletor({
            onFechar
        });

        expect(screen.getByText('Selecionar frequência')).toBeOnTheScreen();

        expect(screen.getByTestId('bottom-sheet')).toHaveProp('visivel', true);

        expect(screen.getByTestId('bottom-sheet')).toHaveProp('onFechar', onFechar);

        expect(screen.getByTestId('bottom-sheet-layout')).toHaveProp('onFechar', onFechar);
    });

    test('renderiza todas as opções e descrições', async () => {
        await renderizarSeletor();

        expect(screen.getByText('Mensal')).toBeOnTheScreen();

        expect(screen.getByText('Trimestral')).toBeOnTheScreen();

        expect(screen.getByText('Anual')).toBeOnTheScreen();

        expect(screen.getByText('Uma vez por mês')).toBeOnTheScreen();

        expect(screen.getByText('Uma vez a cada três meses')).toBeOnTheScreen();

        expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    test('marca somente a opção selecionada', async () => {
        await renderizarSeletor({
            valorSelecionado: 'trimestral'
        });

        const botoes = screen.getAllByRole('button');

        expect(botoes[0]).not.toBeSelected();

        expect(botoes[1]).toBeSelected();

        expect(botoes[2]).not.toBeSelected();
    });

    test('envia o identificador selecionado', async () => {
        const onSelecionar = jest.fn();

        await renderizarSeletor({
            onSelecionar
        });

        const botoes = screen.getAllByRole('button');

        await fireEvent.press(botoes[1]);

        expect(onSelecionar).toHaveBeenCalledWith('trimestral');
    });

    test('desabilita opções sem callback', async () => {
        await renderizarSeletor({
            onSelecionar: undefined
        });

        for (const botao of screen.getAllByRole('button')) {
            expect(botao).toBeDisabled();
        }
    });

    test('exibe estado vazio', async () => {
        await renderizarSeletor({
            titulo: 'Selecionar opção',
            opcoes: []
        });

        expect(screen.getByText('Nenhuma opção disponível.')).toBeOnTheScreen();

        expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    test('usa texto secundário claro no estado vazio', async () => {
        await renderizarSeletor(
            {
                opcoes: []
            },
            'claro'
        );

        expect(screen.getByText('Nenhuma opção disponível.')).toHaveStyle({
            color: '#5C5C59'
        });
    });

    test('usa texto e superfície escuros no estado vazio', async () => {
        await renderizarSeletor(
            {
                opcoes: []
            },
            'escuro'
        );

        expect(screen.getByText('Nenhuma opção disponível.')).toHaveStyle({
            color: '#C4C8C5'
        });

        expect(screen.getByTestId('selection-sheet-list')).toHaveStyle({
            backgroundColor: '#2B322E'
        });
    });

    test('encaminha o ícone da opção', async () => {
        await renderizarSeletor({
            titulo: 'Selecionar opção',
            opcoes: [
                {
                    id: 'opcao-com-icone',
                    label: 'Opção com ícone',
                    icone: IconeTeste
                }
            ],
            valorSelecionado: 'opcao-com-icone'
        });

        expect(IconeTeste).toHaveBeenCalledTimes(1);

        expect(IconeTeste.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                size: 24
            })
        );
    });

    test('atualiza a opção selecionada', async () => {
        const resultado = await renderizarSeletor({
            valorSelecionado: 'mensal'
        });

        let botoes = screen.getAllByRole('button');

        expect(botoes[0]).toBeSelected();

        expect(botoes[1]).not.toBeSelected();

        await resultado.rerender(
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                <SelectionSheet
                    visivel
                    titulo="Selecionar frequência"
                    opcoes={opcoes}
                    valorSelecionado="trimestral"
                    onSelecionar={jest.fn()}
                    onFechar={jest.fn()}
                />
            </ThemeProvider>
        );

        botoes = screen.getAllByRole('button');

        expect(botoes[0]).not.toBeSelected();

        expect(botoes[1]).toBeSelected();
    });

    test('tolera coleção inválida', async () => {
        await renderizarSeletor({
            opcoes: null
        });

        expect(screen.getByText('Nenhuma opção disponível.')).toBeOnTheScreen();
    });
});
