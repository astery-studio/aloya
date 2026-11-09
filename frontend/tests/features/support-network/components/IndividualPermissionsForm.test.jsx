//Testa a composição e o estado controlado do formulário de permissões individuais.
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => {
    const React = require('react');
    const { View } = require('react-native');

    return {
        BottomSheet({ visivel, bloquearFechamento, children }) {
            if (!visivel) {
                return null;
            }

            return React.createElement(
                View,
                {
                    testID: 'bottom-sheet-individual',
                    accessibilityState: {
                        busy: bloquearFechamento
                    }
                },
                children
            );
        }
    };
});

jest.mock('../../../../src/shared/layouts/BottomSheet/BottomSheetLayout', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        BottomSheetLayout({ titulo, onFechar, bloquearFechamento, children }) {
            return React.createElement(
                View,
                null,
                React.createElement(Text, null, titulo),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Fechar painel',
                        disabled: bloquearFechamento,
                        onPress: onFechar
                    },
                    React.createElement(Text, null, 'Fechar')
                ),
                children
            );
        }
    };
});

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');

    return function ButtonScreen({
        texto,
        rotuloAcessibilidade,
        aoPressionar,
        desativado,
        carregando
    }) {
        return React.createElement(
            Pressable,
            {
                accessibilityRole: 'button',
                accessibilityLabel: rotuloAcessibilidade ?? texto,
                accessibilityState: {
                    disabled: desativado || carregando,
                    busy: carregando
                },
                disabled: desativado || carregando,
                onPress: aoPressionar
            },
            React.createElement(Text, null, texto)
        );
    };
});

jest.mock('../../../../src/features/support-network/components/GeneralPermissions', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');

    return {
        GeneralPermissions({ permissoesSelecionadas, aoAlterar, desabilitado }) {
            const ativa = permissoesSelecionadas.includes('geral.fase_atual');

            return React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Alterar permissão geral',
                    disabled: desabilitado,
                    onPress: () => aoAlterar('geral.fase_atual', !ativa)
                },
                React.createElement(Text, null, 'Permissões Gerais')
            );
        }
    };
});

jest.mock('../../../../src/features/support-network/components/PermissionGroups', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');

    return {
        PermissionGroups({ permissoesSelecionadas, aoAlterar, desabilitado }) {
            return React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Alterar permissões de acesso',
                    disabled: desabilitado,
                    onPress: () => aoAlterar([...permissoesSelecionadas, 'ciclo.fluxo_menstrual'])
                },
                React.createElement(Text, null, 'Permissões de Acesso')
            );
        }
    };
});

jest.mock(
    '../../../../src/features/support-network/components/PermissionBulkSelector/PermissionBulkSelector',
    () => {
        const React = require('react');
        const { Pressable, Text } = require('react-native');

        const permissoesPermitidas = [
            'geral.fase_atual',
            'geral.anticoncepcionais',
            'ciclo.fluxo_menstrual'
        ];

        function normalizarPermissoesSelecionadas(permissoes) {
            if (!Array.isArray(permissoes)) {
                return [];
            }

            return permissoesPermitidas.filter((permissaoId) => permissoes.includes(permissaoId));
        }

        function PermissionBulkSelector({ aoAlterar, desabilitado }) {
            return React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Alterar permissões em lote',
                    disabled: desabilitado,
                    onPress: () => aoAlterar(['geral.fase_atual', 'geral.anticoncepcionais'])
                },
                React.createElement(Text, null, 'Marcar todos')
            );
        }

        return {
            PermissionBulkSelector,
            normalizarPermissoesSelecionadas
        };
    }
);

import { IndividualPermissionsForm } from '../../../../src/features/support-network/components/IndividualPermissionsForm/IndividualPermissionsForm';

describe('IndividualPermissionsForm', () => {
    test('não renderiza o conteúdo quando está invisível', async () => {
        await render(
            <IndividualPermissionsForm
                visivel={false}
                aoFechar={jest.fn()}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
            />
        );

        expect(screen.queryByText('Permissões Individuais')).toBeNull();
    });

    test('compõe todos os blocos do painel', async () => {
        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={jest.fn()}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
            />
        );

        expect(screen.getByText('Permissões Individuais')).toBeOnTheScreen();

        expect(screen.getByText('Marcar todos')).toBeOnTheScreen();

        expect(screen.getByText('OU PERSONALIZE POR TIPO')).toBeOnTheScreen();

        expect(screen.getByText('Permissões Gerais')).toBeOnTheScreen();

        expect(screen.getByText('Permissões de Acesso')).toBeOnTheScreen();
    });

    test('encaminha alteração de uma permissão geral', async () => {
        const aoAlterar = jest.fn();

        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={jest.fn()}
                permissoesSelecionadas={[]}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Alterar permissão geral'
            })
        );

        expect(aoAlterar).toHaveBeenCalledWith(['geral.fase_atual']);
    });

    test('encaminha alterações das permissões de acesso', async () => {
        const aoAlterar = jest.fn();

        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={jest.fn()}
                permissoesSelecionadas={['geral.fase_atual']}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Alterar permissões de acesso'
            })
        );

        expect(aoAlterar).toHaveBeenCalledWith(['geral.fase_atual', 'ciclo.fluxo_menstrual']);
    });

    test('encaminha a seleção em lote', async () => {
        const aoAlterar = jest.fn();

        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={jest.fn()}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Alterar permissões em lote'
            })
        );

        expect(aoAlterar).toHaveBeenCalledWith(['geral.fase_atual', 'geral.anticoncepcionais']);
    });

    test('salva somente permissões normalizadas', async () => {
        const aoSalvar = jest.fn();

        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={jest.fn()}
                permissoesSelecionadas={['geral.fase_atual', 'inválida', 'geral.fase_atual']}
                aoAlterar={jest.fn()}
                aoSalvar={aoSalvar}
                alterado
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar permissões individuais'
            })
        );

        expect(aoSalvar).toHaveBeenCalledWith(['geral.fase_atual']);
    });

    test('mantém salvar desabilitado sem alteração real', async () => {
        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={jest.fn()}
                permissoesSelecionadas={['geral.fase_atual']}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                alterado={false}
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Salvar permissões individuais'
            })
        ).toBeDisabled();
    });

    test('mantém salvar desabilitado sem permissão selecionada', async () => {
        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={jest.fn()}
                permissoesSelecionadas={[]}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                alterado
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Salvar permissões individuais'
            })
        ).toBeDisabled();
    });

    test('bloqueia edição e fechamento durante salvamento', async () => {
        const aoFechar = jest.fn();
        const aoAlterar = jest.fn();

        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={aoFechar}
                permissoesSelecionadas={['geral.fase_atual']}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
                alterado
                carregando
            />
        );

        expect(screen.getByTestId('bottom-sheet-individual')).toHaveProp('accessibilityState', {
            busy: true
        });

        const fechar = screen.getByRole('button', {
            name: 'Fechar painel'
        });

        expect(fechar).toBeDisabled();

        await fireEvent.press(fechar);

        expect(aoFechar).not.toHaveBeenCalled();

        expect(
            screen.getByRole('button', {
                name: 'Alterar permissão geral'
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'Salvar permissões individuais'
            })
        ).toBeDisabled();
    });

    test('permite fechar quando não está salvando', async () => {
        const aoFechar = jest.fn();

        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={aoFechar}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Fechar painel'
            })
        );

        expect(aoFechar).toHaveBeenCalledTimes(1);
    });

    test('mostra a mensagem de erro acessível', async () => {
        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={jest.fn()}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                erro="Selecione ao menos uma permissão."
            />
        );

        expect(screen.getByRole('alert')).toHaveAccessibleName('Selecione ao menos uma permissão.');
    });

    test('bloqueia controles quando não recebe callbacks', async () => {
        await render(
            <IndividualPermissionsForm
                visivel
                aoFechar={jest.fn()}
                permissoesSelecionadas={['geral.fase_atual']}
                alterado
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Alterar permissão geral'
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'Salvar permissões individuais'
            })
        ).toBeDisabled();
    });
});
