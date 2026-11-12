import { Animated, PanResponder, Text } from 'react-native';
import { act, screen } from '@testing-library/react-native';

import { BottomSheet } from '../../../../src/shared/components/feedback/BottomSheet/BottomSheet';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

describe('gesto integrado do BottomSheet', () => {
    let configuracao;

    beforeEach(() => {
        jest.spyOn(PanResponder, 'create').mockImplementation((recebida) => {
            configuracao = recebida;
            return { panHandlers: {} };
        });
    });

    afterEach(() => jest.restoreAllMocks());

    test('habilita somente o arraste permitido e move o painel para baixo', async () => {
        const setValue = jest.spyOn(Animated.Value.prototype, 'setValue');
        const resultado = await render(
            <BottomSheet visivel permitirDeslizarParaFechar>
                <Text>Conteúdo</Text>
            </BottomSheet>
        );

        expect(configuracao.onMoveShouldSetPanResponder(null, { dx: 1, dy: 10 })).toBe(true);
        expect(configuracao.onMoveShouldSetPanResponderCapture(null, { dx: 1, dy: 10 })).toBe(true);
        expect(configuracao.onPanResponderTerminationRequest()).toBe(false);
        expect(screen.getByTestId('bottom-sheet-area-arraste')).toBeOnTheScreen();
        await act(async () => configuracao.onPanResponderMove(null, { dy: -5 }));
        expect(setValue).toHaveBeenLastCalledWith(0);

        await resultado.rerender(
            <BottomSheet visivel permitirDeslizarParaFechar bloquearFechamento>
                <Text>Conteúdo</Text>
            </BottomSheet>
        );
        expect(configuracao.onMoveShouldSetPanResponder(null, { dx: 1, dy: 10 })).toBe(false);
    });

    test('fecha por gesto suficiente e permite escape acessível', async () => {
        const onFechar = jest.fn();
        await render(
            <BottomSheet visivel permitirDeslizarParaFechar onFechar={onFechar}>
                <Text>Conteúdo</Text>
            </BottomSheet>
        );
        await act(async () => configuracao.onPanResponderRelease(null, { dy: 64, vy: 0 }));
        await act(async () =>
            screen.getByTestId('bottom-sheet-painel').props.onAccessibilityEscape()
        );
        expect(onFechar).toHaveBeenCalledTimes(2);
    });

    test('não captura a rolagem interna enquanto o conteúdo estiver fora do topo', async () => {
        const podeIniciarDeslize = jest.fn(() => false);
        await render(
            <BottomSheet visivel permitirDeslizarParaFechar podeIniciarDeslize={podeIniciarDeslize}>
                <Text>Conteúdo</Text>
            </BottomSheet>
        );

        expect(configuracao.onMoveShouldSetPanResponderCapture(null, { dx: 0, dy: 20 })).toBe(
            false
        );
        expect(podeIniciarDeslize).toHaveBeenCalled();
    });

    test('restaura a posição em gesto curto ou interrompido', async () => {
        const iniciar = jest.fn();
        const spring = jest.spyOn(Animated, 'spring').mockReturnValue({ start: iniciar });
        await render(
            <BottomSheet visivel permitirDeslizarParaFechar>
                <Text>Conteúdo</Text>
            </BottomSheet>
        );
        await act(async () => configuracao.onPanResponderRelease(null, { dy: 20, vy: 0 }));
        await act(async () => configuracao.onPanResponderTerminate());
        expect(spring).toHaveBeenCalledTimes(2);
        expect(iniciar).toHaveBeenCalledTimes(2);
    });
});
