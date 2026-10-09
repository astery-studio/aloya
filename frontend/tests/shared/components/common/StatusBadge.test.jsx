import { render, screen } from '@testing-library/react-native';
import { StatusBadge } from '../../../../src/shared/components/common/StatusBadge/StatusBadge';
import { variantes } from '../../../../src/shared/components/common/StatusBadge/StatusBadge.styles';

test.each([
    ['pendenteDeUso', 'Pendente de Uso'],
    ['alertaModerado', 'Alerta Moderado'],
    ['alertaLeve', 'Alerta Leve'],
    ['atrasadoProximosHorarios', 'Atrasado'],
    ['confirmado', 'Confirmado'],
    ['alertaCritico', 'Alerta Crítico'],
    ['confirmadoHistoricoUso', 'Confirmado'],
    ['confirmadoForaPrazoHistoricoUso', 'Confirmado fora do prazo'],
    ['naoConfirmadoHistoricoUso', 'Não confirmado'],
    ['validadeAindaPrazo', '30 meses restantes'],
    ['diasMenstruacao', '6 dias menstruação'],
    ['diasCiclo', '29 dias ciclo']
])('apresenta a variante %s', async (estado, rotulo) => {
    await render(<StatusBadge estado={estado} />);
    expect(screen.getByLabelText(rotulo)).toBeOnTheScreen();
});

test('mantém aliases retrocompatíveis para os estados públicos anteriores', async () => {
    const { rerender } = await render(<StatusBadge estado="confirmadoHistorico" />);
    expect(screen.getByLabelText('Confirmado')).toBeOnTheScreen();

    await rerender(<StatusBadge estado="confirmadoForaDoPrazo" />);
    expect(screen.getByLabelText('Confirmado fora do prazo')).toBeOnTheScreen();

    await rerender(<StatusBadge estado="naoConfirmado" />);
    expect(screen.getByLabelText('Não confirmado')).toBeOnTheScreen();
});

test('permite substituir o rótulo calculado', async () => {
    await render(<StatusBadge estado="diasCiclo" rotulo="31 dias ciclo" />);
    expect(screen.getByLabelText('31 dias ciclo')).toBeOnTheScreen();
    expect(screen.getByText('31 dias')).toBeOnTheScreen();
    expect(screen.getByText('ciclo')).toBeOnTheScreen();
});

test('renderiza o aviso completo de estimativa incerta', async () => {
    await render(<StatusBadge estado="estimativaIncerta" />);

    expect(screen.getByText('Estimativa incerta')).toBeOnTheScreen();
    expect(screen.getByText('Os dados deste ciclo podem ser imprecisos.')).toBeOnTheScreen();
    expect(
        screen.getByLabelText('Estimativa incerta. Os dados deste ciclo podem ser imprecisos.')
    ).toBeOnTheScreen();
});

test('reproduz as medidas exatas definidas para HU-019 e HU-023', () => {
    expect(variantes.pendenteDeUso.container).toMatchObject({ width: 152.6, height: 23 });
    expect(variantes.alertaModerado.container).toMatchObject({ width: 152.6, height: 23 });
    expect(variantes.alertaCritico.container).toMatchObject({ width: 155.31, height: 23 });
    expect(variantes.confirmado.container).toMatchObject({ width: 155.31, height: 23 });
    expect(variantes.confirmadoHistoricoUso.container).toMatchObject({ width: 81, height: 23 });
    expect(variantes.confirmadoForaPrazoHistoricoUso.container).toMatchObject({ width: 155, height: 23 });
    expect(variantes.naoConfirmadoHistoricoUso.container).toMatchObject({ width: 104, height: 23 });
    expect(variantes.validadeAindaPrazo.container).toMatchObject({ width: 133, height: 22 });
});

test('reproduz as medidas exatas definidas para HU-011', () => {
    expect(variantes.diasMenstruacao.container).toMatchObject({ width: 143.41, height: 30.88 });
    expect(variantes.diasCiclo.container).toMatchObject({ width: 146, height: 30.88 });
    expect(variantes.estimativaIncerta.container).toMatchObject({ width: 316.62, height: 52.41 });
});

test('usa o glifo de nove pixels especificado para os estados com marcador', async () => {
    await render(<StatusBadge estado="pendenteDeUso" />);
    expect(screen.getByText('●')).toHaveStyle({ width: 9, height: 14, fontSize: 9, lineHeight: 14 });
});

test('rejeita estados desconhecidos', async () => {
    await expect(render(<StatusBadge estado="inexistente" />)).rejects.toThrow(
        'Estado de StatusBadge inválido: inexistente'
    );
});

test.each([
    ['pendenteDeUso', 'Pendente de Uso', 11, 16],
    ['confirmadoForaPrazoHistoricoUso', 'Confirmado fora do prazo', 11, 16],
    ['validadeAindaPrazo', '30 meses restantes', 12, 18]
])('não trunca nem fixa a altura do texto em %s', async (estado, rotulo, fontSize, lineHeight) => {
    await render(<StatusBadge estado={estado} />);
    const texto = screen.getByText(rotulo);
    expect(texto).not.toHaveProp('numberOfLines');
    expect(texto).toHaveStyle({height: 'auto', width: 'auto', includeFontPadding: false, fontSize, lineHeight});
    expect(screen.getByLabelText(rotulo)).toHaveStyle({height: 'auto', minHeight: variantes[estado].container.height});
});

test.each(['confirmadoHistorico', 'confirmadoHistoricoUso'])('dimensiona %s pelo texto sem quebrar Confirmado', async (estado) => {
    await render(<StatusBadge estado={estado} />);
    expect(screen.getByLabelText('Confirmado')).toHaveStyle({ width: 'auto', minWidth: 81, minHeight: 23 });
    expect(screen.getByText('Confirmado')).toHaveProp('numberOfLines', 1);
    expect(screen.getByText('Confirmado')).toHaveStyle({ width: 'auto', flexShrink: 0 });
});

test('preserva o comportamento e as dimensões das variantes de outras HUs', async () => {
    const { rerender } = await render(<StatusBadge estado="diasCiclo" />);
    expect(screen.getByLabelText('29 dias ciclo')).toHaveStyle(variantes.diasCiclo.container);
    expect(screen.getByText('29 dias')).toHaveProp('numberOfLines', 1);
    expect(screen.getByText('29 dias')).toHaveStyle({width: 45, height: 20});
    await rerender(<StatusBadge estado="estimativaIncerta" />);
    expect(screen.getByText('Estimativa incerta')).toHaveStyle({height: 17});
    expect(screen.getByText('Os dados deste ciclo podem ser imprecisos.')).toHaveProp('numberOfLines', 1);
    await rerender(<StatusBadge estado="emAndamento" />);
    expect(screen.getByLabelText('Em andamento')).toHaveStyle(variantes.confirmado.container);
    expect(screen.getByText('Em andamento')).toHaveProp('numberOfLines', 1);
    expect(screen.getByText('Em andamento')).toHaveStyle({height: 17});
});
