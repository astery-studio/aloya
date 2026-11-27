import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { render } from '../mockTheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
    ContraceptiveTrackingScreen,
    MENSAGEM_VAZIO,
    criarSecoes
} from '../../../../src/features/contraceptives/screens/ContraceptiveTrackingScreen';
import { criarEstilosAcompanhamento } from '../../../../src/features/contraceptives/screens/ContraceptiveTrackingScreen.styles';
import { temaClaro } from '../../../../src/shared/theme/themePalettes';

const metricas = {
    frame: { x: 0, y: 0, width: 393, height: 852 },
    insets: { top: 32, left: 0, right: 0, bottom: 24 }
};

function renderizar(componente) {
    return render(<SafeAreaProvider initialMetrics={metricas}>{componente}</SafeAreaProvider>);
}

test('aplica a área segura superior no Header e mantém o FAB na área protegida', async () => {
    await renderizar(<ContraceptiveTrackingScreen aoCadastrarNovo={jest.fn()} />);
    const area = screen.getByTestId('anticoncepcionais-area-segura');
    expect(area).toHaveProp('edges', {
        top: 'off',
        left: 'additive',
        right: 'additive',
        bottom: 'additive'
    });
    expect(area).toContainElement(
        screen.getByRole('button', { name: 'Cadastrar novo anticoncepcional' })
    );
    expect(screen.getByTestId('contraceptive-tracking-add-fab').parent).toHaveStyle({
        bottom: metricas.insets.bottom + temaClaro.espacamentos.grande
    });
});

test('reproduz o estado vazio e a ação principal do protótipo', async () => {
    const aoCadastrarNovo = jest.fn();
    await renderizar(<ContraceptiveTrackingScreen aoCadastrarNovo={aoCadastrarNovo} />);

    expect(screen.getByRole('header', { name: 'Anticoncepcionais' })).toBeOnTheScreen();
    expect(screen.getByText('Nenhum anticoncepcional')).toBeOnTheScreen();
    expect(screen.getByText(MENSAGEM_VAZIO)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar novo anticoncepcional' }));
    expect(aoCadastrarNovo).toHaveBeenCalledTimes(1);
});

test('usa o padrão compartilhado dos headers com voltar', async () => {
    await renderizar(<ContraceptiveTrackingScreen />);

    const titulo = screen.getByRole('header', { name: 'Anticoncepcionais' });

    expect(titulo).toHaveStyle({
        fontFamily: 'DMSans_700Bold',
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 28,
        textAlign: 'center'
    });
    expect(titulo.props.numberOfLines).toBeUndefined();
    expect(titulo.props.adjustsFontSizeToFit).toBeUndefined();

    const estilos = criarEstilosAcompanhamento(temaClaro);

    expect(screen.getByTestId('header-container')).toHaveStyle({ paddingTop: 48 });
    expect(screen.getByTestId('header-content')).toHaveStyle({ paddingBottom: 16 });
    expect(estilos.corpo.paddingTop).toBe(8);
});

test('não duplica o cartão que possui doses com estados diferentes', () => {
    const item = {
        id: 'yaz',
        tipo: 'pilula',
        usosHoje: [
            { id: 'manha', horario: '08:00', status: 'confirmado' },
            { id: 'noite', horario: '20:00', status: 'pendente' }
        ]
    };
    expect(criarSecoes([item])).toEqual([{ titulo: 'NÃO USADOS', data: [item] }]);
});

test('no acompanhamento, mantém as seções e centraliza o card sem o aviso de pendências', async () => {
    await renderizar(
        <ContraceptiveTrackingScreen
            somenteLeitura
            aoCadastrarNovo={jest.fn()}
            aoAlternarUso={jest.fn()}
            anticoncepcionais={[
                {
                    id: '1',
                    nome: 'Yaz',
                    tipo: 'pilula',
                    intensidadeAlerta: 'moderado',
                    usosHoje: [{ id: 'u1', horario: '08:00', status: 'pendente', atrasado: true }]
                },
                { id: '2', nome: 'Mirena', tipo: 'diu_hormonal' }
            ]}
        />
    );

    expect(screen.queryByText('1 uso pendente hoje')).toBeNull();
    expect(screen.getByRole('header', { name: 'NÃO USADOS' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'USADOS' })).toBeOnTheScreen();
    expect(screen.getByText('Alerta Moderado')).toBeOnTheScreen();
    expect(screen.getByText('08:00')).toBeOnTheScreen();
    expect(screen.getByText('Yaz')).toHaveStyle({ textAlign: 'center' });
    expect(screen.getByText('Pílula')).toHaveStyle({ textAlign: 'center' });
    expect(screen.getByText('PRÓXIMOS HORÁRIOS')).toHaveStyle({ textAlign: 'center' });
    expect(screen.getByText('08:00').parent.parent).toHaveStyle({ justifyContent: 'center' });
    expect(screen.getByText('Atrasado')).toBeOnTheScreen();
    expect(
        screen.queryByRole('button', { name: /Editar|Remover|Marcar Uso|Cadastrar novo/ })
    ).toBeNull();
});

test('o banner não conta doses de removidos nem de DIU, mas inclui o anel conforme o protótipo vigente', async () => {
    await renderizar(
        <ContraceptiveTrackingScreen
            anticoncepcionais={[
                {
                    id: '1',
                    nome: 'Mirena',
                    tipo: 'diu_hormonal',
                    programacao: { horarios: ['08:00'] }
                },
                {
                    id: '2',
                    nome: 'NuvaRing',
                    tipo: 'anel_vaginal',
                    programacao: { horarios: ['10:00'] }
                },
                {
                    id: '3',
                    nome: 'Depo-Provera',
                    tipo: 'injetavel',
                    removido: true,
                    usosHoje: [{ id: 'u3', status: 'pendente' }]
                }
            ]}
        />
    );

    expect(screen.getByText('1 uso pendente hoje')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Marcar Uso' })).toHaveLength(1);
    expect(screen.getByText('REMOVIDOS')).toBeOnTheScreen();
});

test('a confirmação atualiza o banner e a seção sem duplicar o cartão', async () => {
    await renderizar(
        <ContraceptiveTrackingScreen
            aoAlternarUso={jest.fn().mockResolvedValue(undefined)}
            anticoncepcionais={[
                {
                    id: '1',
                    nome: 'Evra',
                    tipo: 'adesivo',
                    usosHoje: [{ id: 'u1', horario: '09:30', status: 'pendente' }]
                }
            ]}
        />
    );

    expect(screen.getByText('1 uso pendente hoje')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Uso' }));
    await waitFor(() => expect(screen.getByRole('header', { name: 'USADOS' })).toBeOnTheScreen());
    expect(screen.queryByText('1 uso pendente hoje')).not.toBeOnTheScreen();
    expect(screen.queryByText('NÃO USADOS')).not.toBeOnTheScreen();
    expect(screen.getAllByText('Evra')).toHaveLength(1);
});

test('a falha ao marcar restaura banner, seção e controle anteriores', async () => {
    await renderizar(
        <ContraceptiveTrackingScreen
            aoAlternarUso={jest.fn().mockRejectedValue(new Error('rede'))}
            anticoncepcionais={[
                {
                    id: '1',
                    nome: 'Evra',
                    tipo: 'adesivo',
                    usosHoje: [{ id: 'u1', horario: '09:30', status: 'pendente' }]
                }
            ]}
        />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Marcar Uso' }));
    await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Marcar Uso' })).toBeOnTheScreen()
    );
    expect(screen.getByText('1 uso pendente hoje')).toBeOnTheScreen();
    expect(screen.getByText('NÃO USADOS')).toBeOnTheScreen();
    expect(screen.queryByText('USADOS')).not.toBeOnTheScreen();
});

test('agrupa itens e apresenta o banner de usos pendentes', async () => {
    await renderizar(
        <ContraceptiveTrackingScreen
            anticoncepcionais={[
                {
                    id: '1',
                    nome: 'Yaz',
                    tipo: 'pilula',
                    intensidadeAlerta: 'moderado',
                    programacao: { horarios: ['08:00', '20:00'] },
                    historico: []
                },
                {
                    id: '2',
                    nome: 'Mirena',
                    tipo: 'diu_hormonal',
                    intensidadeAlerta: 'leve',
                    dataValidade: '14/03/2029',
                    validadeRestante: '30 meses restantes',
                    historico: []
                }
            ]}
        />
    );

    expect(screen.getByText('2 usos pendentes hoje')).toBeOnTheScreen();
    expect(screen.getByText('NÃO USADOS')).toBeOnTheScreen();
    expect(screen.getByText('USADOS')).toBeOnTheScreen();
    expect(screen.getByText('Yaz')).toBeOnTheScreen();
    expect(screen.getByText('Mirena')).toBeOnTheScreen();
});
