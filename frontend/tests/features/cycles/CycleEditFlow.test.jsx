import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import {
    CycleEditFlow,
    converterCampoParaIso,
    formatarDataParaCampo,
    validarEdicao
} from '../../../src/features/cycles/CycleEditFlow';
import { renderWithTheme as render } from '../../helpers/renderWithTheme';

let mockSheet;
jest.mock('../../../src/features/cycles/components/CycleEditSheet/CycleEditSheet', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        CycleEditSheet: (props) => {
            mockSheet = props;
            const anterior = React.useRef(props.visivel);
            React.useEffect(() => {
                if (anterior.current && !props.visivel) props.onOcultar?.();
                anterior.current = props.visivel;
            }, [props]);
            return props.visivel ? React.createElement(View) : null;
        }
    };
});

jest.mock('../../../src/shared/components/feedback/Modal/SimpleModal', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return function Modal(props) {
        const { visivel, aoOcultar } = props;
        const visivelAnterior = React.useRef(visivel);

        React.useEffect(() => {
            if (visivelAnterior.current && !visivel) aoOcultar?.();
            visivelAnterior.current = visivel;
        }, [aoOcultar, visivel]);

        if (!visivel) return null;
        return React.createElement(
            View,
            null,
            React.createElement(Text, null, props.titulo),
            React.createElement(Text, null, props.mensagem),
            props.acaoPrincipal
                ? React.createElement(Pressable, {
                      accessibilityRole: 'button',
                      accessibilityLabel: props.acaoPrincipal.texto,
                      onPress: props.acaoPrincipal.aoPressionar
                  })
                : null,
            props.acaoSecundaria
                ? React.createElement(Pressable, {
                      accessibilityRole: 'button',
                      accessibilityLabel: props.acaoSecundaria.texto,
                      onPress: props.acaoSecundaria.aoPressionar
                  })
                : null,
            React.createElement(Pressable, {
                accessibilityRole: 'button',
                accessibilityLabel: `Fechar ${props.titulo}`,
                onPress: props.aoFechar
            })
        );
    };
});

test('converte e valida datas sem alterar o fuso', () => {
    expect(formatarDataParaCampo(null)).toBe('');
    expect(formatarDataParaCampo('2026-09-04')).toBe('04/09/2026');
    expect(converterCampoParaIso('04/09/2026')).toBe('2026-09-04');
    expect(converterCampoParaIso('', true)).toBeNull();
    expect(converterCampoParaIso('2026-09-04')).toBeUndefined();
    expect(converterCampoParaIso('31/02/2026')).toBeUndefined();
    expect(validarEdicao('31/02/2026', '')).toMatchObject({ titulo: 'Data incorreta' });
    expect(validarEdicao('01/01/2999', '')).toMatchObject({ titulo: 'Data no futuro' });
    expect(validarEdicao('10/09/2026', '09/09/2026')).toMatchObject({
        titulo: 'Data incorreta'
    });
});

const dias = ['2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24'];
const ciclo = { id: '3', dataInicio: dias[0], dataFim: dias.at(-1), dias };
async function alternar(data) {
    await act(() => mockSheet.onAlternarDia({ data }));
}

test('Concluir só ativa com seleção diferente e desativa ao restaurar dia 23', async () => {
    await render(<CycleEditFlow ciclo={ciclo} service={{ editar: jest.fn() }} />);
    expect(mockSheet.alterado).toBe(false);
    await alternar('2026-08-23');
    expect(mockSheet.alterado).toBe(true);
    const marcados = mockSheet.meses.flatMap((mes) => mes.diasMenstruacao.map((dia) => dia.data));
    expect(marcados).toEqual(['2026-08-21', '2026-08-22', '2026-08-24']);
    await alternar('2026-08-23');
    expect(mockSheet.alterado).toBe(false);
});

test('confirma e salva somente os dias selecionados sem fechar a lacuna', async () => {
    const editar = jest.fn().mockResolvedValue({});
    const atualizar = jest.fn().mockResolvedValue(true);
    const fechar = jest.fn();
    await render(
        <CycleEditFlow
            ciclo={ciclo}
            service={{ editar }}
            onAtualizado={atualizar}
            onFechar={fechar}
        />
    );
    await alternar('2026-08-23');
    await act(() => mockSheet.onSalvar());
    expect(screen.getByText('Atualizar ciclo')).toBeOnTheScreen();
    expect(editar).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
    expect(editar).toHaveBeenCalledWith('3', { dias: ['2026-08-21', '2026-08-22', '2026-08-24'] });
    expect(atualizar).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Ciclo atualizado com sucesso')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(fechar).toHaveBeenCalledTimes(1);
});

test('carrega dias efetivos ao reabrir e permite adicionar novamente o dia ausente', async () => {
    const buscar = jest
        .fn()
        .mockResolvedValue({ ...ciclo, dias: ['2026-08-21', '2026-08-22', '2026-08-24'] });
    const editar = jest.fn().mockResolvedValue({});
    await render(<CycleEditFlow ciclo={ciclo} service={{ buscar, editar }} />);
    await waitFor(() => expect(mockSheet.carregando).toBe(false));
    expect(mockSheet.alterado).toBe(false);
    await alternar('2026-08-23');
    expect(mockSheet.alterado).toBe(true);
    await act(() => mockSheet.onSalvar());
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
    expect(editar).toHaveBeenCalledWith('3', { dias });
});

test('avisa ao descartar e permite voltar à seleção sem perder alterações', async () => {
    const fechar = jest.fn();
    await render(<CycleEditFlow ciclo={ciclo} service={{ editar: jest.fn() }} onFechar={fechar} />);
    await alternar('2026-08-23');
    await act(() => mockSheet.onFechar());
    expect(screen.getByText('Dados não salvos')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar a editar' }));
    expect(mockSheet.visivel).toBe(true);
    expect(mockSheet.alterado).toBe(true);
    await act(() => mockSheet.onFechar());
    await fireEvent.press(screen.getByRole('button', { name: 'Sair sem salvar' }));
    expect(fechar).toHaveBeenCalledTimes(1);
});

test('falha mantém seleção e permite retentativa; conflito usa OK sem repetir gravação', async () => {
    const editar = jest
        .fn()
        .mockRejectedValueOnce(new Error('interno'))
        .mockRejectedValueOnce({
            codigo: 'SOBREPOSICAO_CICLO',
            detalhes: { dataInicio: '2026-08-01', dataFim: '2026-08-04' }
        });
    await render(<CycleEditFlow ciclo={ciclo} service={{ editar }} />);
    await alternar('2026-08-23');
    await act(() => mockSheet.onSalvar());
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
    expect(screen.getByText('Algo deu errado')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByText('Ciclo existente')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(mockSheet.alterado).toBe(true);
    expect(editar).toHaveBeenCalledTimes(2);
});

test('seleção vazia pede confirmação para excluir o ciclo', async () => {
    const editar = jest.fn().mockResolvedValue(null);
    await render(<CycleEditFlow ciclo={ciclo} service={{ editar }} />);
    for (const data of dias) await alternar(data);
    await act(() => mockSheet.onSalvar());
    expect(screen.getByText('Apagar ciclo')).toBeOnTheScreen();
    expect(editar).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Apagar' }));
    expect(editar).toHaveBeenCalledWith('3', { dias: [] });
    expect(screen.getByText('Ciclo excluído com sucesso')).toBeOnTheScreen();
});

test('data futura mostra aviso e não modifica a seleção', async () => {
    await render(<CycleEditFlow ciclo={ciclo} service={{ editar: jest.fn() }} />);
    await alternar('2999-01-01');
    expect(screen.getByText('Data no futuro')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(mockSheet.alterado).toBe(false);
});

test('não inicia confirmação nem gravação sem mudança, inclusive após desfazer uma inclusão', async () => {
    const editar = jest.fn();
    await render(<CycleEditFlow ciclo={ciclo} service={{ editar }} />);
    await act(() => mockSheet.onSalvar());
    expect(screen.queryByText('Atualizar ciclo')).toBeNull();
    await alternar('2026-08-25');
    expect(mockSheet.alterado).toBe(true);
    await alternar('2026-08-25');
    expect(mockSheet.alterado).toBe(false);
    await act(() => mockSheet.onSalvar());
    expect(screen.queryByText('Atualizar ciclo')).toBeNull();
    expect(editar).not.toHaveBeenCalled();
});

test('data distante é mantida e avisa sobre o novo ciclo antes de salvar', async () => {
    const editar = jest.fn().mockResolvedValue({});
    await render(<CycleEditFlow ciclo={ciclo} service={{ editar }} />);
    await alternar('2026-08-28');
    expect(screen.getByText('Novo ciclo na seleção')).toBeOnTheScreen();
    expect(screen.getByText(/A seleção foi mantida/)).toBeOnTheScreen();
    expect(editar).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(mockSheet.visivel).toBe(true);
    expect(mockSheet.meses.flatMap((mes) => mes.diasMenstruacao.map((dia) => dia.data))).toContain(
        '2026-08-28'
    );
    await act(() => mockSheet.onSalvar());
    expect(screen.getByText(/salva em 2 ciclos separados/)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
    expect(editar).toHaveBeenCalledWith('3', { dias: [...dias, '2026-08-28'] });
});

test('retirar dias criando três dias de pausa também informa a separação', async () => {
    const registro = { ...ciclo, dataFim: '2026-08-25', dias: [...dias, '2026-08-25'] };
    await render(<CycleEditFlow ciclo={registro} service={{ editar: jest.fn() }} />);
    await alternar('2026-08-22');
    await alternar('2026-08-23');
    expect(screen.queryByText('Novo ciclo na seleção')).toBeNull();
    await alternar('2026-08-24');
    expect(screen.getByText('Novo ciclo na seleção')).toBeOnTheScreen();
});
