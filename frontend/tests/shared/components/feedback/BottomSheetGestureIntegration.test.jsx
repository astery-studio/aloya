import { Animated, PanResponder, Text } from 'react-native';
import { act, screen } from '@testing-library/react-native';

import { BottomSheet } from '../../../../src/shared/components/feedback/BottomSheet/BottomSheet';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

describe('gesto integrado do BottomSheet', () => {
    let configuracoes;

    beforeEach(() => {
        configuracoes = [];
        jest.spyOn(PanResponder, 'create').mockImplementation((recebida) => {
            configuracoes.push(recebida);
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

        const painel = configuracoes[0];
        const alca = configuracoes[1];
        expect(painel.onMoveShouldSetPanResponder(null, { dx: 1, dy: 10 })).toBe(true);
        expect(painel.onMoveShouldSetPanResponderCapture(null, { dx: 1, dy: 10 })).toBe(true);
        expect(alca.onStartShouldSetPanResponder()).toBe(true);
        expect(alca.onStartShouldSetPanResponderCapture()).toBe(true);
        expect(alca.onMoveShouldSetPanResponder(null, { dx: 1, dy: 10 })).toBe(true);
        expect(painel.onPanResponderTerminationRequest()).toBe(false);
        expect(screen.getByTestId('bottom-sheet-area-arraste')).toBeOnTheScreen();
        await act(async () => painel.onPanResponderMove(null, { dy: -5 }));
        expect(setValue).toHaveBeenLastCalledWith(0);

        await resultado.rerender(
            <BottomSheet visivel permitirDeslizarParaFechar bloquearFechamento>
                <Text>Conteúdo</Text>
            </BottomSheet>
        );
        expect(configuracoes.at(-2).onMoveShouldSetPanResponder(null, { dx: 1, dy: 10 })).toBe(
            false
        );
        expect(configuracoes.at(-1).onMoveShouldSetPanResponder(null, { dx: 1, dy: 10 })).toBe(
            false
        );
        expect(configuracoes.at(-1).onStartShouldSetPanResponder()).toBe(false);
    });

    test('fecha por gesto suficiente e permite escape acessível', async () => {
        const onFechar = jest.fn();
        await render(
            <BottomSheet visivel permitirDeslizarParaFechar onFechar={onFechar}>
                <Text>Conteúdo</Text>
            </BottomSheet>
        );
        await act(async () => configuracoes[0].onPanResponderRelease(null, { dy: 48, vy: 0 }));
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

        expect(configuracoes[0].onMoveShouldSetPanResponderCapture(null, { dx: 0, dy: 20 })).toBe(
            false
        );
        expect(configuracoes[1].onMoveShouldSetPanResponderCapture(null, { dx: 0, dy: 20 })).toBe(
            true
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
        await act(async () => configuracoes[0].onPanResponderRelease(null, { dy: 20, vy: 0 }));
        await act(async () => configuracoes[0].onPanResponderTerminate());
        expect(spring).toHaveBeenCalledTimes(2);
        expect(iniciar).toHaveBeenCalledTimes(2);
    });

    test('só restaura um gesto completo quando o fechamento é interceptado', async () => {
        const iniciar = jest.fn();
        const spring = jest.spyOn(Animated, 'spring').mockReturnValue({ start: iniciar });
        const onFechar = jest.fn().mockReturnValue(false);
        await render(
            <BottomSheet visivel permitirDeslizarParaFechar onFechar={onFechar}>
                <Text>Conteúdo</Text>
            </BottomSheet>
        );

        await act(async () => configuracoes[0].onPanResponderRelease(null, { dy: 48, vy: 0 }));
        expect(onFechar).toHaveBeenCalledTimes(1);
        expect(spring).toHaveBeenCalledTimes(1);
        expect(iniciar).toHaveBeenCalledTimes(1);
    });
});
