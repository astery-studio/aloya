//Testa os dados, ações e bloqueios do cartão de categoria.
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');

    function criarIcone(nome) {
        return function IconeFalso(propriedades) {
            return React.createElement(View, {
                ...propriedades,
                testID: nome
            });
        };
    }

    return {
        PencilSimpleIcon: criarIcone('PencilSimpleIcon'),
        TrashIcon: criarIcone('TrashIcon'),
        UserCheckIcon: criarIcone('UserCheckIcon'),
        UsersIcon: criarIcone('UsersIcon')
    };
});

import {
    criarRotuloContatos,
    SupportCategoryCard
} from '../../../../src/features/support-network/components/SupportCategoryCard';
import { temaEscuro } from '../../../../src/shared/theme/themePalettes';

const categoria = Object.freeze({
    id: 7,
    nome: 'Família',
    dadosVisiveis: ['geral.fase_atual'],
    quantidadeContatos: 2
});

describe('SupportCategoryCard', () => {
    test('mostra os dados e os ícones corretos da categoria', async () => {
        await render(
            <SupportCategoryCard
                categoria={categoria}
                resumoPermissoes="3 tipos de dado permitidos"
                quantidadeContatos={2}
                onEditar={jest.fn()}
                onExcluir={jest.fn()}
            />
        );

        expect(screen.getByText('Família')).toBeOnTheScreen();

        expect(screen.getByText('3 tipos de dado permitidos')).toBeOnTheScreen();

        expect(
            screen.getByTestId('UserCheckIcon', {
                includeHiddenElements: true
            })
        ).toBeOnTheScreen();

        expect(screen.getByTestId('PencilSimpleIcon')).toBeOnTheScreen();

        expect(screen.getByTestId('TrashIcon')).toBeOnTheScreen();

        expect(screen.getByLabelText('2 contatos vinculados')).toBeOnTheScreen();
    });

    test('mantém nome na posição original, em uma linha e com fonte fixa', async () => {
        const nomeLongo = 'Namoradinho Lindinho Fofinho';
        await render(
            <SupportCategoryCard
                categoria={{ ...categoria, nome: nomeLongo }}
                resumoPermissoes="Todos os dados permitidos"
            />
        );

        const resumo = screen.getByTestId('support-category-summary');

        const nome = screen.getByTestId('support-category-name');
        expect(nome).toHaveTextContent(nomeLongo);
        expect(nome).toHaveStyle({ fontSize: 18, lineHeight: 24 });
        expect(nome).toHaveProp('numberOfLines', 1);
        expect(nome).toHaveProp('ellipsizeMode', 'clip');
        expect(resumo).toHaveStyle({ fontSize: 14, lineHeight: 18 });
        expect(nome.props.adjustsFontSizeToFit).not.toBe(true);
        expect(resumo).toHaveProp('numberOfLines', 1);
        expect(resumo).toHaveProp('adjustsFontSizeToFit', true);
        expect(nome.parent.parent).toBe(resumo.parent.parent);
    });

    test('encaminha edição e exclusão', async () => {
        const onEditar = jest.fn();
        const onExcluir = jest.fn();

        await render(
            <SupportCategoryCard
                categoria={categoria}
                resumoPermissoes="Apenas Fase atual permitido"
                onEditar={onEditar}
                onExcluir={onExcluir}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Editar categoria Família'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Excluir categoria Família'
            })
        );

        expect(onEditar).toHaveBeenCalledWith(categoria);
        expect(onExcluir).toHaveBeenCalledWith(categoria);
    });

    test('bloqueia as ações quando está desabilitado', async () => {
        await render(
            <SupportCategoryCard
                categoria={categoria}
                resumoPermissoes="Apenas Fase atual permitido"
                onEditar={jest.fn()}
                onExcluir={jest.fn()}
                desabilitado
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Editar categoria Família'
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'Excluir categoria Família'
            })
        ).toBeDisabled();
    });

    test('mostra o estado da exclusão em andamento', async () => {
        await render(
            <SupportCategoryCard
                categoria={categoria}
                resumoPermissoes="Apenas Fase atual permitido"
                onEditar={jest.fn()}
                onExcluir={jest.fn()}
                acaoEmAndamento="excluir"
            />
        );

        expect(screen.getByLabelText('Excluindo categoria Família')).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Editar categoria Família'
            })
        ).toBeDisabled();

        expect(
            screen.queryByRole('button', {
                name: 'Excluir categoria Família'
            })
        ).toBeNull();
    });

    test.each([
        [0, '0 contatos vinculados'],
        [1, '1 contato vinculado'],
        [2, '2 contatos vinculados']
    ])('formata %p contatos corretamente', (quantidade, esperado) => {
        expect(criarRotuloContatos(quantidade)).toBe(esperado);
    });

    test('não renderiza categoria sem nome', async () => {
        await render(
            <SupportCategoryCard
                categoria={{
                    ...categoria,
                    nome: '   '
                }}
                resumoPermissoes="Permissão"
            />
        );

        expect(screen.queryByTestId('support-category-card')).toBeNull();
    });

    test('aplica a superfície e o texto do modo escuro', async () => {
        await render(
            <SupportCategoryCard
                categoria={categoria}
                resumoPermissoes="Apenas Fase atual permitido"
                onEditar={jest.fn()}
                onExcluir={jest.fn()}
            />,
            { preferencia: 'escuro' }
        );

        expect(screen.getByTestId('support-category-card')).toHaveStyle({
            backgroundColor: temaEscuro.cores.interface.superficie,
            borderColor: temaEscuro.cores.interface.borda
        });

        expect(screen.getByTestId('support-category-name')).toHaveStyle({
            color: temaEscuro.cores.interface.textoPrincipal
        });
    });
});
