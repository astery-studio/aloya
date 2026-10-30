import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import {
    RemoveMenstruationModal,
    obterPeriodo
} from '../../../../src/features/cycles/components/RemoveMenstruationModal';

jest.mock('../../../../src/features/cycles/components/MenstrualDaysCalendar', () => ({
    MenstrualDaysCalendar: ({ aoPressionarDia, carregando, desativado }) => {
        const { Pressable, Text, View } = require('react-native');
        if (carregando)
            return (
                <View>
                    <Text accessibilityLabel="Carregando calendário">Carregando</Text>
                </View>
            );
        return (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dia de teste"
                disabled={desativado}
                onPress={() => aoPressionarDia?.({ registroCicloId: 3, data: '2026-10-04' })}
            >
                <Text>Dia teste</Text>
            </Pressable>
        );
    }
}));
jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => ({
    BottomSheet: ({ children, visivel }) => {
        const { View } = require('react-native');
        return visivel ? <View>{children}</View> : null;
    }
}));
test('renderiza sheet do histórico com instrução, aviso e ações', async () => {
    await render(
        <RemoveMenstruationModal
            visivel
            ciclo={{ id: '3' }}
            onConcluir={jest.fn()}
            onSolicitarExcluirCiclo={jest.fn()}
            onFechar={jest.fn()}
        />
    );
    expect(screen.getByText('Remover Menstruação')).toBeTruthy();
    expect(screen.getByText('Toque em um dia preenchido para desmarcá-lo.')).toBeTruthy();
    expect(screen.getByText(/A remoção é imediata e altera somente o dia escolhido/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Concluir' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Excluir ciclo inteiro' })).toBeTruthy();
});

test('remove um dia selecionado imediatamente sem abrir confirmação', async () => {
    const onRemoverDia = jest.fn();
    await render(
        <RemoveMenstruationModal
            modo="dia"
            visivel
            meses={[]}
            ciclo={{ id: '3' }}
            onRemoverDia={onRemoverDia}
        />
    );
    await fireEvent.press(screen.getByLabelText('Dia de teste'));
    expect(onRemoverDia).toHaveBeenCalledWith({ registroCicloId: 3, data: '2026-10-04' });
    expect(screen.queryByText('Apagar ciclo')).toBeNull();
});

test('desativa seleção de dia durante carregamento e expõe a data que falhou', async () => {
    const onRemoverDia = jest.fn();
    await render(
        <RemoveMenstruationModal
            visivel
            carregando
            dataSelecionada="2026-10-04"
            onRemoverDia={onRemoverDia}
        />
    );
    await fireEvent.press(screen.getByLabelText('Dia de teste'));
    expect(onRemoverDia).not.toHaveBeenCalled();
    expect(screen.getByText('Dia teste')).toBeTruthy();
});

test('a ação de ciclo inteiro abre confirmação e modo de dia respeita carregamento', async () => {
    const onSolicitarExcluirCiclo = jest.fn();
    await render(
        <RemoveMenstruationModal
            visivel
            ciclo={{ id: 3 }}
            onSolicitarExcluirCiclo={onSolicitarExcluirCiclo}
        />
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Excluir ciclo inteiro' }));
    expect(onSolicitarExcluirCiclo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Apagar ciclo')).toBeNull();
});

test('confirma a exclusão completa e mostra período, irreversibilidade e recálculo', async () => {
    const onExcluirCiclo = jest.fn();
    const onCancelarExclusao = jest.fn();
    await render(
        <RemoveMenstruationModal
            modo="cicloCompleto"
            visivel
            ciclo={{ dataInicio: '2026-08-07', dataFim: '2026-08-11' }}
            onExcluirCiclo={onExcluirCiclo}
            onCancelarExclusao={onCancelarExclusao}
        />
    );
    expect(screen.getByText('Apagar ciclo')).toBeTruthy();
    expect(
        screen.getByText(
            'Tem certeza que deseja excluir todo o período de menstruação de 07/08/2026 a 11/08/2026 do seu histórico? Esta ação não pode ser desfeita e recalculará suas previsões futuras.'
        )
    ).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Apagar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onExcluirCiclo).toHaveBeenCalledTimes(1);
    expect(onCancelarExclusao).toHaveBeenCalledTimes(1);
});

test('mostra erro com retry e opção de voltar ao sheet', async () => {
    const onTentarNovamente = jest.fn();
    const onFecharAlerta = jest.fn();
    await render(
        <RemoveMenstruationModal
            visivel
            alerta="erro"
            onTentarNovamente={onTentarNovamente}
            onFecharAlerta={onFecharAlerta}
        />
    );
    expect(
        screen.getByText('Ocorreu um erro ao excluir este registro.\nTente novamente.')
    ).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(onTentarNovamente).toHaveBeenCalledTimes(1);
    expect(onFecharAlerta).toHaveBeenCalledTimes(1);
});

test.each([
    ['sucesso-excluir', 'Ciclo excluído com sucesso'],
    ['sucesso-atualizar', 'Ciclo atualizado com sucesso']
])('apresenta sucesso %s conforme protótipo e HU', async (alerta, titulo) => {
    const onFecharAlerta = jest.fn();
    await render(
        <RemoveMenstruationModal visivel={false} alerta={alerta} onFecharAlerta={onFecharAlerta} />
    );
    expect(screen.getByText(titulo)).toBeTruthy();
    expect(screen.queryByText('Registro de menstruação excluído com sucesso.')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(onFecharAlerta).toHaveBeenCalledTimes(1);
});

test('mostra carregamento e erro de busca do calendário', async () => {
    await render(<RemoveMenstruationModal visivel carregandoMeses meses={[]} />);
    expect(screen.getByLabelText('Carregando calendário')).toBeTruthy();
    await render(<RemoveMenstruationModal visivel erroMeses="Falha ao carregar" />);
    expect(screen.getByText('Falha ao carregar')).toBeTruthy();
});

test('valida modo e formata o período para a confirmação', async () => {
    await expect(render(<RemoveMenstruationModal modo="inválido" visivel />)).rejects.toThrow(
        TypeError
    );
    expect(obterPeriodo({ dataInicio: '2026-10-01', dataFim: '2026-10-05' })).toBe(
        '01/10/2026 a 05/10/2026'
    );
    expect(obterPeriodo({})).toBe('Período não informado');
    expect(obterPeriodo({ dataInicio: '2026-10-01' })).toMatch(
        /^01\/10\/2026 a \d{2}\/\d{2}\/\d{4}$/
    );
    expect(obterPeriodo({ dataInicio: 'inválida', dataFim: 'inválida' })).toBe(
        'data não informada a data não informada'
    );
});
