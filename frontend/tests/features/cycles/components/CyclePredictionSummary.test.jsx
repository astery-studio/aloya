import { fireEvent, screen } from '@testing-library/react-native';
import { CyclePredictionSummary } from '../../../../src/features/cycles/components/home/CyclePredictionSummary';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('apresenta previsão e abre a explicação de confiabilidade', async () => {
    const aoAbrir = jest.fn();
    await render(
        <CyclePredictionSummary
            proximoInicio="2026-11-28"
            ovulacaoEstimada="2026-11-14"
            janelaFertil={{ inicio: '2026-11-10', fim: '2026-11-15' }}
            confiabilidade="media"
            estimativaIncerta
            aoAbrirConfiabilidade={aoAbrir}
            corDestaque="#2C4C3B"
        />
    );

    expect(screen.getByText('Estimativa incerta')).toBeOnTheScreen();
    expect(screen.getByText('Previsão')).toHaveStyle({ color: '#2C4C3B' });
    expect(screen.getByText('28')).toHaveStyle({
        fontSize: 50,
        lineHeight: 60,
        textAlignVertical: 'center'
    });
    expect(screen.getByText('novembro')).toHaveProp('numberOfLines', 1);
    expect(screen.getByText('novembro')).toHaveProp('adjustsFontSizeToFit', true);
    expect(screen.getByText('novembro')).toHaveProp('minimumFontScale', 0.5);
    expect(screen.getByText('novembro')).toHaveStyle({ flexShrink: 1, width: '100%' });
    expect(screen.getByText('10–15 de novembro')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Confiança média' }));
    expect(aoAbrir).toHaveBeenCalledTimes(1);
});

test('exibe o aviso educativo padrão sem alerta de incerteza', async () => {
    await render(<CyclePredictionSummary confiabilidade="alta" />);

    expect(screen.getByText('Previsão')).toHaveStyle({ color: '#C85A44' });
    expect(screen.getByText('Indisponível')).toBeOnTheScreen();
    expect(screen.getByText(/não deve ser usada como método contraceptivo/)).toBeOnTheScreen();
    expect(screen.queryByText('Estimativa incerta')).not.toBeOnTheScreen();
});
