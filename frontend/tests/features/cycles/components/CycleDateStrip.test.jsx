import { fireEvent, render, screen } from '@testing-library/react-native';
import { CycleDateStrip } from '../../../../src/features/cycles/components/CycleDateStrip';

test('permite selecionar outra data da faixa', async () => {
    const aoSelecionarData = jest.fn();
    await render(<CycleDateStrip
        dias={[
            { data: '2026-10-04', dia: 4, semana: 'dom', fase: 'menstrual' },
            { data: '2026-10-05', dia: 5, semana: 'seg', fase: 'folicular' }
        ]}
        dataSelecionada="2026-10-05"
        aoSelecionarData={aoSelecionarData}
    />);

    fireEvent.press(screen.getByRole('button', { name: 'dom, dia 4' }));
    expect(aoSelecionarData).toHaveBeenCalledWith('2026-10-04');
    expect(screen.getByRole('button', { name: 'seg, dia 5' }).props.accessibilityState).toEqual({ selected: true });
});
