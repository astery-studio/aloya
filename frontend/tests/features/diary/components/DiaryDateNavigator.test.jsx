import { fireEvent, screen } from '@testing-library/react-native';

import { DiaryDateNavigator } from '../../../../src/features/diary/components/DiaryDateNavigator/DiaryDateNavigator';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

describe('DiaryDateNavigator', () => {
    test('exibe a data e executa todas as ações', async () => {
        const aoAnterior = jest.fn();
        const aoProximo = jest.fn();
        const aoAbrirSeletor = jest.fn();
        await render(
            <DiaryDateNavigator
                data="2026-11-09"
                aoAnterior={aoAnterior}
                aoProximo={aoProximo}
                aoAbrirSeletor={aoAbrirSeletor}
            />
        );
        expect(screen.getByText('09/11/2026')).toBeOnTheScreen();
        await fireEvent.press(screen.getByRole('button', { name: 'Dia anterior' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Próximo dia' }));
        await fireEvent.press(
            screen.getByRole('button', { name: 'Selecionar data. Atual: 09/11/2026' })
        );
        expect(aoAnterior).toHaveBeenCalledTimes(1);
        expect(aoProximo).toHaveBeenCalledTimes(1);
        expect(aoAbrirSeletor).toHaveBeenCalledTimes(1);
    });

    test('bloqueia limites e operação em andamento', async () => {
        const resultado = await render(
            <DiaryDateNavigator
                data="2026-11-09"
                aoAbrirSeletor={jest.fn()}
                anteriorDisponivel={false}
                proximoDisponivel={false}
            />
        );
        expect(screen.getByRole('button', { name: 'Dia anterior' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Próximo dia' })).toBeDisabled();

        await resultado.rerender(
            <DiaryDateNavigator data="2026-11-09" aoAbrirSeletor={jest.fn()} desabilitado />
        );
        expect(screen.getByRole('button', { name: /Selecionar data/ })).toBeDisabled();
    });

    test('suporta data inválida e visualização sem seletor', async () => {
        await render(<DiaryDateNavigator data="inválida" />);
        expect(screen.getByRole('button', { name: 'Selecionar data. Atual:' })).toBeDisabled();
    });
});
