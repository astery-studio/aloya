import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

jest.mock('phosphor-react-native', () => ({ CaretDown: () => null, CaretUp: () => null }));

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
        expect(cabecalho).toHaveProp('accessibilityState', { expanded: true, disabled: false });
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
                testID="categoria-registro"
            >
                <Text>Conteúdo íntimo</Text>
            </DiaryMacrocategorySection>
        );
        const cabecalho = screen.getByRole('button', { name: 'Vida Íntima e Social' });
        expect(screen.getByTestId('categoria-registro')).toHaveStyle({
            width: 311,
            maxWidth: '100%',
            minHeight: 60,
            borderWidth: 0.698,
            borderRadius: 12,
            backgroundColor: '#FFFFFF'
        });
        expect(screen.getByTestId('categoria-registro-cabecalho')).toHaveStyle({
            height: 60,
            paddingVertical: 10,
            paddingHorizontal: 12,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10
        });
        expect(cabecalho).toHaveStyle({ minHeight: 0, height: 40, gap: 10 });
        expect(cabecalho).toBeDisabled();
        expect(cabecalho).toHaveProp('accessibilityState', { expanded: false, disabled: true });
        expect(screen.queryByText('Conteúdo íntimo')).toBeNull();
        await fireEvent.press(cabecalho);
        expect(aoAlternar).not.toHaveBeenCalled();
    });

    test('usa a paleta padrão e apresenta o estado pressionado', async () => {
        await render(
            <DiaryMacrocategorySection
                titulo="Ciclo"
                icone={Icone}
                expandido
                aoAlternar={jest.fn()}
            >
                <Text>Conteúdo</Text>
            </DiaryMacrocategorySection>
        );
        const cabecalho = screen.getByRole('button', { name: 'Ciclo' });
        await fireEvent(cabecalho, 'pressIn');
        expect(screen.getByText('Conteúdo')).toBeOnTheScreen();
    });
});
