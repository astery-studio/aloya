import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Animated, Platform } from 'react-native';

import { CycleEditFlow } from '../../../src/features/cycles/CycleEditFlow';
import { criarCycleHistoryService } from '../../../src/features/cycles/services/cycleHistoryService';

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
        await fireEvent.changeText(screen.getByLabelText('Data de término do ciclo'), '10/09/2026');
        await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));
        if (plataforma === 'ios') {
            expect(screen.queryByText('Atualizar ciclo')).toBeNull();
            await ocultarNoIos(resultado, sheet);
        }
        const confirmacao = modalVisivel(resultado).props.testID;
        expect(requisicao).not.toHaveBeenCalled();
        await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
        if (plataforma === 'ios') {
            expect(requisicao).not.toHaveBeenCalled();
            await ocultarNoIos(resultado, confirmacao);
        }
        await waitFor(() => expect(atualizar).toHaveBeenCalledTimes(1));
        expect(requisicao).toHaveBeenCalledTimes(1);
        expect(persistido.dataFim).toBe('2026-09-10');
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
    await fireEvent.changeText(screen.getByLabelText('Data de término do ciclo'), '10/09/2026');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));
    await ocultarNoIos(resultado, sheet);
    const confirmacao = modalVisivel(resultado).props.testID;
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByLabelText('Data de término do ciclo')).toBeNull();
    await ocultarNoIos(resultado, confirmacao);
    expect(screen.getByLabelText('Data de término do ciclo')).toHaveProp('value', '10/09/2026');
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
        await fireEvent.changeText(screen.getByLabelText('Data de término do ciclo'), '10/09/2026');
        await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));
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
