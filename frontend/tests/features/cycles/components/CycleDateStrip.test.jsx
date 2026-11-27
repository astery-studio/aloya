import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import {
    calcularPaddingLateral,
    CycleDateStrip
} from '../../../../src/features/cycles/components/CycleDateStrip';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const dias = [
    { data: '2026-10-04', dia: 4, semana: 'dom', fase: 'menstrual' },
    { data: '2026-10-05', dia: 5, semana: 'seg', fase: 'folicular' }
];

function montar(propriedades = {}) {
    return render(<CycleDateStrip dias={dias} dataSelecionada="2026-10-05" {...propriedades} />);
}

test.each([
    [390, 172],
    [402, 178],
    [46, 8],
    [0, 8]
])('calcula o espaço lateral que centraliza um dia em uma faixa de %ipx', (largura, esperado) => {
    expect(calcularPaddingLateral(largura)).toBe(esperado);
});

test('renderiza a faixa horizontal sem indicador de rolagem', async () => {
    await montar();

    const faixa = screen.getByLabelText('Datas do ciclo');
    expect(faixa.props.horizontal).toBe(true);
    expect(faixa.props.showsHorizontalScrollIndicator).toBe(false);
    expect(faixa.props.windowSize).toBe(5);
    expect(faixa.props.contentOffset).toEqual({ x: 54, y: 0 });
    expect(faixa.props.maintainVisibleContentPosition).toEqual({ minIndexForVisible: 1 });
    expect(faixa.props.onScrollToIndexFailed).toEqual(expect.any(Function));
    expect(screen.getAllByRole('button')).toHaveLength(2);
});

test('recalcula a centralização quando a faixa tem margem lateral', async () => {
    await montar();
    const obterPadding = () =>
        StyleSheet.flatten(screen.getByLabelText('Datas do ciclo').props.contentContainerStyle)
            .paddingHorizontal;
    const paddingSemMargem = obterPadding();

    await montar({ margemHorizontal: 24 });
    expect(obterPadding()).toBe(paddingSemMargem - 24);
});

test.each([
    ['anteriores', { x: 0, callback: 'aoCarregarAnteriores' }],
    ['posteriores', { x: 610, callback: 'aoCarregarPosteriores' }]
])('solicita mais datas %s ao alcançar a borda da faixa', async (_, { x, callback }) => {
    const carregar = jest.fn();
    await montar({ [callback]: carregar });
    const faixa = screen.getByLabelText('Datas do ciclo');
    const evento = {
        nativeEvent: {
            contentOffset: { x, y: 0 },
            contentSize: { width: 1000, height: 94 },
            layoutMeasurement: { width: 390, height: 94 }
        }
    };

    await fireEvent(faixa, 'scrollEndDrag', evento);
    await fireEvent(faixa, 'momentumScrollEnd', evento);

    expect(carregar).toHaveBeenCalledTimes(1);
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
    expect(screen.getByRole('button', { name: 'dom, dia 4' })).toHaveProp('accessibilityState', {
        selected: false
    });
    expect(screen.getByRole('button', { name: 'seg, dia 5' })).toHaveProp('accessibilityState', {
        selected: true
    });
});

test('não exige callback para pressionar uma data', async () => {
    await montar();

    expect(() => fireEvent.press(screen.getByRole('button', { name: 'dom, dia 4' }))).not.toThrow();
});

test('conserva o fundo branco arredondado ao selecionar e desmarcar um dia', async () => {
    function FaixaComSelecao() {
        const [dataSelecionada, selecionar] = useState(dias[0].data);
        return (
            <CycleDateStrip
                dias={dias}
                dataSelecionada={dataSelecionada}
                aoSelecionarData={selecionar}
            />
        );
    }

    await render(<FaixaComSelecao />);
    const fundo = () => screen.getByTestId('fundo-dia-2026-10-05');
    const forma = { borderRadius: 14, backgroundColor: '#FFFFFF', height: 62 };
    expect(fundo()).toHaveStyle(forma);

    await fireEvent.press(screen.getByRole('button', { name: 'seg, dia 5' }));
    expect(fundo()).toHaveStyle({ ...forma, opacity: 0 });

    await fireEvent.press(screen.getByRole('button', { name: 'dom, dia 4' }));
    expect(fundo()).toHaveStyle(forma);
    expect(fundo()).not.toHaveStyle({ opacity: 0 });
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
    ['desconhecida', '#5C5C59', '#E6E2D8', '#F7F5F0']
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
    expect(screen.getByTestId('indicador-2026-10-07')).toHaveStyle({
        backgroundColor: 'transparent'
    });
});

test('mantém a borda da fase no dia não selecionado', async () => {
    await montar({ dataSelecionada: 'outra-data' });

    const botao = screen.getByRole('button', { name: 'dom, dia 4' });
    expect(botao).toHaveStyle({ backgroundColor: '#C85A44', borderColor: '#C85A44' });
    expect(botao).not.toHaveStyle({ shadowOpacity: 0.04 });
    expect(screen.getByText('dom')).toHaveStyle({ color: '#5C5C59', includeFontPadding: false });
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
    expect(screen.getByTestId('indicador-2026-10-08')).toHaveStyle({
        backgroundColor: 'transparent'
    });
});

test('exibe a bolinha clara quando hoje também está selecionado', async () => {
    await montar({
        dias: [{ data: '2026-10-07', dia: 7, semana: 'qua', fase: 'folicular', hoje: true }],
        dataSelecionada: '2026-10-07'
    });

    expect(screen.getByTestId('indicador-2026-10-07')).toHaveStyle({
        backgroundColor: '#F7F5F0'
    });
});

test('não solicita mais datas se a faixa cabe inteira na área visível', async () => {
    const aoCarregarAnteriores = jest.fn();
    const aoCarregarPosteriores = jest.fn();
    await montar({ aoCarregarAnteriores, aoCarregarPosteriores });

    await fireEvent(screen.getByLabelText('Datas do ciclo'), 'scrollEndDrag', {
        nativeEvent: {
            contentOffset: { x: 0, y: 0 },
            contentSize: { width: 100, height: 94 },
            layoutMeasurement: { width: 390, height: 94 }
        }
    });

    expect(aoCarregarAnteriores).not.toHaveBeenCalled();
    expect(aoCarregarPosteriores).not.toHaveBeenCalled();
});

test.each([0, 56])(
    'recupera a posição quando a faixa não mediu os itens (%i)',
    async (averageItemLength) => {
        await montar();

        const faixa = screen.getByLabelText('Datas do ciclo');
        const recuperar = faixa.props.onScrollToIndexFailed;
        expect(() => recuperar({ index: 1, averageItemLength })).not.toThrow();
        expect(screen.getByRole('button', { name: 'seg, dia 5' })).toBeSelected();
    }
);
