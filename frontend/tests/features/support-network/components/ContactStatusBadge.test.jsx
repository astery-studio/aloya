//Testa os estados, acessibilidade e temas do indicador de vínculo.
import { screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';
import {
    ContactStatusBadge,
    ESTADOS_CONTATO
} from '../../../../src/features/support-network/components/ContactStatusBadge/ContactStatusBadge';

describe('ContactStatusBadge', () => {
    test.each([
        ['pendente', 'Pendente'],
        ['ativo', 'Ativo'],
        ['inativo', 'Inativo'],
        ['recusado', 'Recusado']
    ])('apresenta o estado %s', async (estado, rotulo) => {
        await render(<ContactStatusBadge estado={estado} />);

        expect(screen.getByText(rotulo)).toBeOnTheScreen();

        expect(
            screen.getByRole('text', {
                name: `Status do contato: ${rotulo}`
            })
        ).toBeOnTheScreen();
    });

    test('aplica a aparência pendente no tema claro', async () => {
        await render(<ContactStatusBadge estado="pendente" />);

        expect(screen.getByTestId('contact-status-badge')).toHaveStyle({
            minHeight: 24,
            backgroundColor: 'rgba(214, 140, 58, 0.14)',
            borderColor: 'rgba(138, 93, 19, 0.32)'
        });

        expect(
            screen.getByTestId('contact-status-badge-indicator', {
                includeHiddenElements: true
            })
        ).toHaveStyle({
            width: 6,
            height: 6,
            backgroundColor: '#8A5D13'
        });

        expect(screen.getByText('Pendente')).toHaveStyle({
            color: '#8A5D13',
            fontSize: 12
        });
    });

    test('aplica a aparência ativa no tema escuro', async () => {
        await render(<ContactStatusBadge estado="ativo" />, {
            preferencia: 'escuro'
        });

        expect(screen.getByTestId('contact-status-badge')).toHaveStyle({
            backgroundColor: 'rgba(159, 214, 182, 0.14)',
            borderColor: 'rgba(159, 214, 182, 0.4)'
        });

        expect(screen.getByText('Ativo')).toHaveStyle({
            color: '#9FD6B6'
        });
    });

    test('aplica a variante compacta', async () => {
        await render(<ContactStatusBadge estado="recusado" compacto />);

        expect(screen.getByTestId('contact-status-badge')).toHaveStyle({
            minHeight: 20,
            paddingVertical: 2,
            paddingHorizontal: 8
        });

        expect(screen.getByText('Recusado')).toHaveStyle({
            fontSize: 10,
            lineHeight: 14
        });
    });

    test('não depende exclusivamente da cor para informar o estado', async () => {
        await render(<ContactStatusBadge estado="inativo" />);

        expect(screen.getByText('Inativo')).toBeOnTheScreen();

        expect(screen.getByTestId('contact-status-badge')).toHaveProp(
            'accessibilityLabel',
            'Status do contato: Inativo'
        );
    });

    test('rejeita um estado desconhecido', () => {
        expect(() => {
            ContactStatusBadge({
                estado: 'desconhecido'
            });
        }).toThrow('Estado de ContactStatusBadge inválido: desconhecido');
    });

    test('mantém o catálogo de estados fechado', () => {
        expect(Object.keys(ESTADOS_CONTATO)).toEqual(['pendente', 'ativo', 'inativo', 'recusado']);

        expect(Object.isFrozen(ESTADOS_CONTATO)).toBe(true);
    });
});
