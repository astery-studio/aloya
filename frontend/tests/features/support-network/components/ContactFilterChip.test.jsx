//Testa apresentação, seleção, acessibilidade e bloqueio dos filtros de contatos.
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

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
            name: 'Ativo, filtro de estado'
        });

        expect(filtro).toHaveProp('accessibilityState', {
            checked: false,
            disabled: false
        });

        expect(filtro).toHaveStyle({
            minHeight: 36,
            borderWidth: 1,
            borderRadius: 999,
            borderColor: '#E6E2D8',
            backgroundColor: '#FFFFFF'
        });

        expect(screen.getByText('Ativo')).toHaveStyle({
            fontSize: 13,
            fontWeight: '600',
            lineHeight: 19.5,
            color: '#5C5C59'
        });
    });

    test('aplica a variante selecionada de estado', async () => {
        await render(
            <ContactFilterChip
                rotulo="Pendente"
                grupo="estado"
                selecionado
                aoPressionar={jest.fn()}
            />
        );

        const filtro = screen.getByRole('checkbox', {
            name: 'Pendente, filtro de estado'
        });

        expect(filtro).toHaveProp('accessibilityState', {
            checked: true,
            disabled: false
        });

        expect(filtro).toHaveStyle({
            borderColor: '#2C4C3B',
            backgroundColor: '#2C4C3B'
        });

        expect(screen.getByText('Pendente')).toHaveStyle({
            color: '#FFFFFF'
        });
    });

    test('aplica a variante selecionada de permissão', async () => {
        await render(
            <ContactFilterChip
                rotulo="Família"
                grupo="permissao"
                selecionado
                aoPressionar={jest.fn()}
            />
        );

        expect(
            screen.getByRole('checkbox', {
                name: 'Família, filtro de permissão'
            })
        ).toHaveStyle({
            borderColor: '#C85A44',
            backgroundColor: '#C85A44'
        });

        expect(screen.getByText('Família')).toHaveStyle({
            color: '#FFFFFF'
        });
    });

    test('executa a ação uma única vez ao pressionar', async () => {
        const aoPressionar = jest.fn();

        await render(
            <ContactFilterChip rotulo="Ativo" grupo="estado" aoPressionar={aoPressionar} />
        );

        await fireEvent.press(
            screen.getByRole('checkbox', {
                name: 'Ativo, filtro de estado'
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
            name: 'Parceiro, filtro de permissão'
        });

        expect(filtro).toBeDisabled();

        await fireEvent.press(filtro);

        expect(aoPressionar).not.toHaveBeenCalled();
    });

    test('fica desabilitado quando não recebe função de interação', async () => {
        await render(<ContactFilterChip rotulo="Recusado" grupo="estado" />);

        expect(
            screen.getByRole('checkbox', {
                name: 'Recusado, filtro de estado'
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

        expect(
            screen.getByRole('checkbox', {
                name: 'Permissões Individuais, filtro de permissão'
            })
        ).toHaveStyle({
            borderColor: '#F08A75',
            backgroundColor: '#F08A75'
        });

        expect(screen.getByText('Permissões Individuais')).toHaveStyle({
            color: '#181C1A'
        });
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
