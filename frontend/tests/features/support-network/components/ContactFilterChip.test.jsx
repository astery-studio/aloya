//Testa apresentação, seleção, acessibilidade e bloqueio dos filtros de contatos.
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
    ContactFilterChip,
    GRUPOS_FILTRO,
    normalizarRotulo,
    validarGrupo
} from '../../../../src/features/support-network/components/ContactFilterChip/ContactFilterChip';

describe('ContactFilterChip', () => {
    test('apresenta um filtro de estado não selecionado', async () => {
        await render(<ContactFilterChip rotulo="Ativo" grupo="estado" aoPressionar={jest.fn()} />);

        const filtro = screen.getByRole('checkbox', {
            name: 'Ativo, filtro de tipo de contato'
        });

        expect(filtro).toHaveProp('accessibilityState', {
            checked: false,
            disabled: false
        });

        expect(filtro).toHaveStyle({
            minHeight: 36,
            borderRadius: 999,
            backgroundColor: '#F7F0E6'
        });

        expect(screen.getByText('Ativo')).toHaveStyle({
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 19.5,
            color: '#B07D2A'
        });

        expect(screen.getByTestId('contact-filter-indicator-estado-Ativo')).toHaveProp(
            'weight',
            'regular'
        );

        expect(screen.getByTestId('contact-filter-indicator-estado-Ativo')).toHaveProp(
            'color',
            '#B07D2A'
        );
    });

    test('aplica o indicador selecionado de estado', async () => {
        await render(
            <ContactFilterChip
                rotulo="Pendente"
                grupo="estado"
                selecionado
                aoPressionar={jest.fn()}
            />
        );

        const filtro = screen.getByRole('checkbox', {
            name: 'Pendente, filtro de tipo de contato'
        });

        expect(filtro).toHaveProp('accessibilityState', {
            checked: true,
            disabled: false
        });

        expect(filtro).toHaveStyle({
            backgroundColor: '#F7F0E6'
        });

        expect(screen.getByText('Pendente')).toHaveStyle({
            color: '#B07D2A'
        });

        expect(screen.getByTestId('contact-filter-indicator-estado-Pendente')).toHaveProp(
            'weight',
            'fill'
        );

        expect(screen.getByTestId('contact-filter-indicator-estado-Pendente')).toHaveProp(
            'color',
            '#B07D2A'
        );
    });

    test('aplica a aparência de permissão', async () => {
        await render(
            <ContactFilterChip
                rotulo="Família"
                grupo="permissao"
                selecionado
                aoPressionar={jest.fn()}
            />
        );

        const filtro = screen.getByRole('checkbox', {
            name: 'Família, filtro de tipo de permissão'
        });

        expect(filtro).toHaveStyle({
            backgroundColor: '#EDF0EE'
        });

        expect(screen.getByText('Família')).toHaveStyle({
            color: '#2C4C3B'
        });

        expect(screen.getByTestId('contact-filter-indicator-permissao-Família')).toHaveProp(
            'weight',
            'fill'
        );

        expect(screen.getByTestId('contact-filter-indicator-permissao-Família')).toHaveProp(
            'color',
            '#2C4C3B'
        );
    });

    test('executa a ação uma única vez ao pressionar', async () => {
        const aoPressionar = jest.fn();

        await render(
            <ContactFilterChip rotulo="Ativo" grupo="estado" aoPressionar={aoPressionar} />
        );

        await fireEvent.press(
            screen.getByRole('checkbox', {
                name: 'Ativo, filtro de tipo de contato'
            })
        );

        expect(aoPressionar).toHaveBeenCalledTimes(1);
    });

    test('bloqueia a interação quando está desabilitado', async () => {
        const aoPressionar = jest.fn();

        await render(
            <ContactFilterChip
                rotulo="Parceiro"
                grupo="permissao"
                aoPressionar={aoPressionar}
                desabilitado
            />
        );

        const filtro = screen.getByRole('checkbox', {
            name: 'Parceiro, filtro de tipo de permissão'
        });

        expect(filtro).toBeDisabled();

        await fireEvent.press(filtro);

        expect(aoPressionar).not.toHaveBeenCalled();
    });

    test('fica desabilitado quando não recebe função de interação', async () => {
        await render(<ContactFilterChip rotulo="Recusado" grupo="estado" />);

        expect(
            screen.getByRole('checkbox', {
                name: 'Recusado, filtro de tipo de contato'
            })
        ).toBeDisabled();
    });

    test('mantém contraste no modo escuro', async () => {
        await render(
            <ContactFilterChip
                rotulo="Permissões Individuais"
                grupo="permissao"
                selecionado
                aoPressionar={jest.fn()}
            />,
            {
                preferencia: 'escuro'
            }
        );

        const filtro = screen.getByRole('checkbox', {
            name: 'Permissões Individuais, filtro de tipo de permissão'
        });

        expect(filtro).toHaveStyle({
            backgroundColor: 'rgba(159, 214, 182, 0.14)'
        });

        expect(screen.getByText('Permissões Individuais')).toHaveStyle({
            color: '#9FD6B6'
        });

        expect(
            screen.getByTestId('contact-filter-indicator-permissao-Permissões Individuais')
        ).toHaveProp('color', '#9FD6B6');
    });

    test('normaliza espaços do rótulo', () => {
        expect(normalizarRotulo('  Família  ')).toBe('Família');
    });

    test.each([null, undefined, '', '   ', 10])('rejeita o rótulo inválido %p', (rotulo) => {
        expect(() => normalizarRotulo(rotulo)).toThrow(
            'O rótulo de ContactFilterChip é obrigatório.'
        );
    });

    test.each(['estado', 'permissao'])('aceita o grupo %s', (grupo) => {
        expect(validarGrupo(grupo)).toBe(grupo);
    });

    test('rejeita grupo desconhecido', () => {
        expect(() => validarGrupo('categoria')).toThrow(
            'Grupo de ContactFilterChip inválido: categoria'
        );
    });

    test('mantém fechado o catálogo de grupos', () => {
        expect(GRUPOS_FILTRO).toEqual(['estado', 'permissao']);

        expect(Object.isFrozen(GRUPOS_FILTRO)).toBe(true);
    });
});
