import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { DiaryMacrocategoryAccordion } from '../../../../src/features/diary/components/DiaryMacrocategoryAccordion/DiaryMacrocategoryAccordion';
import { DiaryOverviewCard } from '../../../../src/features/diary/components/DiaryOverviewCard/DiaryOverviewCard';
import { DiaryPhaseFilterOption } from '../../../../src/features/diary/components/DiaryFiltersSheet/DiaryPhaseFilterOption';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

const estilos = {
    opcaoFase: {},
    pressionado: {},
    identificacaoFase: {},
    iconeFase: {},
    nomeFase: {}
};

function IconeTeste({ color }) {
    return <Text testID="icone-macro" style={{ color }}>Ícone</Text>;
}

describe('acessibilidade e apresentação do Diário nos temas', () => {
    test.each(['claro', 'escuro'])('resumo mantém rótulo acessível no tema %s', async (preferencia) => {
        await renderWithTheme(
            <DiaryOverviewCard
                fase="folicular"
                tituloFase="Fase Folicular"
                descricao="Você costuma registrar mais energia."
                diasRegistrados={3}
            />,
            { preferencia }
        );

        expect(
            screen.getByLabelText('Fase Folicular. Você costuma registrar mais energia. 3 dias registrados.')
        ).toBeOnTheScreen();
    });

    test.each(['claro', 'escuro'])('filtro de fase expõe estado e rótulo no tema %s', async (preferencia) => {
        const aoAlterar = jest.fn();
        await renderWithTheme(
            <DiaryPhaseFilterOption fase="menstrual" ativo={false} aoAlterar={aoAlterar} estilos={estilos} />,
            { preferencia }
        );

        const controle = screen.getByRole('switch', { name: 'Filtrar por Fase Menstrual' });
        expect(controle).toHaveProp('accessibilityState', { checked: false, disabled: false });
        await fireEvent.press(screen.getByText('Fase Menstrual'));
        await fireEvent.press(controle);
        expect(aoAlterar).toHaveBeenNthCalledWith(1, true);
        expect(aoAlterar).toHaveBeenNthCalledWith(2, true);
    });

    test.each(['claro', 'escuro'])('acordeão comunica expansão e indisponibilidade no tema %s', async (preferencia) => {
        const aoAlternar = jest.fn();
        const resultado = await renderWithTheme(
            <DiaryMacrocategoryAccordion
                titulo="Corpo e Sintomas"
                icone={IconeTeste}
                expandido={false}
                aoAlternar={aoAlternar}
            >
                <Text>Conteúdo da categoria</Text>
            </DiaryMacrocategoryAccordion>,
            { preferencia }
        );

        const botao = screen.getByRole('button', { name: 'Expandir Corpo e Sintomas' });
        expect(botao).toHaveProp('accessibilityState', { expanded: false, disabled: false });
        await fireEvent.press(botao);
        expect(aoAlternar).toHaveBeenCalledTimes(1);

        await resultado.rerender(
            <DiaryMacrocategoryAccordion
                titulo="Corpo e Sintomas"
                icone={IconeTeste}
                expandido={false}
                desabilitado
                aoAlternar={aoAlternar}
            />
        );
        expect(screen.getByRole('button', { name: 'Expandir Corpo e Sintomas' })).toHaveProp(
            'accessibilityState',
            { expanded: false, disabled: true }
        );
    });
});
