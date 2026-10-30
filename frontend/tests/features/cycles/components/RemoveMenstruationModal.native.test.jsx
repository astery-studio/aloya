import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Animated, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RemoveMenstruationModal } from '../../../../src/features/cycles/components/RemoveMenstruationModal';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

jest.mock('react-native', () => {
    const React = require('react');
    const rn = jest.requireActual('react-native');
    function NativeModal(props) {
        return React.createElement('NativeModal', props, props.visible ? props.children : null);
    }
    Object.defineProperty(rn, 'Modal', { configurable: true, get: () => NativeModal });
    return rn;
});

const ciclo = { id: 3, dataInicio: '2026-10-01', dataFim: '2026-10-03' };
const metrics = {
    frame: { x: 0, y: 0, width: 390, height: 844 },
    insets: { top: 0, left: 0, right: 0, bottom: 34 }
};
const contexto = (props) => (
    <SafeAreaProvider initialMetrics={metrics}>
        <ThemeProvider preferencia="claro" esquemaDoSistema="light">
            <RemoveMenstruationModal ciclo={ciclo} {...props} />
        </ThemeProvider>
    </SafeAreaProvider>
);
const modais = (tela) => tela.container.queryAll((node) => node.type === 'NativeModal');
const visiveis = (tela) => modais(tela).filter((node) => node.props.visible);
const original = Platform.OS;
beforeEach(() =>
    jest
        .spyOn(Animated, 'timing')
        .mockImplementation(() => ({ start: (callback) => callback?.({ finished: true }) }))
);
afterEach(() => {
    Platform.OS = original;
    jest.restoreAllMocks();
});

test.each(['ios', 'android'])(
    'aguarda fechar sheet para confirmar exclusão e permite cancelar no %s',
    async (plataforma) => {
        Platform.OS = plataforma;
        const excluir = jest.fn();
        const tela = await render(contexto({ visivel: true, onExcluirCiclo: excluir }));
        const sheet = visiveis(tela)[0];
        await act(() => sheet.props.onShow());
        await tela.rerender(
            contexto({ visivel: true, modo: 'cicloCompleto', onExcluirCiclo: excluir })
        );
        if (plataforma === 'ios') {
            expect(visiveis(tela)).toHaveLength(0);
            await act(() => sheet.props.onDismiss());
        }
        expect(visiveis(tela)).toHaveLength(1);
        expect(screen.getByText('Apagar ciclo')).toBeOnTheScreen();
        await fireEvent.press(screen.getByRole('button', { name: 'Apagar' }));
        expect(excluir).toHaveBeenCalledTimes(1);
        const feedback = visiveis(tela)[0];
        await tela.rerender(contexto({ visivel: true, modo: 'dia' }));
        if (plataforma === 'ios') {
            expect(visiveis(tela)).toHaveLength(0);
            await act(() => feedback.props.onDismiss());
        }
        expect(visiveis(tela)).toHaveLength(1);
        expect(screen.getByText('Remover Menstruação')).toBeOnTheScreen();
    }
);

test('sucesso após desmarcar todos os dias espera sheet fechar e libera a tela após OK no iOS', async () => {
    Platform.OS = 'ios';
    const fechar = jest.fn();
    const tela = await render(contexto({ visivel: true }));
    const sheet = visiveis(tela)[0];
    await act(() => sheet.props.onShow());
    await tela.rerender(
        contexto({ visivel: false, alerta: 'sucesso-excluir', onFecharAlerta: fechar })
    );
    expect(visiveis(tela)).toHaveLength(0);
    await act(() => sheet.props.onDismiss());
    expect(visiveis(tela)).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(fechar).toHaveBeenCalledTimes(1);
    const feedback = visiveis(tela)[0];
    await tela.rerender(contexto({ visivel: false }));
    await act(() => feedback.props.onDismiss());
    expect(visiveis(tela)).toHaveLength(0);
});
