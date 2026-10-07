import { render, screen } from '@testing-library/react-native';
import { StatusBadge } from '../../../../src/shared/components/common/StatusBadge/StatusBadge';

test.each([
    ['pendenteDeUso', 'Pendente de uso'],
    ['alertaModerado', 'Alerta moderado'],
    ['confirmadoHistorico', 'Confirmado'],
    ['confirmadoForaDoPrazo', 'Confirmado fora do prazo'],
    ['naoConfirmado', 'Não confirmado'],
    ['validadeAindaPrazo', '30 meses restantes']
])('apresenta a variante %s', async (estado, rotulo) => {
    await render(<StatusBadge estado={estado} />);
    expect(screen.getByLabelText(rotulo)).toBeOnTheScreen();
});

test('permite substituir o rótulo calculado', async () => {
    await render(<StatusBadge estado="diasCiclo" rotulo="31 dias ciclo" />);
    expect(screen.getByLabelText('31 dias ciclo')).toBeOnTheScreen();
    expect(screen.getByText('31 dias')).toBeOnTheScreen();
    expect(screen.getByText('ciclo')).toBeOnTheScreen();
});
