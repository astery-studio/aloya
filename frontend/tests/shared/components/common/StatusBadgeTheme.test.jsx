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
