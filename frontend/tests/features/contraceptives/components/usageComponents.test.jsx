import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { PendingUsesBanner } from '../../../../src/features/contraceptives/components/PendingUsesBanner';
import { UsageCalendar } from '../../../../src/features/contraceptives/components/UsageCalendar';
import { UsageHistoryPanel } from '../../../../src/features/contraceptives/components/UsageHistoryPanel';
import { estilosUso } from '../../../../src/features/contraceptives/components/usageComponents.styles';

test('trata singular, plural e ausência de usos pendentes', async () => {
    const { rerender } = await render(<PendingUsesBanner quantidade={1} />);
    expect(screen.getByText('1 uso pendente hoje')).toBeOnTheScreen();
    expect(screen.getByRole('alert', { name: '1 uso pendente hoje' })).toBeOnTheScreen();

    await rerender(<PendingUsesBanner quantidade={2} />);
    expect(screen.getByText('2 usos pendentes hoje')).toBeOnTheScreen();
    expect(screen.getByRole('alert', { name: '2 usos pendentes hoje' })).toBeOnTheScreen();

    await rerender(<PendingUsesBanner quantidade={0} />);
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
});

test('reproduz as medidas, cores e tipografia exatas do protótipo', () => {
    expect(estilosUso.banner).toMatchObject({
        width: '100%',
        maxWidth: 350.01,
        height: 39.41,
        paddingVertical: 9,
        paddingHorizontal: 14,
        gap: 7,
        backgroundColor: '#FBF3E0',
        borderWidth: 0.70489,
        borderColor: '#E8C97A',
        borderRadius: 10
    });
    expect(estilosUso.textoBanner).toMatchObject({
        width: 142,
        height: 20,
        color: '#B07D2A',
        fontWeight: '600',
        fontSize: 13,
        lineHeight: 20
    });
});

test('expande e apresenta registros do histórico em lista', async () => {
    const aoAlternar = jest.fn();
    await render(
        <UsageHistoryPanel
            expandido
            registros={[{ id: '1', data: '07/10/2026', horario: '08:00', estado: 'Confirmado' }]}
            aoAlternar={aoAlternar}
        />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Histórico de uso' }));
    expect(aoAlternar).toHaveBeenCalledTimes(1);
    expect(screen.getByText('07/10/2026')).toBeOnTheScreen();
    expect(screen.getByText('08:00')).toBeOnTheScreen();
    expect(screen.getByText('Confirmado')).toBeOnTheScreen();
});

test('mantém o conteúdo oculto quando o painel está recolhido', async () => {
    const aoAlternar = jest.fn();
    await render(
        <UsageHistoryPanel
            registros={[{ id: '1', data: '07/10/2026', horario: '08:00', estado: 'confirmado' }]}
            aoAlternar={aoAlternar}
        />
    );

    const botao = screen.getByRole('button', { name: 'Histórico de uso' });
    expect(botao.props.accessibilityState).toEqual({ expanded: false });
    expect(screen.queryByText('07/10/2026')).not.toBeOnTheScreen();

    await fireEvent.press(botao);
    expect(aoAlternar).toHaveBeenCalledTimes(1);
});

test('apresenta explicitamente a ausência de confirmação', async () => {
    await render(
        <UsageHistoryPanel
            expandido
            registros={[{
                id: '1',
                data: '04/09/2026',
                horarioProgramado: '14:00',
                estado: 'naoConfirmado'
            }]}
            aoAlternar={jest.fn()}
        />
    );

    expect(screen.getByText('Não confirmado')).toBeOnTheScreen();
    expect(screen.getByText('Não houve confirmação')).toBeOnTheScreen();
});

test('mapeia todos os estados de histórico para o StatusBadge correto', async () => {
    await render(
        <UsageHistoryPanel
            expandido
            registros={[
                { id: '1', data: '05/09/2026', estado: 'confirmado' },
                { id: '2', data: '04/09/2026', estado: 'foraDoPrazo' },
                { id: '3', data: '03/09/2026', estado: 'naoConfirmado' }
            ]}
            aoAlternar={jest.fn()}
        />
    );

    expect(screen.getByLabelText('Confirmado')).toBeOnTheScreen();
    expect(screen.getByLabelText('Confirmado fora do prazo')).toBeOnTheScreen();
    expect(screen.getByLabelText('Não confirmado')).toBeOnTheScreen();
});

test('reproduz as medidas exatas do painel e dos registros', () => {
    expect(estilosUso.cabecalhoPainel).toMatchObject({ width: '100%', height: 28, paddingTop: 10 });
    expect(estilosUso.botaoPainel).toMatchObject({ width: 124.99, height: 18, gap: 4 });
    expect(estilosUso.tituloPainel).toMatchObject({
        width: 93,
        height: 18,
        fontWeight: '500',
        fontSize: 12,
        lineHeight: 18
    });
    expect(estilosUso.conteudoPainel).toMatchObject({ paddingTop: 8, paddingHorizontal: 16 });
    expect(estilosUso.listaRegistros).toMatchObject({ width: '100%', gap: 6 });
    expect(estilosUso.registro).toMatchObject({
        width: '100%',
        height: 95,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: '#F7F5F0',
        borderRadius: 10
    });
    expect(estilosUso.registroNaoConfirmado).toMatchObject({ height: 91 });
});

test('apresenta calendário e permite navegar entre meses', async () => {
    const anterior = jest.fn();
    const proximo = jest.fn();
    await render(
        <UsageCalendar
            mes="2026-09"
            dias={[{ dia: 3, estado: 'confirmado' }, { dia: 4, estado: 'foraDoPrazo' }]}
            aoMesAnterior={anterior}
            aoProximoMes={proximo}
        />
    );

    expect(screen.getByText('Setembro 2026')).toBeOnTheScreen();
    expect(screen.getByText('Confirmado')).toBeOnTheScreen();
    expect(screen.getByText('Fora do prazo')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(anterior).toHaveBeenCalledTimes(1);
    expect(proximo).toHaveBeenCalledTimes(1);
});

test('aplica os três estados visuais aos dias e os descreve para acessibilidade', async () => {
    await render(
        <UsageCalendar
            mes="2026-09"
            dias={[
                { dia: 3, estado: 'foraDoPrazo' },
                { dia: 4, estado: 'confirmado' },
                { dia: 5, estado: 'naoConfirmado' }
            ]}
            aoMesAnterior={jest.fn()}
            aoProximoMes={jest.fn()}
        />
    );

    const foraDoPrazo = screen.getByLabelText('Dia 3, Fora do prazo');
    const confirmado = screen.getByLabelText('Dia 4, Confirmado');
    const naoConfirmado = screen.getByLabelText('Dia 5, Não confirmado');

    expect(foraDoPrazo).toHaveStyle({ backgroundColor: 'rgba(214, 140, 58, 0.8)' });
    expect(confirmado).toHaveStyle({ backgroundColor: 'rgba(44, 76, 59, 0.8)' });
    expect(naoConfirmado).toHaveStyle({ backgroundColor: 'rgba(200, 90, 68, 0.8)' });
    expect(within(foraDoPrazo).getByText('3')).toHaveStyle({ color: '#FFFFFF' });
    expect(within(confirmado).getByText('4')).toHaveStyle({ color: '#FFFFFF' });
    expect(within(naoConfirmado).getByText('5')).toHaveStyle({ color: '#FFFFFF' });
});

test('destaca o dia atual sem depender dos estados de uso', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 7, 12, 0, 0));

    try {
        await render(
            <UsageCalendar
                mes="2026-09"
                dias={[]}
                aoMesAnterior={jest.fn()}
                aoProximoMes={jest.fn()}
            />
        );

        const hoje = screen.getByLabelText('Dia 7, sem registro');
        expect(hoje).toHaveStyle({ borderWidth: 1, borderColor: '#E6E2D8' });
        expect(within(hoje).getByText('7')).toHaveStyle({ fontWeight: '900' });
    } finally {
        jest.useRealTimers();
    }
});

test('mantém cinco semanas no protótipo e comporta meses com seis semanas', async () => {
    const { rerender } = await render(
        <UsageCalendar
            mes="2026-09"
            dias={[]}
            aoMesAnterior={jest.fn()}
            aoProximoMes={jest.fn()}
        />
    );
    expect(screen.getByTestId('usage-calendar')).toHaveStyle({ height: 256.43 });

    await rerender(
        <UsageCalendar
            mes="2026-08"
            dias={[]}
            aoMesAnterior={jest.fn()}
            aoProximoMes={jest.fn()}
        />
    );
    expect(screen.getByTestId('usage-calendar')).toHaveStyle({ height: 291.43 });
});

test('reproduz as medidas e a tipografia exatas do calendário', () => {
    expect(estilosUso.calendario).toMatchObject({
        width: '100%',
        maxWidth: 315.21,
        height: 256.43,
        padding: 8,
        backgroundColor: '#F7F5F0',
        borderRadius: 12
    });
    expect(estilosUso.cabecalhoCalendario).toMatchObject({ width: '100%', height: 22 });
    expect(estilosUso.botaoMes).toMatchObject({ width: 26, height: 22, paddingVertical: 4, paddingHorizontal: 6 });
    expect(estilosUso.tituloMes).toMatchObject({ height: 18, fontWeight: '700', fontSize: 12, lineHeight: 18 });
    expect(estilosUso.margemDiasSemana).toMatchObject({ height: 19.49, paddingTop: 6 });
    expect(estilosUso.diaSemana).toMatchObject({
        height: 13.49,
        fontWeight: '600',
        fontSize: 9,
        lineHeight: 14,
        letterSpacing: 0.18
    });
    expect(estilosUso.margemGradeDias).toMatchObject({ height: 175.96, paddingTop: 2 });
    expect(estilosUso.gradeDias).toMatchObject({ height: 173.96, gap: 1 });
    expect(estilosUso.linhaSemana).toMatchObject({ height: 34, gap: 1 });
    expect(estilosUso.celulaDia).toMatchObject({ height: 34, gap: 2, borderRadius: 8 });
    expect(estilosUso.numeroDia).toMatchObject({
        height: 12,
        fontWeight: '400',
        fontSize: 12,
        lineHeight: 12
    });
});

test('reproduz as medidas exatas da legenda', () => {
    expect(estilosUso.legenda).toMatchObject({
        width: '100%',
        height: 23,
        gap: 10,
        paddingTop: 8,
        paddingHorizontal: 13
    });
    expect(estilosUso.itemLegenda_confirmado).toMatchObject({ width: 64.99 });
    expect(estilosUso.itemLegenda_foraDoPrazo).toMatchObject({ width: 74.99 });
    expect(estilosUso.itemLegenda_naoConfirmado).toMatchObject({ width: 84.99 });
    expect(estilosUso.marcadorLegenda).toMatchObject({
        width: 5.99,
        height: 5.99,
        borderRadius: 2.99578
    });
    expect(estilosUso.textoLegenda_confirmado).toMatchObject({ width: 55 });
    expect(estilosUso.textoLegenda_foraDoPrazo).toMatchObject({ width: 65 });
    expect(estilosUso.textoLegenda_naoConfirmado).toMatchObject({ width: 75 });
});

test('controla o calendário pelo contrato público do painel', async () => {
    await render(
        <UsageHistoryPanel
            expandido
            modo="calendario"
            registros={[{ id: '1', data: '2026-09-03', estado: 'confirmado' }]}
            aoAlternar={jest.fn()}
        />
    );

    expect(screen.getByText('Setembro 2026')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(screen.getByText('Outubro 2026')).toBeOnTheScreen();
});
