//Testa a seleção completa, parcial e desabilitada dos conjuntos de permissões.
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');

    return {
        CheckIcon: function CheckIcon(propriedades) {
            return React.createElement(View, {
                ...propriedades,
                testID: propriedades.testID ?? 'CheckIcon'
            });
        }
    };
});

import {
    IDS_PERMISSOES_ACESSO,
    IDS_PERMISSOES_GERAIS,
    PermissionBulkSelector,
    alternarConjunto,
    normalizarPermissoesSelecionadas,
    obterEstadoDoConjunto
} from '../../../../src/features/support-network/components/PermissionBulkSelector/PermissionBulkSelector';

describe('PermissionBulkSelector', () => {
    test('começa com os dois conjuntos desmarcados', async () => {
        await render(<PermissionBulkSelector aoAlterar={jest.fn()} />);

        expect(
            screen.getByRole('checkbox', {
                name: 'Permissões Gerais'
            })
        ).toHaveProp('accessibilityState', {
            checked: false,
            disabled: false
        });

        expect(
            screen.getByRole('checkbox', {
                name: 'Permissões de Acesso'
            })
        ).toHaveProp('accessibilityState', {
            checked: false,
            disabled: false
        });
    });

    test('marca as permissões gerais completas', async () => {
        await render(
            <PermissionBulkSelector
                permissoesSelecionadas={IDS_PERMISSOES_GERAIS}
                aoAlterar={jest.fn()}
            />
        );

        expect(
            screen.getByRole('checkbox', {
                name: 'Permissões Gerais'
            })
        ).toHaveProp('accessibilityState', {
            checked: true,
            disabled: false
        });

        expect(screen.getByTestId('check-permissoes-gerais')).toBeOnTheScreen();
    });

    test('comunica seleção parcial sem depender apenas de cor', async () => {
        await render(
            <PermissionBulkSelector
                permissoesSelecionadas={[IDS_PERMISSOES_ACESSO[0]]}
                aoAlterar={jest.fn()}
            />
        );

        expect(
            screen.getByRole('checkbox', {
                name: 'Permissões de Acesso'
            })
        ).toHaveProp('accessibilityState', {
            checked: 'mixed',
            disabled: false
        });

        expect(screen.getByTestId('parcial-permissoes-acesso')).toHaveTextContent('−');
    });

    test('seleciona todas as permissões gerais e preserva as de acesso', async () => {
        const aoAlterar = jest.fn();
        const permissaoAcesso = IDS_PERMISSOES_ACESSO[0];

        await render(
            <PermissionBulkSelector
                permissoesSelecionadas={[permissaoAcesso]}
                aoAlterar={aoAlterar}
            />
        );

        await fireEvent.press(
            screen.getByRole('checkbox', {
                name: 'Permissões Gerais'
            })
        );

        expect(aoAlterar).toHaveBeenCalledWith([...IDS_PERMISSOES_GERAIS, permissaoAcesso]);
    });

    test('completa um conjunto parcialmente selecionado', async () => {
        const aoAlterar = jest.fn();

        await render(
            <PermissionBulkSelector
                permissoesSelecionadas={[IDS_PERMISSOES_GERAIS[0]]}
                aoAlterar={aoAlterar}
            />
        );

        await fireEvent.press(
            screen.getByRole('checkbox', {
                name: 'Permissões Gerais'
            })
        );

        expect(aoAlterar).toHaveBeenCalledWith(IDS_PERMISSOES_GERAIS);
    });

    test('remove somente o conjunto completamente selecionado', async () => {
        const aoAlterar = jest.fn();
        const permissaoGeral = IDS_PERMISSOES_GERAIS[0];

        await render(
            <PermissionBulkSelector
                permissoesSelecionadas={[permissaoGeral, ...IDS_PERMISSOES_ACESSO]}
                aoAlterar={aoAlterar}
            />
        );

        await fireEvent.press(
            screen.getByRole('checkbox', {
                name: 'Permissões de Acesso'
            })
        );

        expect(aoAlterar).toHaveBeenCalledWith([permissaoGeral]);
    });

    test('bloqueia os controles quando está desabilitado', async () => {
        const aoAlterar = jest.fn();

        await render(<PermissionBulkSelector aoAlterar={aoAlterar} desabilitado />);

        const gerais = screen.getByRole('checkbox', {
            name: 'Permissões Gerais'
        });

        const acesso = screen.getByRole('checkbox', {
            name: 'Permissões de Acesso'
        });

        expect(gerais).toBeDisabled();
        expect(acesso).toBeDisabled();

        await fireEvent.press(gerais);

        expect(aoAlterar).not.toHaveBeenCalled();
    });

    test('fica desabilitado sem função de alteração', async () => {
        await render(<PermissionBulkSelector />);

        expect(
            screen.getByRole('checkbox', {
                name: 'Permissões Gerais'
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('checkbox', {
                name: 'Permissões de Acesso'
            })
        ).toBeDisabled();
    });

    test('normaliza permissões inválidas, repetidas e fora do contrato', () => {
        expect(
            normalizarPermissoesSelecionadas([
                IDS_PERMISSOES_ACESSO[0],
                IDS_PERMISSOES_GERAIS[0],
                IDS_PERMISSOES_ACESSO[0],
                'permissao.inexistente',
                null
            ])
        ).toEqual([IDS_PERMISSOES_GERAIS[0], IDS_PERMISSOES_ACESSO[0]]);
    });

    test('calcula corretamente os três estados do conjunto', () => {
        expect(obterEstadoDoConjunto(IDS_PERMISSOES_GERAIS, new Set())).toBe(false);

        expect(
            obterEstadoDoConjunto(IDS_PERMISSOES_GERAIS, new Set([IDS_PERMISSOES_GERAIS[0]]))
        ).toBe('mixed');

        expect(obterEstadoDoConjunto(IDS_PERMISSOES_GERAIS, new Set(IDS_PERMISSOES_GERAIS))).toBe(
            true
        );
    });

    test('não altera a coleção recebida pela função em lote', () => {
        const selecaoOriginal = Object.freeze([IDS_PERMISSOES_GERAIS[0]]);

        const resultado = alternarConjunto({
            idsDoConjunto: IDS_PERMISSOES_ACESSO,
            permissoesSelecionadas: selecaoOriginal,
            todasSelecionadas: false
        });

        expect(selecaoOriginal).toEqual([IDS_PERMISSOES_GERAIS[0]]);

        expect(resultado).toEqual([IDS_PERMISSOES_GERAIS[0], ...IDS_PERMISSOES_ACESSO]);
    });

    test('aplica as cores acessíveis no modo escuro', async () => {
        await render(
            <PermissionBulkSelector
                permissoesSelecionadas={IDS_PERMISSOES_GERAIS}
                aoAlterar={jest.fn()}
            />,
            {
                preferencia: 'escuro'
            }
        );

        expect(screen.getByTestId('indicador-permissoes-gerais')).toHaveStyle({
            backgroundColor: '#9FD6B6',
            borderColor: '#9FD6B6'
        });

        expect(screen.getByTestId('check-permissoes-gerais')).toHaveProp('color', '#152018');
    });
});
