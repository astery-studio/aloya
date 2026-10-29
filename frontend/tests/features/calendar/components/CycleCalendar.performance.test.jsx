import { fireEvent } from '@testing-library/react-native';
import { CycleCalendar } from '../../../../src/features/calendar/components/CycleCalendar/CycleCalendar';
import { CycleMonth } from '../../../../src/features/calendar/components/CycleCalendar/CycleMonth';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/features/calendar/components/CycleCalendar/CycleMonth', () => {
    const { memo, createElement } = require('react');
    const original = jest.requireActual(
        '../../../../src/features/calendar/components/CycleCalendar/CycleMonth'
    );
    return { CycleMonth: memo(jest.fn((props) => createElement(original.CycleMonth, props))) };
});

test('paginação e loading não renderizam novamente o mês preservado', async () => {
    const mes = { mes: '2026-10', diasMenstruacao: [{ data: '2026-10-01', registroCicloId: 18 }] };
    const selecionar = jest.fn();
    const resultado = await renderWithTheme(
        <CycleCalendar meses={[mes]} aoPressionarDia={selecionar} />
    );
    const renderizacoes = () =>
        CycleMonth.type.mock.calls.filter(([props]) => props.mes.chave === mes.mes).length;
    const antes = renderizacoes();
    expect(antes).toBeGreaterThan(0);

    await resultado.rerender(
        <CycleCalendar meses={[mes, { mes: '2026-11' }]} aoPressionarDia={selecionar} />
    );
    expect(renderizacoes()).toBe(antes);
    await resultado.rerender(
        <CycleCalendar meses={[mes]} carregandoAnteriores aoPressionarDia={selecionar} />
    );
    expect(renderizacoes()).toBe(antes);

    const novoSelecionar = jest.fn();
    await resultado.rerender(<CycleCalendar meses={[mes]} aoPressionarDia={novoSelecionar} />);
    await fireEvent.press(
        resultado.getByRole('button', { name: 'Dia 1 de outubro de 2026, menstruação registrada' })
    );
    expect(novoSelecionar).toHaveBeenCalledWith({ data: '2026-10-01', registroCicloId: 18 });
    expect(selecionar).not.toHaveBeenCalled();
});

test('mantém a virtualização ativa no modo escuro', async () => {
    CycleMonth.type.mockClear();
    const mes = { mes: '2026-10', diasMenstruacao: [] };
    const meses = [mes];
    const selecionar = jest.fn();
    const resultado = await renderWithTheme(
        <CycleCalendar meses={meses} aoPressionarDia={selecionar} />,
        { preferencia: 'escuro' }
    );
    const quantidadeInicial = CycleMonth.type.mock.calls.length;

    await resultado.rerender(
        <CycleCalendar meses={meses} carregandoAnteriores aoPressionarDia={selecionar} />
    );

    expect(CycleMonth.type.mock.calls.length).toBe(quantidadeInicial);
});
