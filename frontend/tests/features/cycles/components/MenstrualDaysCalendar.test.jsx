import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {
    MenstrualDaysCalendar,
    criarDiasDoMes
} from '../../../../src/features/cycles/components/MenstrualDaysCalendar';

const mes = {
    mes: '2026-08',
    diasMenstruacao: [
        { data: '2026-08-07', registroCicloId: 9 },
        { data: '2026-08-08', registroCicloId: 9 }
    ]
};

test('gera uma grade mensal alinhada ao dia da semana e marca apenas registros', () => {
    const dias = criarDiasDoMes(mes);
    expect(dias.slice(0, 6)).toEqual(Array(6).fill(null));
    expect(dias).toHaveLength(37);
    expect(dias[12]).toEqual({ dia: 7, data: '2026-08-07', marcado: true });
    expect(dias[13]).toEqual({ dia: 8, data: '2026-08-08', marcado: true });
    expect(criarDiasDoMes({ mes: '2024-02', diasMenstruacao: [] })).toHaveLength(33);
});

test('renderiza os dias menstruais como alvos de toque e deixa outros dias sem ação', async () => {
    const aoPressionarDia = jest.fn();
    await render(<MenstrualDaysCalendar meses={[mes]} aoPressionarDia={aoPressionarDia} />);

    expect(screen.getByText('Agosto')).toBeTruthy();
    expect(screen.getByText('2026')).toBeTruthy();
    expect(screen.getByText('DOM')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Desmarcar dia 7' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Desmarcar dia 6' })).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Desmarcar dia 7' }));
    expect(aoPressionarDia).toHaveBeenCalledWith({ data: '2026-08-07' });
});

test('desativa os dias enquanto uma remoção está em andamento', async () => {
    const aoPressionarDia = jest.fn();
    await render(
        <MenstrualDaysCalendar meses={[mes]} aoPressionarDia={aoPressionarDia} desativado />
    );

    expect(
        screen.getByRole('button', { name: 'Desmarcar dia 7' }).props.accessibilityState
    ).toEqual({
        disabled: true
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Desmarcar dia 7' }));
    expect(aoPressionarDia).not.toHaveBeenCalled();
});

test('mostra o carregamento no espaço do calendário', async () => {
    await render(<MenstrualDaysCalendar carregando />);
    expect(screen.getByLabelText('Carregando calendário')).toBeTruthy();
});
