//Testa a apresentação do tipo de permissão associada ao contato.
import { screen } from '@testing-library/react-native';

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
        UserIcon: criarIcone('UserIcon'),
        UsersIcon: criarIcone('UsersIcon')
    };
});

import {
    ContactPermissionBadge,
    normalizarVinculo,
    obterNomeCategoria
} from '../../../../src/features/support-network/components/ContactPermissionBadge/ContactPermissionBadge';

describe('ContactPermissionBadge', () => {
    test('mostra o nome direto da categoria', async () => {
        await render(
            <ContactPermissionBadge
                vinculo={{
                    tipo: 'categoria',
                    categoriaId: 1,
                    nomeCategoria: 'Profissional'
                }}
            />
        );

        expect(screen.getByText('Profissional')).toBeOnTheScreen();

        expect(
            screen.getByRole('text', {
                name: 'Categoria de permissão: Profissional'
            })
        ).toBeOnTheScreen();

        expect(
            screen.getByTestId('contact-permission-badge-icon-categoria', {
                includeHiddenElements: true
            })
        ).toBeOnTheScreen();
    });

    test('aceita a categoria no formato retornado pelo backend', async () => {
        await render(
            <ContactPermissionBadge
                vinculo={{
                    tipo: 'categoria',
                    categoria: {
                        id: 4,
                        nome: 'Família'
                    }
                }}
            />
        );

        expect(screen.getByText('Família')).toBeOnTheScreen();
    });

    test('mostra o vínculo individual', async () => {
        await render(
            <ContactPermissionBadge
                vinculo={{
                    tipo: 'individual',
                    categoria: null
                }}
            />
        );

        expect(screen.getByText('Permissões Individuais')).toBeOnTheScreen();

        expect(
            screen.getByRole('text', {
                name: 'Vínculo com permissões individuais'
            })
        ).toBeOnTheScreen();

        expect(
            screen.getByTestId('contact-permission-badge-icon-individual', {
                includeHiddenElements: true
            })
        ).toBeOnTheScreen();
    });

    test('aplica a identidade visual da categoria', async () => {
        await render(
            <ContactPermissionBadge
                vinculo={{
                    tipo: 'categoria',
                    nomeCategoria: 'Profissional'
                }}
            />
        );

        expect(screen.getByTestId('contact-permission-badge')).toHaveStyle({
            minHeight: 32,
            backgroundColor: 'rgba(214, 140, 58, 0.18)',
            borderColor: 'rgba(214, 140, 58, 0.34)'
        });

        expect(screen.getByText('Profissional')).toHaveStyle({
            color: '#A66314'
        });
    });

    test('aplica a identidade individual no modo escuro', async () => {
        await render(
            <ContactPermissionBadge
                vinculo={{
                    tipo: 'individual'
                }}
            />,
            {
                preferencia: 'escuro'
            }
        );

        expect(screen.getByTestId('contact-permission-badge')).toHaveStyle({
            backgroundColor: 'rgba(159, 214, 182, 0.14)',
            borderColor: 'rgba(159, 214, 182, 0.4)'
        });

        expect(screen.getByText('Permissões Individuais')).toHaveStyle({
            color: '#9FD6B6'
        });
    });

    test('prioriza o nome direto quando os dois formatos existem', () => {
        expect(
            obterNomeCategoria({
                nomeCategoria: 'Parceiro',
                categoria: {
                    nome: 'Família'
                }
            })
        ).toBe('Parceiro');
    });

    test('normaliza o vínculo individual', () => {
        expect(
            normalizarVinculo({
                tipo: 'individual'
            })
        ).toEqual({
            tipo: 'individual',
            rotulo: 'Permissões Individuais'
        });
    });

    test.each([
        [null, 'O vínculo do contato é inválido.'],
        [{}, 'O tipo de vínculo do contato é inválido.'],
        [{ tipo: 'categoria' }, 'O nome da categoria do contato é obrigatório.'],
        [{ tipo: 'desconhecido' }, 'O tipo de vínculo do contato é inválido.']
    ])('rejeita o vínculo inválido %#', (vinculo, mensagem) => {
        expect(() => normalizarVinculo(vinculo)).toThrow(mensagem);
    });
});
