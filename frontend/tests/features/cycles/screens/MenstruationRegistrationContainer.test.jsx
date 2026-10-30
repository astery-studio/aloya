import { act, render, waitFor } from '@testing-library/react-native';
import { MenstruationRegistrationContainer } from '../../../../src/features/cycles/screens/MenstruationRegistrationContainer';

let mockProps;
jest.mock('../../../../src/features/cycles/screens/MenstruationRegistrationScreen', () => ({
    MenstruationRegistrationScreen: (props) => {
        mockProps = props;
        return null;
    }
}));
jest.mock('../../../../src/features/calendar/utils/cycleCalendar.utils', () => ({
    obterHojeLocal: () => '2026-10-30'
}));

test('pré-preenche a data recebida da Home e permite mudar ou desmarcar sem salvar', async () => {
    const calendarService = { buscarMes: async ({ mes }) => ({ mes, diasMenstruacao: [] }) };
    const fila = { adicionar: jest.fn(), sincronizar: jest.fn() };
    await render(
        <MenstruationRegistrationContainer
            calendarService={calendarService}
            fila={fila}
            dataInicial="2026-10-27"
        />
    );
    await waitFor(() => expect(mockProps.meses).toHaveLength(12));
    expect(mockProps.datasSelecionadas).toEqual(['2026-10-27']);
    await act(() => mockProps.onAlternarData('2026-10-27'));
    expect(mockProps.datasSelecionadas).toEqual([]);
    await act(() => mockProps.onAlternarData('2026-10-28'));
    expect(mockProps.datasSelecionadas).toEqual(['2026-10-28']);
    expect(fila.adicionar).not.toHaveBeenCalled();
});

test.each(['2026-10-31', '2026-02-30'])(
    'não pré-seleciona data futura ou inválida: %s',
    async (dataInicial) => {
        const calendarService = { buscarMes: async ({ mes }) => ({ mes, diasMenstruacao: [] }) };
        await render(
            <MenstruationRegistrationContainer
                calendarService={calendarService}
                fila={{}}
                dataInicial={dataInicial}
            />
        );
        await waitFor(() => expect(mockProps.meses).toHaveLength(12));
        expect(mockProps.datasSelecionadas).toEqual([]);
    }
);

test('dias 2 e 3 permanecem selecionados até um duplo toque iniciar outra faixa no 4', async () => {
    const calendarService = { buscarMes: async ({ mes }) => ({ mes, diasMenstruacao: [] }) };
    const fila = { adicionar: jest.fn(), sincronizar: jest.fn() };
    await render(
        <MenstruationRegistrationContainer
            calendarService={calendarService}
            fila={fila}
            onVoltar={jest.fn()}
        />
    );
    await waitFor(() => expect(mockProps.meses).toHaveLength(12));
