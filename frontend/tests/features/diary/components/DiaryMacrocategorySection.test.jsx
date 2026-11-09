import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import DiaryMacrocategorySection from '../../../../src/features/diary/components/DiaryMacrocategorySection/DiaryMacrocategorySection';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const Icone = () => null;

describe('DiaryMacrocategorySection', () => {
    test('expõe expansão, conteúdo e ação do cabeçalho', async () => {
        const aoAlternar = jest.fn();
        await render(
            <DiaryMacrocategorySection
                titulo="Emocional"
                icone={Icone}
                paleta="emocional"
                expandido
                aoAlternar={aoAlternar}
                acessorioCabecalho={<Text>Acessório</Text>}
            >
                <Text>Conteúdo emocional</Text>
            </DiaryMacrocategorySection>
        );
        const cabecalho = screen.getByRole('button', { name: 'Emocional' });
        expect(cabecalho).toHaveAccessibilityState({ expanded: true, disabled: false });
        expect(screen.getByText('Conteúdo emocional')).toBeOnTheScreen();
        expect(screen.getByText('Acessório')).toBeOnTheScreen();
        await fireEvent.press(cabecalho);
        expect(aoAlternar).toHaveBeenCalledTimes(1);
    });

    test('recolhe o conteúdo e bloqueia interação', async () => {
        const aoAlternar = jest.fn();
        await render(
            <DiaryMacrocategorySection
                titulo="Vida Íntima e Social"
                icone={Icone}
                paleta="inexistente"
                expandido={false}
                aoAlternar={aoAlternar}
                desabilitado
            >
                <Text>Conteúdo íntimo</Text>
            </DiaryMacrocategorySection>
        );
        const cabecalho = screen.getByRole('button', { name: 'Vida Íntima e Social' });
        expect(cabecalho).toBeDisabled();
        expect(cabecalho).toHaveAccessibilityState({ expanded: false, disabled: true });
        expect(screen.queryByText('Conteúdo íntimo')).toBeNull();
        await fireEvent.press(cabecalho);
        expect(aoAlternar).not.toHaveBeenCalled();
    });
});
