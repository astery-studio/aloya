import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {
    RemoveMenstruationModal,
    obterPeriodo
} from '../../../../src/features/cycles/components/RemoveMenstruationModal';

jest.mock('../../../../src/features/calendar/components/CycleCalendar/CycleCalendar', () => ({
    CycleCalendar: ({ aoPressionarDia }) => {
        const { Pressable, Text } = require('react-native');
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dia de teste"
                onPress={() => aoPressionarDia?.({ registroCicloId: '3', data: '2026-10-04' })}
            >
                <Text>Dia teste</Text>
            </Pressable>
        );
    }
}));

test('não renderiza modal fechado e valida variante', async () => {
    const fechado = await render(<RemoveMenstruationModal modo="dia" visivel={false} />);
    expect(fechado.queryByText('Remover dia de menstruação')).toBeNull();
    await expect(render(<RemoveMenstruationModal modo="inválido" visivel />)).rejects.toThrow(
        TypeError
    );
});

test('modo de dia remove imediatamente quando selecionado e apresenta mensagens', async () => {
    const onRemoverDia = jest.fn();
    await render(
        <RemoveMenstruationModal
            modo="dia"
            visivel
            meses={[]}
            onRemoverDia={onRemoverDia}
            erro="Falhou"
            erroAtualizacao="Atualização"
            sucesso="Concluído"
        />
    );
    fireEvent.press(screen.getByLabelText('Dia de teste'));
    expect(onRemoverDia).toHaveBeenCalledWith({ registroCicloId: '3', data: '2026-10-04' });
    expect(screen.getByText('Remover dia de menstruação')).toBeTruthy();
    expect(screen.getByText('Falhou')).toBeTruthy();
    expect(screen.getByText('Atualização')).toBeTruthy();
    expect(screen.getByText('Concluído')).toBeTruthy();
});

test('bloqueia interação enquanto remove e permite fechar quando livre', async () => {
    const onRemoverDia = jest.fn();
    const onFechar = jest.fn();
    await render(
        <RemoveMenstruationModal
            modo="dia"
            visivel
            carregando
            onRemoverDia={onRemoverDia}
            onFechar={onFechar}
        />
    );
    fireEvent.press(screen.getByLabelText('Dia de teste'));
    fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onRemoverDia).not.toHaveBeenCalled();
    expect(onFechar).not.toHaveBeenCalled();
});

test('confirma exclusão completa, mostra período e bloqueia botão sem ciclo', async () => {
    const onExcluirCiclo = jest.fn();
    const ciclo = { id: '4', periodo: '10 Out até hoje' };
    await render(
        <RemoveMenstruationModal
            modo="cicloCompleto"
            visivel
            ciclo={ciclo}
            onExcluirCiclo={onExcluirCiclo}
            onFechar={() => {}}
        />
    );
    fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    expect(onExcluirCiclo).toHaveBeenCalledWith(ciclo);
    expect(screen.getByText(/10 Out até hoje/)).toBeTruthy();
    expect(screen.getByText(/não pode ser desfeita/)).toBeTruthy();
});

test('exibe confirmação carregando, período com data final e feedbacks de exclusão', async () => {
    await render(
        <RemoveMenstruationModal
            modo="cicloCompleto"
            visivel
            carregando
            ciclo={{ dataInicio: '2026-10-01', dataFim: '2026-10-05' }}
            erro="Erro"
            erroAtualizacao="Falha ao atualizar"
            sucesso="Excluído"
            onExcluirCiclo={() => {}}
            onFechar={() => {}}
        />
    );
    expect(screen.getByText('Excluindo...')).toBeTruthy();
    expect(screen.getByText(/2026-10-01 até 2026-10-05/)).toBeTruthy();
    expect(screen.getByText('Erro')).toBeTruthy();
    expect(screen.getByText('Falha ao atualizar')).toBeTruthy();
    expect(screen.getByText('Excluído')).toBeTruthy();
});

test('desabilita confirmação quando falta ciclo ou callback de exclusão', async () => {
    await render(
        <RemoveMenstruationModal
            modo="cicloCompleto"
            visivel
            onExcluirCiclo={jest.fn()}
            onFechar={() => {}}
        />
    );
    expect(screen.getByRole('button', { name: 'Excluir' }).props.accessibilityState.disabled).toBe(
        true
    );
});

test('formata período alternativo e fallback', () => {
    expect(obterPeriodo({ dataInicio: '2026-10-01' })).toContain('em andamento');
    expect(obterPeriodo({})).toBe('Período não informado');
});
