import { screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertIntensitySelector } from '../../../../src/features/contraceptives/forms/AlertIntensitySelector';
import { UsageTimeSelector } from '../../../../src/features/contraceptives/forms/UsageTimeSelector';
import { ContraceptivesScreen } from '../../../../src/features/contraceptives/screens/ContraceptivesScreen';
import { EditContraceptiveScreen } from '../../../../src/features/contraceptives/screens/EditContraceptiveScreen';
import { NewContraceptiveScreen } from '../../../../src/features/contraceptives/screens/NewContraceptiveScreen';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

const metricas = {
    frame: { x: 0, y: 0, width: 393, height: 852 },
    insets: { top: 44, left: 12, right: 12, bottom: 34 }
};

const anticoncepcional = {
    id: '1', nome: 'Yaz', tipo: 'pilula', intensidadeAlerta: 'critico',
    programacao: { horarios: ['08:00'], frequenciaId: 'pilula_continuo' }
};

describe.each(['claro', 'escuro'])('áreas seguras de anticoncepcionais no tema %s', (preferencia) => {
    test.each([
        [NewContraceptiveScreen, {}, 'cadastro-anticoncepcional-area-segura', 'Salvar anticoncepcional'],
        [EditContraceptiveScreen, { anticoncepcional }, 'edicao-anticoncepcional-area-segura', 'Apagar medicação'],
        [ContraceptivesScreen, {}, 'lista-anticoncepcionais-area-segura', 'Cadastrar novo anticoncepcional'],
        [UsageTimeSelector, { horarios: [], permiteMultiplos: true, aberto: true }, 'horarios-anticoncepcional-area-segura', 'Confirmar horários'],
        [AlertIntensitySelector, { valor: 'critico', aberto: true }, 'intensidade-anticoncepcional-area-segura', 'Confirmar']
    ])('protege as quatro bordas e a ação de %s', async (Tela, props, testeId, acao) => {
        await renderWithTheme(
            <SafeAreaProvider initialMetrics={metricas}>
                <Tela {...props} />
            </SafeAreaProvider>,
            { preferencia }
        );

        const area = screen.getByTestId(testeId);
        expect(area).toHaveProp('edges', {
            top: 'additive', left: 'additive', right: 'additive', bottom: 'additive'
        });
        expect(area).toContainElement(screen.getByRole('button', { name: acao }));
    });

    test('mantém a área segura quando o registro para edição está indisponível', async () => {
        await renderWithTheme(<EditContraceptiveScreen />, { preferencia });
        const area = screen.getByTestId('edicao-anticoncepcional-area-segura');
        expect(area).toHaveProp('edges', {
            top: 'additive', left: 'additive', right: 'additive', bottom: 'additive'
        });
        expect(area).toContainElement(screen.getByRole('alert'));
    });
});
