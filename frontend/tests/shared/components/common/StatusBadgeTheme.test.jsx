import { screen } from '@testing-library/react-native';

import { StatusBadge } from '../../../../src/shared/components/common/StatusBadge/StatusBadge';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

test('usa contraste de aviso adequado no tema escuro', async () => {
    await renderWithTheme(<StatusBadge estado="pendenteDeUso" />, {
        preferencia: 'escuro'
    });

    expect(screen.getByText('Pendente de Uso')).toHaveStyle({
        color: '#F2B45F'
    });
    expect(screen.getByLabelText('Pendente de Uso')).toHaveStyle({
        backgroundColor: 'rgba(242, 180, 95, 0.16)'
    });
});

test.each(['alertaLeve', 'alertaModerado', 'alertaCritico'])(
    'usa contraste informativo em %s no tema escuro',
    async (estado) => {
        await renderWithTheme(<StatusBadge estado={estado} />, {
            preferencia: 'escuro'
        });

        expect(screen.getByText(/Alerta/)).toHaveStyle({
            color: '#8FC3DD'
        });
    }
);

test.each([
    ['confirmado', 'Confirmado'],
    ['confirmadoHistoricoUso', 'Confirmado'],
    ['validadeAindaPrazo', '30 meses restantes']
])('usa contraste de sucesso em %s no tema escuro', async (estado, rotulo) => {
    await renderWithTheme(<StatusBadge estado={estado} />, {
        preferencia: 'escuro'
    });

    expect(screen.getByText(rotulo)).toHaveStyle({
        color: '#9FD6B6'
    });
});

test('usa superfície e texto neutros no estado não confirmado', async () => {
    await renderWithTheme(<StatusBadge estado="naoConfirmadoHistoricoUso" />, {
        preferencia: 'escuro'
    });

    expect(screen.getByLabelText('Não confirmado')).toHaveStyle({
        backgroundColor: '#353C38'
    });
    expect(screen.getByText('Não confirmado')).toHaveStyle({
        color: '#C4C8C5'
    });
});

test('diferencia métricas de menstruação e ciclo no tema escuro', async () => {
    const primeiro = await renderWithTheme(<StatusBadge estado="diasMenstruacao" />, {
        preferencia: 'escuro'
    });

    expect(screen.getByText('6 dias')).toHaveStyle({ color: '#F08A75' });
    primeiro.unmount();

    await renderWithTheme(<StatusBadge estado="diasCiclo" />, {
        preferencia: 'escuro'
    });

    expect(screen.getByText('29 dias')).toHaveStyle({ color: '#9FD6B6' });
});
