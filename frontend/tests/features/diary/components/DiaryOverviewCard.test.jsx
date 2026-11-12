import { screen } from '@testing-library/react-native';

import { DiaryOverviewCard } from '../../../../src/features/diary/components/DiaryOverviewCard/DiaryOverviewCard';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

describe('DiaryOverviewCard', () => {
    test('apresenta o resumo acessível retornado pela API', async () => {
        await render(
            <DiaryOverviewCard
                fase="folicular"
                tituloFase="Fase Folicular"
                descricao="Energia e disposição podem aumentar."
                diasRegistrados={4}
            />
        );

        expect(screen.getByText('RESUMO DO DIÁRIO')).toBeOnTheScreen();
        expect(screen.getByText('4 dias registrados')).toBeOnTheScreen();
        expect(screen.getByTestId('diary-overview-header')).toHaveStyle({
            paddingTop: 16,
            paddingHorizontal: 20,
            paddingBottom: 14,
            textAlign: 'center'
        });
        expect(screen.getByTestId('diary-overview-content')).toHaveStyle({
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'stretch'
        });
        expect(
            screen.getByTestId('diary-overview-icon', { includeHiddenElements: true })
        ).toHaveStyle({ padding: 10 });
        expect(screen.getByTestId('diary-overview-footer')).toHaveStyle({
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            borderTopWidth: 1,
            borderTopColor: '#E6E2D8'
        });
        expect(
            screen.getByLabelText(
                'Fase Folicular. Energia e disposição podem aumentar. 4 dias registrados.'
            )
        ).toBeOnTheScreen();
    });

    test('trata singular, loading e resumo inválido', async () => {
        const resultado = await render(
            <DiaryOverviewCard
                fase="menstrual"
                tituloFase="Fase Menstrual"
                descricao="Período menstrual."
                diasRegistrados={1}
            />
        );
        expect(screen.getByText('1 dia registrado')).toBeOnTheScreen();

        await resultado.rerender(
            <DiaryOverviewCard
                fase="menstrual"
                tituloFase="Fase Menstrual"
                descricao="Período menstrual."
                diasRegistrados={1}
                contagemParcial
            />
        );
        expect(screen.getByText('1+ dias registrados')).toBeOnTheScreen();

        await resultado.rerender(<DiaryOverviewCard carregando />);
        expect(screen.getByTestId('diary-overview-loading')).toBeOnTheScreen();

        await resultado.rerender(
            <DiaryOverviewCard
                fase="desconhecida"
                tituloFase="Fase"
                descricao="Descrição"
                diasRegistrados={-1}
            />
        );
        expect(screen.queryByTestId('diary-overview-card')).not.toBeOnTheScreen();
    });
});
