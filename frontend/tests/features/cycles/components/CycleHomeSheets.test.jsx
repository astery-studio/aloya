import { fireEvent, screen } from '@testing-library/react-native';
import { CycleConfidenceSheet } from '../../../../src/features/cycles/components/sheets/CycleConfidenceSheet';
import { CyclePhaseEducationSheet } from '../../../../src/features/cycles/components/sheets/CyclePhaseEducationSheet';
import { DiaryReflectionSheet } from '../../../../src/features/cycles/components/sheets/DiaryReflectionSheet';
import { GuidedBreathingSheet } from '../../../../src/features/cycles/components/sheets/GuidedBreathingSheet';
import { estilos as estilosRespiracao } from '../../../../src/features/cycles/components/sheets/GuidedBreathingSheet.styles';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => ({
    BottomSheet: ({ children, visivel }) => (visivel ? children : null)
}));

jest.mock('../../../../src/shared/layouts/BottomSheet/BottomSheetLayout', () => {
    const { Text, View } = require('react-native');
    return {
        BottomSheetLayout: ({ children, titulo }) => (
            <View>
                <Text accessibilityRole="header">{titulo}</Text>
                {children}
            </View>
        )
    };
});

test('explica o nível atual de confiabilidade', async () => {
    await render(<CycleConfidenceSheet visivel nivel="alta" aoFechar={jest.fn()} />);

    expect(screen.getByRole('header', { name: 'O que isso significa?' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Nível atual: alta')).toBeOnTheScreen();
    expect(screen.getByText(/dados suficientes e consistentes/)).toBeOnTheScreen();
});

test('permite consultar a explicação de outro nível de confiabilidade', async () => {
    await render(<CycleConfidenceSheet visivel nivel="baixa" aoFechar={jest.fn()} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Média' }));

    expect(screen.getByText('Confiabilidade média')).toBeOnTheScreen();
    expect(screen.getByText(/variações recentes podem alterar/)).toBeOnTheScreen();
    expect(screen.getByLabelText('Nível atual: média')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Média' })).toBeSelected();
});

test('apresenta a educação da fase em sheet próprio', async () => {
    await render(<CyclePhaseEducationSheet visivel fase="folicular" aoFechar={jest.fn()} />);

    expect(screen.getByRole('header', { name: 'Por que “folicular”?' })).toBeOnTheScreen();
    expect(screen.getByText(/pequenas estruturas nos ovários/)).toBeOnTheScreen();
});

test('habilita a reflexão preenchida e delega o salvamento', async () => {
    const aoSalvar = jest.fn();
    await render(
        <DiaryReflectionSheet
            visivel
            valor="Preciso descansar"
            aoAlterar={jest.fn()}
            aoSalvar={aoSalvar}
            aoFechar={jest.fn()}
        />
    );

    expect(
        screen.getByRole('header', { name: 'O que seu corpo está pedindo agora?' })
    ).toBeOnTheScreen();
    expect(screen.queryByText('17 / 5000')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar no Diário' }));
    expect(aoSalvar).toHaveBeenCalledTimes(1);
});

test('mantém instrução textual quando o movimento é reduzido', async () => {
    await render(<GuidedBreathingSheet visivel movimentoReduzido aoFechar={jest.fn()} />);

    expect(screen.getByRole('header', { name: 'Acompanhe o movimento' })).toBeOnTheScreen();
    expect(screen.getByText('Respire')).toBeOnTheScreen();
    expect(estilosRespiracao.painel).toMatchObject({ paddingTop: 8, paddingBottom: 48 });
    expect(estilosRespiracao.areaRespiracao).toMatchObject({ height: 153, paddingTop: 23 });
    expect(estilosRespiracao.circuloInterno).toMatchObject({
        width: 121.11,
        height: 121.11,
        boxShadow: '0px 16.7686px 37.2636px rgba(74, 117, 142, 0.24)'
    });
});
