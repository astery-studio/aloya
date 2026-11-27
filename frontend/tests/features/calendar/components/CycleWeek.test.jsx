//Testa semanas, interação dos dias e continuidade da janela fértil.
import { fireEvent, render, screen } from '@testing-library/react-native';
import { processColor, StyleSheet } from 'react-native';

import {
    CycleWeek,
    obterTrechosFerteis
} from '../../../../src/features/calendar/components/CycleCalendar/CycleWeek';
import { criarEstilosCalendario } from '../../../../src/features/calendar/components/CycleCalendar/CycleCalendar.styles';
import { temaEscuro } from '../../../../src/shared/theme/themePalettes';

function criarDia(numero, alteracoes = {}) {
    return {
        dia: numero,
        data: `2026-10-${String(numero).padStart(2, '0')}`,
        tipo: null,
        previsto: false,
        futuro: false,
        registroCicloId: null,
        janelaFertil: false,
        janelaFertilPrevista: false,
        inicioSegmento: false,
        fimSegmento: false,
        ...alteracoes
    };
}

async function medirContorno(chave, width) {
    await fireEvent(screen.getByTestId(`janela-fertil-${chave}`), 'layout', {
        nativeEvent: { layout: { width, height: 54 } }
    });

    return screen.getByTestId(`pontilhado-fertil-${chave}`);
}

describe('CycleWeek', () => {
    test('mantém exatamente sete posições na semana', async () => {
        const semana = [
            null,
            null,
            criarDia(1),
            criarDia(2),
            criarDia(3),
            criarDia(4),
            criarDia(5)
        ];

        const resultado = await render(<CycleWeek semana={semana} />);

        expect(resultado.toJSON().children).toHaveLength(7);
        expect(screen.getByText('1')).toBeOnTheScreen();
        expect(screen.getByText('5')).toBeOnTheScreen();
    });

    test('cria um único contorno para dias férteis contínuos', async () => {
        const semana = [
            criarDia(1),
            criarDia(2, { janelaFertil: true }),
            criarDia(3, { janelaFertil: true }),
            criarDia(4, { janelaFertil: true }),
            criarDia(5),
            criarDia(6),
            criarDia(7)
        ];

        await render(<CycleWeek semana={semana} />);

        const contorno = screen.getByTestId('janela-fertil-2026-10-02-2026-10-04');

        const estiloContorno = StyleSheet.flatten(contorno.props.style);

        expect(parseFloat(estiloContorno.left)).toBeCloseTo(100 / 7, 10);
        expect(parseFloat(estiloContorno.width)).toBeCloseTo(300 / 7, 10);
        expect(contorno).toHaveProp('pointerEvents', 'none');

        const pontilhado = await medirContorno('2026-10-02-2026-10-04', 150);
        expect(pontilhado).toHaveProp('strokeDasharray', ['2', '4']);
        expect(Number(pontilhado.props.width)).toBe(148);
    });

    test('separa a janela fértil atual da parte futura prevista', async () => {
        const semana = [
            criarDia(1),
            criarDia(2, { janelaFertil: true }),
            criarDia(3, { janelaFertil: true }),
            criarDia(4, {
                janelaFertil: true,
                janelaFertilPrevista: true,
                futuro: true
            }),
            criarDia(5, {
                janelaFertil: true,
                janelaFertilPrevista: true,
                futuro: true
            }),
            criarDia(6),
            criarDia(7)
        ];

        await render(<CycleWeek semana={semana} />);

        const atual = await medirContorno('2026-10-02-2026-10-03', 100);
        const previsto = await medirContorno('2026-10-04-2026-10-05', 100);
        expect(atual).toHaveProp('stroke', {
            type: 0,
            payload: processColor('rgba(34, 34, 34, 0.70)')
        });
        expect(previsto).toHaveProp('stroke', {
            type: 0,
            payload: processColor('rgba(34, 34, 34, 0.42)')
        });
    });

    test('não desenha contorno quando a semana não possui janela fértil', async () => {
        const semana = Array.from({ length: 7 }, (_, indice) => criarDia(indice + 1));

        await render(<CycleWeek semana={semana} />);

        expect(screen.queryByTestId(/janela-fertil-/)).toBeNull();
    });

    test('encaminha a interação de um dia menstrual registrado', async () => {
        const aoPressionarDia = jest.fn();
        const semana = [
            criarDia(1, {
                tipo: 'menstruacao',
                registroCicloId: 18,
                inicioSegmento: true,
                fimSegmento: true
            }),
            criarDia(2),
            criarDia(3),
            criarDia(4),
            criarDia(5),
            criarDia(6),
            criarDia(7)
        ];

        await render(<CycleWeek semana={semana} aoPressionarDia={aoPressionarDia} />);

        fireEvent.press(
            screen.getByRole('button', {
                name: 'Dia 1 de outubro de 2026, menstruação registrada'
            })
        );

        expect(aoPressionarDia).toHaveBeenCalledWith({
            data: '2026-10-01',
            registroCicloId: 18
        });
    });

    test('calcula os trechos sem alterar os dias recebidos', () => {
        const semana = [
            criarDia(1),
            criarDia(2, { janelaFertil: true }),
            criarDia(3, { janelaFertil: true }),
            criarDia(4),
            criarDia(5),
            criarDia(6),
            criarDia(7)
        ];

        const copia = JSON.parse(JSON.stringify(semana));

        expect(obterTrechosFerteis(semana)).toEqual([
            {
                inicio: 1,
                quantidade: 2,
                previsto: false,
                chave: '2026-10-02-2026-10-03'
            }
        ]);

        expect(semana).toEqual(copia);
    });

    test('mantém visível o contorno fértil no tema escuro', async () => {
        const estilosTemaEscuro = criarEstilosCalendario(temaEscuro);
        const semana = Array.from({ length: 7 }, (_, indice) =>
            criarDia(indice + 1, { janelaFertil: indice > 0 && indice < 4 })
        );

        await render(<CycleWeek semana={semana} estilosTema={estilosTemaEscuro} />);

        const pontilhado = await medirContorno('2026-10-02-2026-10-04', 150);
        expect(pontilhado).toHaveProp('stroke', {
            type: 0,
            payload: processColor('#9E9C96')
        });
    });
});
