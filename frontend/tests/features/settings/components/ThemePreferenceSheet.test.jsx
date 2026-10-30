import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

const mockSelectionSheet = jest.fn();

jest.mock('../../../../src/shared/components/feedback/SelectionSheet/SelectionSheet', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    function SelectionSheet(props) {
        mockSelectionSheet(props);

        if (!props.visivel) {
            return null;
        }

        return React.createElement(
            View,
            {
                testID: 'theme-preference-sheet'
            },
            React.createElement(Text, null, props.titulo),
            React.createElement(
                Text,
                {
                    testID: 'preferencia-selecionada'
                },
                props.valorSelecionado
            ),
            ...props.opcoes.map((opcao) =>
                React.createElement(
                    Pressable,
                    {
                        key: opcao.id,
                        accessibilityRole: 'button',
                        accessibilityLabel: opcao.label,
                        onPress: () => props.onSelecionar(opcao.id)
                    },
                    React.createElement(Text, null, opcao.label),
                    React.createElement(Text, null, opcao.descricao)
                )
            ),
            React.createElement(Pressable, {
                accessibilityRole: 'button',
                accessibilityLabel: 'Fechar aparência',
                onPress: props.onFechar
            })
        );
    }

    return {
        SelectionSheet
    };
});

import {
    OPCOES_TEMA,
    ThemePreferenceSheet
} from '../../../../src/features/settings/components/ThemePreferenceSheet';

describe('ThemePreferenceSheet', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('não mostra o painel quando está invisível', async () => {
        await render(<ThemePreferenceSheet visivel={false} preferencia="automatico" />);

        expect(screen.queryByTestId('theme-preference-sheet')).toBeNull();
    });

    test('mostra as três opções de aparência', async () => {
        await render(
            <ThemePreferenceSheet
                visivel
                preferencia="automatico"
                aoSelecionar={jest.fn()}
                aoFechar={jest.fn()}
            />
        );

        expect(screen.getByText('Modo de Cor')).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Modo Claro'
            })
        ).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Modo Escuro'
            })
        ).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Automático do Sistema'
            })
        ).toBeOnTheScreen();

        expect(OPCOES_TEMA).toHaveLength(3);
    });

    test('encaminha a preferência selecionada', async () => {
        const aoSelecionar = jest.fn().mockResolvedValue(true);

        const aoFechar = jest.fn();

        await render(
            <ThemePreferenceSheet
                visivel
                preferencia="claro"
                aoSelecionar={aoSelecionar}
                aoFechar={aoFechar}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Modo Escuro'
            })
        );

        await waitFor(() => {
            expect(aoSelecionar).toHaveBeenCalledWith('escuro');
        });

        expect(aoFechar).toHaveBeenCalledTimes(1);
    });

    test('fecha o painel somente depois de salvar com sucesso', async () => {
        const aoSelecionar = jest.fn().mockResolvedValue(false);

        const aoFechar = jest.fn();

        await render(
            <ThemePreferenceSheet
                visivel
                preferencia="claro"
                aoSelecionar={aoSelecionar}
                aoFechar={aoFechar}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Modo Escuro'
            })
        );

        await waitFor(() => {
            expect(aoSelecionar).toHaveBeenCalledTimes(1);
        });

        expect(aoFechar).not.toHaveBeenCalled();
    });

    test('mantém o painel aberto quando a alteração lança erro', async () => {
        const aoSelecionar = jest.fn().mockRejectedValue(new Error('falha'));

        const aoFechar = jest.fn();

        await render(
            <ThemePreferenceSheet
                visivel
                preferencia="claro"
                aoSelecionar={aoSelecionar}
                aoFechar={aoFechar}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Modo Escuro'
            })
        );

        await waitFor(() => {
            expect(aoSelecionar).toHaveBeenCalledTimes(1);
        });

        expect(aoFechar).not.toHaveBeenCalled();
    });

    test('não altera nem fecha enquanto está salvando', async () => {
        const aoSelecionar = jest.fn();
        const aoFechar = jest.fn();

        await render(
            <ThemePreferenceSheet
                visivel
                preferencia="claro"
                salvando
                aoSelecionar={aoSelecionar}
                aoFechar={aoFechar}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Modo Escuro'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Fechar aparência'
            })
        );

        expect(aoSelecionar).not.toHaveBeenCalled();

        expect(aoFechar).not.toHaveBeenCalled();
    });

    test('encaminha a preferência atual ao painel compartilhado', async () => {
        await render(
            <ThemePreferenceSheet
                visivel
                preferencia="escuro"
                aoSelecionar={jest.fn()}
                aoFechar={jest.fn()}
            />
        );

        expect(screen.getByTestId('preferencia-selecionada')).toHaveTextContent('escuro');

        expect(mockSelectionSheet).toHaveBeenLastCalledWith(
            expect.objectContaining({
                titulo: 'Modo de Cor',
                valorSelecionado: 'escuro',
                opcoes: OPCOES_TEMA,
                varianteOpcao: 'modoCor'
            })
        );
    });

    test('ordena as opções como no protótipo', () => {
        expect(OPCOES_TEMA.map(({ id, label }) => ({ id, label }))).toEqual([
            { id: 'automatico', label: 'Automático do Sistema' },
            { id: 'claro', label: 'Modo Claro' },
            { id: 'escuro', label: 'Modo Escuro' }
        ]);
    });
});
