import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Animated, Platform } from 'react-native';

import { CycleEditFlow } from '../../../src/features/cycles/CycleEditFlow';
import { criarCycleHistoryService } from '../../../src/features/cycles/services/cycleHistoryService';
import { renderWithTheme as render } from '../../helpers/renderWithTheme';

// Simula apenas a apresentação nativa: o fechamento no iOS é assíncrono.
// Sheet, modais, campos e serviço de edição continuam sendo os componentes reais.
jest.mock('react-native', () => {
    const React = require('react');
    const rn = jest.requireActual('react-native');
    function NativeModal(props) {
        const id = React.useId();
        return React.createElement(
            'NativeModal',
            { ...props, testID: id },
            props.visible ? props.children : null
        );
    }
    Object.defineProperty(rn, 'Modal', { configurable: true, get: () => NativeModal });
    return rn;
});

const plataformaOriginal = Platform.OS;

beforeEach(() => {
    jest.spyOn(Animated, 'timing').mockImplementation(() => ({
        start: (callback) => callback?.({ finished: true }),
        stop: jest.fn()
    }));
});

afterEach(() => {
    Platform.OS = plataformaOriginal;
    jest.restoreAllMocks();
});

function modais(resultado) {
    return resultado.container.queryAll((elemento) => elemento.type === 'NativeModal');
}

function modalVisivel(resultado) {
    const visiveis = modais(resultado).filter((elemento) => elemento.props.visible);
    expect(visiveis).toHaveLength(1);
    return visiveis[0];
}

async function ocultarNoIos(resultado, testID) {
    const modal = modais(resultado).find((elemento) => elemento.props.testID === testID);
    expect(modal).toBeDefined();
    expect(modal.props.visible).toBe(false);
    await act(() => modal.props.onDismiss?.());
}

test.each(['ios', 'android'])(
    'salva e atualiza somente depois de fechar a confirmação no %s',
    async (plataforma) => {
        Platform.OS = plataforma;
        let persistido = { id: 3, dataInicio: '2026-09-04', dataFim: '2026-09-08' };
        const requisicao = jest.fn(async ({ metodo, corpo }) => {
            if (!metodo || metodo === 'GET') return { ciclo: persistido };
            expect(metodo).toBe('PATCH');
            persistido = { ...persistido, ...corpo };
            return {
                mensagem: 'Registro de menstruação atualizado com sucesso.',
                ciclo: persistido
            };
        });
        const atualizar = jest.fn(async () => true);
        const resultado = await render(
            <CycleEditFlow
                ciclo={persistido}
                service={criarCycleHistoryService({ requisicaoAutenticada: requisicao })}
                onAtualizado={atualizar}
            />
        );
        const sheet = modalVisivel(resultado).props.testID;
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Marcar dia 2026-09-10' })).toBeEnabled()
        );
        await fireEvent.press(screen.getByRole('button', { name: 'Marcar dia 2026-09-10' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Concluir' }));
        if (plataforma === 'ios') {
            expect(screen.queryByText('Atualizar ciclo')).toBeNull();
            await ocultarNoIos(resultado, sheet);
        }
        const confirmacao = modalVisivel(resultado).props.testID;
        expect(requisicao.mock.calls.filter(([pedido]) => pedido.metodo === 'PATCH')).toHaveLength(
            0
        );
        await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
        if (plataforma === 'ios') {
            expect(
                requisicao.mock.calls.filter(([pedido]) => pedido.metodo === 'PATCH')
            ).toHaveLength(0);
            await ocultarNoIos(resultado, confirmacao);
        }
        await waitFor(() => expect(atualizar).toHaveBeenCalledTimes(1));
        expect(requisicao.mock.calls.filter(([pedido]) => pedido.metodo === 'PATCH')).toHaveLength(
            1
        );
        expect(persistido.dias).toContain('2026-09-10');
        expect(persistido.dias).not.toContain('2026-09-09');
        expect(await screen.findByText('Ciclo atualizado com sucesso')).toBeOnTheScreen();
        modalVisivel(resultado);
    }
);

test('cancelar no iOS espera o fechamento e reabre a edição com os dados digitados', async () => {
    Platform.OS = 'ios';
    const editar = jest.fn();
    const resultado = await render(
        <CycleEditFlow
            ciclo={{ id: 3, dataInicio: '2026-09-04', dataFim: null }}
            service={{ editar }}
        />
    );
    const sheet = modalVisivel(resultado).props.testID;
    await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Marcar dia 2026-09-05' })).toBeEnabled()
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Marcar dia 2026-09-05' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Concluir' }));
    await ocultarNoIos(resultado, sheet);
    const confirmacao = modalVisivel(resultado).props.testID;
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('Editar Menstruação')).toBeNull();
    await ocultarNoIos(resultado, confirmacao);
    expect(screen.getByRole('button', { name: 'Desmarcar dia 2026-09-05' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Concluir' })).toBeEnabled();
    expect(editar).not.toHaveBeenCalled();
    modalVisivel(resultado);
});

test.each(['retorno falso', 'exceção'])(
    'falha de atualização (%s) permite recarregar sem salvar novamente no iOS',
    async (modo) => {
        Platform.OS = 'ios';
        const editar = jest.fn().mockResolvedValue({});
        const atualizar = jest.fn().mockResolvedValueOnce(true);
        if (modo === 'retorno falso')
            atualizar.mockReset().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
        else
            atualizar
                .mockReset()
                .mockRejectedValueOnce(new Error('Sem conexão'))
                .mockResolvedValueOnce(true);
        const resultado = await render(
            <CycleEditFlow
                ciclo={{ id: 3, dataInicio: '2026-09-04', dataFim: null }}
                service={{ editar }}
                onAtualizado={atualizar}
            />
        );
        const sheet = modalVisivel(resultado).props.testID;
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Marcar dia 2026-09-05' })).toBeEnabled()
        );
        await fireEvent.press(screen.getByRole('button', { name: 'Marcar dia 2026-09-05' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Concluir' }));
        await ocultarNoIos(resultado, sheet);
        const confirmacao = modalVisivel(resultado).props.testID;
        await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
        await ocultarNoIos(resultado, confirmacao);
        expect(await screen.findByText('Registro salvo')).toBeOnTheScreen();
        const aviso = modalVisivel(resultado).props.testID;
        await fireEvent.press(screen.getByRole('button', { name: 'Tentar atualizar' }));
        expect(atualizar).toHaveBeenCalledTimes(1);
        await ocultarNoIos(resultado, aviso);
        expect(await screen.findByText('Ciclo atualizado com sucesso')).toBeOnTheScreen();
        expect(atualizar).toHaveBeenCalledTimes(2);
        expect(editar).toHaveBeenCalledTimes(1);
    }
);

test.each(['ios', 'android'])(
    'aviso de novos ciclos só aparece ao concluir e preserva seleção ao cancelar no %s',
    async (plataforma) => {
        Platform.OS = plataforma;
        const editar = jest.fn();
        const resultado = await render(
            <CycleEditFlow
                ciclo={{ id: 3, dataInicio: '2026-09-04', dataFim: '2026-09-08' }}
                service={{ editar }}
            />
        );
        const sheet = modalVisivel(resultado).props.testID;
        await fireEvent.press(screen.getByRole('button', { name: 'Marcar dia 2026-09-12' }));
        expect(screen.queryByText(/ciclos separados/)).toBeNull();
        expect(modalVisivel(resultado).props.testID).toBe(sheet);
        await fireEvent.press(screen.getByRole('button', { name: 'Concluir' }));
        if (plataforma === 'ios') {
            expect(screen.queryByText('Atualizar ciclo')).toBeNull();
            await ocultarNoIos(resultado, sheet);
        }
        expect(await screen.findByText('Atualizar ciclo')).toBeOnTheScreen();
        expect(screen.getByText(/salva em 2 ciclos separados/)).toBeOnTheScreen();
        const aviso = modalVisivel(resultado).props.testID;
        await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
        if (plataforma === 'ios') await ocultarNoIos(resultado, aviso);
        expect(screen.getByRole('button', { name: 'Desmarcar dia 2026-09-12' })).toBeOnTheScreen();
        expect(screen.getByRole('button', { name: 'Concluir' })).toBeEnabled();
        expect(editar).not.toHaveBeenCalled();
        modalVisivel(resultado);
    }
);

test.each(['ios', 'android'])(
    'confirma restauração em outro ciclo após dispensar o modal anterior no %s',
    async (plataforma) => {
        Platform.OS = plataforma;
        const editar = jest
            .fn()
            .mockRejectedValueOnce({
                codigo: 'CONFIRMAR_ALTERACAO_OUTROS_CICLOS',
                detalhes: [
                    {
                        cicloId: 4,
                        dataInicio: '2026-09-10',
                        dataFim: '2026-09-14',
                        dias: ['2026-09-12']
                    }
                ]
            })
            .mockResolvedValue({});
        const resultado = await render(
            <CycleEditFlow
                ciclo={{ id: 3, dataInicio: '2026-09-04', dataFim: '2026-09-08' }}
                service={{ editar }}
            />
        );
        const sheet = modalVisivel(resultado).props.testID;
        await fireEvent.press(screen.getByRole('button', { name: 'Marcar dia 2026-09-12' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Concluir' }));
        if (plataforma === 'ios') await ocultarNoIos(resultado, sheet);
        const confirmacao = modalVisivel(resultado).props.testID;
        await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
        if (plataforma === 'ios') {
            expect(editar).not.toHaveBeenCalled();
            await ocultarNoIos(resultado, confirmacao);
        }
        expect(await screen.findByText('Alterar outro ciclo')).toBeOnTheScreen();
        const outro = modalVisivel(resultado).props.testID;
        expect(editar).toHaveBeenCalledTimes(1);
        await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
        if (plataforma === 'ios') {
            expect(editar).toHaveBeenCalledTimes(1);
            await ocultarNoIos(resultado, outro);
        }
        expect(await screen.findByText('Ciclo atualizado com sucesso')).toBeOnTheScreen();
        expect(editar).toHaveBeenCalledTimes(2);
        expect(editar.mock.calls[1][1].confirmarOutrosCiclos).toBe(true);
        modalVisivel(resultado);
    }
);

test.each(['ios', 'android'])(
    'encerra edição após separar setembro de outubro e ignora fechamentos atrasados no %s',
    async (plataforma) => {
        Platform.OS = plataforma;
        const editar = jest
            .fn()
            .mockResolvedValue({ id: 3, dataInicio: '2026-09-06', dataFim: '2026-09-06' });
        const fechar = jest.fn();
        const resultado = await render(
            <CycleEditFlow
                ciclo={{ id: 3, dataInicio: '2026-10-25', dataFim: '2026-10-28' }}
                service={{ editar }}
                onFechar={fechar}
                onAtualizado={jest.fn().mockResolvedValue(true)}
            />
        );
        const sheet = modalVisivel(resultado).props.testID;
        await fireEvent.press(screen.getByRole('button', { name: 'Marcar dia 2026-09-06' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Concluir' }));
        if (plataforma === 'ios') await ocultarNoIos(resultado, sheet);
        expect(screen.getByText(/salva em 2 ciclos separados/)).toBeOnTheScreen();
        const confirmacao = modalVisivel(resultado).props.testID;
        const fecharConfirmacaoAtrasado = modalVisivel(resultado).props.onRequestClose;
        await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
        if (plataforma === 'ios') await ocultarNoIos(resultado, confirmacao);
        expect(await screen.findByText('Ciclo atualizado com sucesso')).toBeOnTheScreen();
        const sucesso = modalVisivel(resultado).props.testID;
        await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
        if (plataforma === 'ios') await ocultarNoIos(resultado, sucesso);
        await act(() => fecharConfirmacaoAtrasado?.());
        expect(fechar).toHaveBeenCalledTimes(1);
        expect(editar).toHaveBeenCalledTimes(1);
        expect(modais(resultado).filter((modal) => modal.props.visible)).toHaveLength(0);
        expect(screen.queryByText('Editar Menstruação')).toBeNull();
    }
);
