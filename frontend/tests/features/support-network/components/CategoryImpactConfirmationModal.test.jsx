//Testa a confirmação de impacto da edição de uma categoria.
import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');

    return {
        WarningCircleIcon: function WarningCircleIcon({ testID }) {
            return React.createElement(View, {
                testID: testID || 'icone-aviso-impacto'
            });
        }
    };
});

import { CategoryImpactConfirmationModal } from '../../../../src/features/support-network/components/CategoryImpactConfirmationModal';

describe('CategoryImpactConfirmationModal', () => {
    test('não mostra o modal quando está invisível', async () => {
        await render(
            <CategoryImpactConfirmationModal
                visivel={false}
                quantidadeContatos={2}
                onConfirmar={jest.fn()}
                onCancelar={jest.fn()}
            />
        );

        expect(screen.queryByText('Atualizar categoria')).toBeNull();
    });

    test('informa um único contato corretamente', async () => {
        await render(
            <CategoryImpactConfirmationModal
                visivel
                quantidadeContatos={1}
                onConfirmar={jest.fn()}
                onCancelar={jest.fn()}
            />
        );

        expect(
            screen.getByText(
                'Esta alteração afetará imediatamente 1 contato vinculado a esta categoria. Deseja continuar?'
            )
        ).toBeOnTheScreen();
    });

    test('informa vários contatos corretamente', async () => {
        await render(
            <CategoryImpactConfirmationModal
                visivel
                quantidadeContatos={3}
                onConfirmar={jest.fn()}
                onCancelar={jest.fn()}
            />
        );

        expect(
            screen.getByText(
                'Esta alteração afetará imediatamente 3 contatos vinculados a esta categoria. Deseja continuar?'
            )
        ).toBeOnTheScreen();
    });

    test('confirma a alteração', async () => {
        const onConfirmar = jest.fn();

        await render(
            <CategoryImpactConfirmationModal
                visivel
                quantidadeContatos={2}
                onConfirmar={onConfirmar}
                onCancelar={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Confirmar'
            })
        );

        expect(onConfirmar).toHaveBeenCalledTimes(1);
    });

    test('cancela a alteração', async () => {
        const onCancelar = jest.fn();

        await render(
            <CategoryImpactConfirmationModal
                visivel
                quantidadeContatos={2}
                onConfirmar={jest.fn()}
                onCancelar={onCancelar}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Cancelar'
            })
        );

        expect(onCancelar).toHaveBeenCalledTimes(1);
    });

    test('bloqueia as ações durante o salvamento', async () => {
        const onConfirmar = jest.fn();
        const onCancelar = jest.fn();

        await render(
            <CategoryImpactConfirmationModal
                visivel
                quantidadeContatos={2}
                carregando
                onConfirmar={onConfirmar}
                onCancelar={onCancelar}
            />
        );

        const confirmar = screen.getByRole('button', {
            name: 'Confirmar'
        });

        const cancelar = screen.getByRole('button', {
            name: 'Cancelar'
        });

        expect(confirmar).toBeDisabled();
        expect(cancelar).toBeDisabled();

        await fireEvent.press(confirmar);
        await fireEvent.press(cancelar);

        expect(onConfirmar).not.toHaveBeenCalled();

        expect(onCancelar).not.toHaveBeenCalled();
    });

    test('não confirma quando a quantidade é inválida', async () => {
        const onConfirmar = jest.fn();

        await render(
            <CategoryImpactConfirmationModal
                visivel
                quantidadeContatos={0}
                onConfirmar={onConfirmar}
                onCancelar={jest.fn()}
            />
        );

        const confirmar = screen.getByRole('button', {
            name: 'Confirmar'
        });

        expect(confirmar).toBeDisabled();

        await fireEvent.press(confirmar);

        expect(onConfirmar).not.toHaveBeenCalled();
    });
});
