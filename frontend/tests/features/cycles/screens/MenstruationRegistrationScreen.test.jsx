import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MenstruationRegistrationScreen } from '../../../../src/features/cycles/screens/MenstruationRegistrationScreen';

const meses = [
    {
        mes: '2026-09',
        possuiCiclos: true,
        diasMenstruacao: [{ data: '2026-09-07', registroCicloId: 8 }],
        previsao: null
    }
];
function Provider({ children }) {
    return (
        <SafeAreaProvider
            initialMetrics={{
                frame: { x: 0, y: 0, width: 393, height: 852 },
                insets: { top: 44, left: 0, right: 0, bottom: 34 }
            }}
        >
            {children}
        </SafeAreaProvider>
    );
}
function montar(props = {}) {
    return render(
        <MenstruationRegistrationScreen
            meses={meses}
            hoje="2026-09-25"
            onVoltar={jest.fn()}
            {...props}
        />,
        { wrapper: Provider }
    );
}

test('abre no mês atual após carregar os meses, mesmo com um dia anterior pré-selecionado', async () => {
    const propriedades = { hoje: '2026-10-30', datasSelecionadas: ['2026-09-21'] };
    const tela = await montar({ ...propriedades, meses: [] });
    expect(
        screen.getByTestId('calendario-cadastro-menstruacao').props.initialScrollIndex
    ).toBeUndefined();
    await tela.rerender(
        <MenstruationRegistrationScreen
            {...propriedades}
            meses={[...meses, { mes: '2026-10', diasMenstruacao: [], previsao: null }]}
        />
    );
    const lista = screen.getByTestId('calendario-cadastro-menstruacao').props;
    expect(lista.initialScrollIndex).toBe(1);
    expect(lista.getItemLayout(null, 1).offset).toBeGreaterThan(0);
    expect(lista.getItemLayout(null, 0).offset).toBe(0);
});

test('duplo toque em um dia livre solicita uma nova faixa e não abre confirmação', async () => {
    const alternar = jest.fn();
    const iniciar = jest.fn();
    await montar({ onAlternarData: alternar, onIniciarFaixa: iniciar });
    const dia = screen.getByRole('button', { name: '4 de setembro de 2026' });
    await fireEvent.press(dia);
