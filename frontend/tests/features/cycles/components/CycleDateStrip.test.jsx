import { fireEvent, render, screen } from '@testing-library/react-native';
import { CycleDateStrip } from '../../../../src/features/cycles/components/CycleDateStrip';

const dias = [
    { data: '2026-10-04', dia: 4, semana: 'dom', fase: 'menstrual' },
    { data: '2026-10-05', dia: 5, semana: 'seg', fase: 'folicular' }
];

function montar(propriedades = {}) {
    return render(<CycleDateStrip
        dias={dias}
        dataSelecionada="2026-10-05"
        {...propriedades}
    />);
}

test('renderiza a faixa horizontal sem indicador de rolagem', async () => {
    await montar();

    const faixa = screen.getByLabelText('Datas do ciclo');
    expect(faixa.props.horizontal).toBe(true);
    expect(faixa.props.showsHorizontalScrollIndicator).toBe(false);
    expect(screen.getAllByRole('button')).toHaveLength(2);
});

test('aceita a lista vazia padrão', async () => {
    await render(<CycleDateStrip />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
});

test('permite selecionar outra data e expõe o estado acessível', async () => {
    const aoSelecionarData = jest.fn();
    await montar({ aoSelecionarData });

    fireEvent.press(screen.getByRole('button', { name: 'dom, dia 4' }));
    expect(aoSelecionarData).toHaveBeenCalledWith('2026-10-04');
    expect(screen.getByRole('button', { name: 'dom, dia 4' }))
        .toHaveProp('accessibilityState', { selected: false });
    expect(screen.getByRole('button', { name: 'seg, dia 5' }))
        .toHaveProp('accessibilityState', { selected: true });
});

test('não exige callback para pressionar uma data', async () => {
    await montar();

    expect(() => fireEvent.press(screen.getByRole('button', { name: 'dom, dia 4' })))
        .not.toThrow();
});

test('apresenta interrogação quando o número do dia não está disponível', async () => {
    await montar({
        dias: [{ data: '2026-10-06', semana: 'ter', fase: 'desconhecida' }],
        dataSelecionada: '2026-10-06'
    });

    expect(screen.getByText('?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'ter, dia ?' })).toBeOnTheScreen();
});
