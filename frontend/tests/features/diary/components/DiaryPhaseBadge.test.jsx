import { screen } from '@testing-library/react-native';

import { DiaryPhaseBadge } from '../../../../src/features/diary/components/DiaryPhaseBadge/DiaryPhaseBadge';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('exibe a fase com rótulo acessível', async () => {
    await render(<DiaryPhaseBadge fase="menstruacao" carregando={false} />);

    expect(screen.getByLabelText('Fase Menstrual')).toBeTruthy();
    expect(screen.getByText('Fase Menstrual')).toBeTruthy();
});

test('exibe o estado de carregamento sem inventar uma fase', async () => {
    await render(<DiaryPhaseBadge fase={null} carregando />);

    expect(screen.getByText('Identificando fase...')).toBeTruthy();
});

test('não ocupa espaço quando não há fase', async () => {
    await render(<DiaryPhaseBadge fase={null} carregando={false} />);

    expect(screen.queryByText('Identificando fase...')).toBeNull();
    expect(screen.queryByLabelText(/Fase/u)).toBeNull();
});

test('usa traço regular fora da fase menstrual', async () => {
    await render(<DiaryPhaseBadge fase="folicular" carregando={false} />);

    expect(screen.getByText('Fase Folicular')).toBeTruthy();
});
