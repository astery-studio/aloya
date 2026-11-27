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
            screen.getByTestId('diary-phase-icon-folicular', { includeHiddenElements: true })
        ).toHaveProp('color', '#567062');
        expect(screen.getByTestId('diary-overview-title')).toHaveStyle({ color: '#2C4C3B' });
        expect(screen.getByTestId('diary-overview-phase')).toHaveStyle({
            color: '#2C4C3B',
            fontWeight: '700'
        });
        expect(screen.getByText('Energia e disposição podem aumentar.')).toHaveStyle({
            color: '#5C5C59',
            fontSize: 10,
            fontWeight: '400',
            lineHeight: 22.5
        });
        expect(screen.getByTestId('diary-overview-day-counter')).toHaveStyle({
            width: 266.59,
            height: 26,
            paddingHorizontal: 14,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            borderRadius: 100,
            backgroundColor: 'rgba(44, 76, 59, 0.20)'
        });
        expect(screen.getByText('4 dias registrados')).toHaveStyle({
            color: 'rgba(44, 76, 59, 0.80)',
            fontSize: 10,
            fontWeight: '600',
            lineHeight: 19.5,
            textAlign: 'center'
        });
        expect(
            screen.getByLabelText(
                'Fase Folicular. Energia e disposição podem aumentar. 4 dias registrados.'
            )
        ).toBeOnTheScreen();
    });

    test.each([
        ['menstrual', '#C85A44', '#C85A44', 'rgba(200, 90, 68, 0.80)', 'rgba(200, 90, 68, 0.20)'],
        ['lutea', '#D68C3A', '#D68C3A', 'rgba(214, 140, 58, 0.80)', 'rgba(214, 140, 58, 0.20)'],
        ['ovulatoria', '#4A758E', '#4A758E', 'rgba(74, 117, 142, 0.80)', 'rgba(74, 117, 142, 0.20)']
    ])(
        'aplica a identidade visual do resumo para a fase %s',
        async (fase, corIcone, corTexto, corTextoContador, corFundo) => {
            await render(
                <DiaryOverviewCard
                    fase={fase}
                    tituloFase="Fase atual"
                    descricao="Descrição da fase."
                    diasRegistrados={2}
                />
            );

            expect(
                screen.getByTestId(`diary-phase-icon-${fase}`, {
                    includeHiddenElements: true
                })
            ).toHaveProp('color', corIcone);
            expect(screen.getByTestId('diary-overview-title')).toHaveStyle({ color: corTexto });
            expect(screen.getByTestId('diary-overview-day-counter')).toHaveStyle({
                backgroundColor: corFundo
            });
            expect(screen.getByText('2 dias registrados')).toHaveStyle({
                color: corTextoContador
            });
        }
    );

    test('usa a paleta noturna da fase sem alterar a opacidade do contador', async () => {
        await render(
            <DiaryOverviewCard
                fase="menstrual"
                tituloFase="Fase Menstrual"
                descricao="Descrição da fase."
                diasRegistrados={2}
            />,
            { preferencia: 'escuro' }
        );

        expect(screen.getByTestId('diary-overview-card')).toHaveStyle({
            borderColor: 'rgba(255, 255, 255, 0.08)',
            backgroundColor: '#1E1E1E'
        });
        expect(screen.getByTestId('diary-overview-title')).toHaveStyle({ color: '#C26E5F' });
        expect(screen.getByText('2 dias registrados')).toHaveStyle({
            color: 'rgba(194, 110, 95, 0.80)'
        });
    });

    test('identifica a pessoa acompanhada e remove a fase quando a autorização muda', async () => {
        const resumo = {
            nomeTitular: 'Júlia',
            fase: 'folicular',
            tituloFase: 'Fase Folicular',
            descricao: 'Júlia costuma registrar aumento de energia.',
            diasRegistrados: 4
        };
        const { rerender } = await render(<DiaryOverviewCard {...resumo} exibirFase />);

        expect(screen.getByText('RESUMO DO DIÁRIO DE JÚLIA')).toBeOnTheScreen();
        expect(screen.getByText(/Júlia está na/)).toBeOnTheScreen();
        expect(screen.getByText(resumo.descricao)).toBeOnTheScreen();

        await rerender(<DiaryOverviewCard {...resumo} />);

        expect(screen.queryByTestId('diary-overview-content')).not.toBeOnTheScreen();
        expect(screen.queryByText(resumo.descricao)).not.toBeOnTheScreen();
        expect(screen.getByText('4 dias registrados')).toBeOnTheScreen();
        expect(
            screen.getByLabelText('Resumo do Diário de Júlia. 4 dias registrados.')
        ).toBeOnTheScreen();
        expect(screen.getByTestId('diary-overview-day-counter')).toHaveStyle({
            backgroundColor: '#E6E2D8'
        });
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
        expect(
            screen.getByTestId('diary-phase-icon-menstrual', {
                includeHiddenElements: true
            })
        ).toBeOnTheScreen();

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
