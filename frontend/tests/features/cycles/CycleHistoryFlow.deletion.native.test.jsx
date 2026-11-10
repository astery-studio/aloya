import { act, fireEvent, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { renderWithTheme as render } from '../../helpers/renderWithTheme';
import { CycleHistoryFlow } from '../../../src/features/cycles/CycleHistoryFlow';

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
jest.mock('../../../src/features/cycles/CycleEditFlow', () => ({ CycleEditFlow: () => null }));
jest.mock('../../../src/features/cycles/hooks/useCycleHistory', () => ({
    useCycleHistory: () => ({ ciclos: [], tentarNovamente: async () => true })
}));
jest.mock('../../../src/features/cycles/screens/CycleHistoryScreen', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');
    return {
        CycleHistoryScreen: ({ aoExcluirCiclo }) =>
            React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Excluir ciclo do histórico',
                    onPress: () =>
                        aoExcluirCiclo({ id: 3, dataInicio: '2026-08-07', dataFim: '2026-08-11' })
                },
                React.createElement(Text, null, 'Excluir')
            )
    };
});

const original = Platform.OS;
afterEach(() => {
    Platform.OS = original;
});

test.each(['ios', 'android'])(
    'confirma, falha, repete e conclui com um único modal no %s',
    async (plataforma) => {
        Platform.OS = plataforma;
        const service = {
            excluirCiclo: jest
                .fn()
                .mockRejectedValueOnce(new Error('offline'))
                .mockResolvedValue({ cicloRemovido: true })
        };
        const tela = await render(<CycleHistoryFlow service={service} />);
        const modais = () => tela.container.queryAll((node) => node.type === 'NativeModal');
        const modal = modais()[0];
        expect(modal.props.visible).toBe(false);
        await fireEvent.press(screen.getByRole('button', { name: 'Excluir ciclo do histórico' }));
        expect(screen.getByText('Apagar ciclo')).toBeOnTheScreen();
        expect(screen.getByText(/07\/08\/2026 a 11\/08\/2026/)).toBeOnTheScreen();
        expect(modais()).toHaveLength(1);
        const identidade = modal.props.testID;
        await fireEvent.press(screen.getByRole('button', { name: 'Apagar' }));
        expect(screen.getByText('Algo deu errado')).toBeOnTheScreen();
        expect(modais()[0].props.testID).toBe(identidade);
        expect(modais()[0].props.visible).toBe(true);
        await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(screen.getByText('Ciclo excluído com sucesso')).toBeOnTheScreen();
        expect(modais()).toHaveLength(1);
        expect(modais()[0].props.testID).toBe(identidade);
        await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
        expect(modais()[0].props.visible).toBe(false);
        await act(() => modais()[0].props.onDismiss?.());
        expect(service.excluirCiclo).toHaveBeenCalledTimes(2);
    }
);
