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

const variantes = [
    ['menstrual', '#C85A44', '#C85A44', '#F7F5F0'],
    ['folicular', '#2C4C3B', '#2C4C3B', '#F7F5F0'],
    ['ovulatoria', '#4A758E', '#4A758E', '#F7F5F0'],
    ['lutea', '#D68C3A', '#D68C3A', '#F7F5F0'],
    ['desconhecida', '#5C5C59', '#E6E2D8', '#FFFFFF']
];

test.each(variantes)('aplica a variante selecionada %s', async (fase, fundo, borda, conteudo) => {
    await montar({
        dias: [{ data: '2026-10-07', dia: 7, semana: 'qua', fase }],
        dataSelecionada: '2026-10-07'
    });

    expect(screen.getByRole('button', { name: 'qua, dia 7' })).toHaveStyle({
        backgroundColor: fundo,
        borderColor: borda,
        shadowColor: '#000000',
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 1
    });
    expect(screen.getByText('qua')).toHaveStyle({ color: conteudo, opacity: 0.85 });
    expect(screen.getByText('7')).toHaveStyle({ color: conteudo });
    expect(screen.getByTestId('indicador-2026-10-07')).toHaveStyle({ backgroundColor: conteudo });
});

test('mantém o estilo neutro no dia não selecionado', async () => {
    await montar({ dataSelecionada: 'outra-data' });

    const botao = screen.getByRole('button', { name: 'dom, dia 4' });
    expect(botao).toHaveStyle({ backgroundColor: '#FFFFFF', borderColor: '#E6E2D8' });
    expect(botao).not.toHaveStyle({ shadowOpacity: 0.04 });
    expect(screen.getByText('dom')).toHaveStyle({ color: '#5C5C59', opacity: 0.7 });
    expect(screen.getByText('4')).toHaveStyle({ color: '#5C5C59' });
});

test('diferencia o indicador de hoje dos demais dias', async () => {
    await montar({
        dias: [
            { data: '2026-10-07', dia: 7, semana: 'qua', fase: 'folicular', hoje: true },
            { data: '2026-10-08', dia: 8, semana: 'qui', fase: 'folicular' }
        ],
        dataSelecionada: 'outra-data'
    });

    expect(screen.getByTestId('indicador-2026-10-07')).toHaveStyle({ backgroundColor: '#222222' });
    expect(screen.getByTestId('indicador-2026-10-08')).toHaveStyle({ backgroundColor: 'transparent' });
});
