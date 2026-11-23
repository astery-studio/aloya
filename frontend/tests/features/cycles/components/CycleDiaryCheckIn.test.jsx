import { screen } from '@testing-library/react-native';

jest.mock('../../../../src/features/diary/hooks/useDiaryCatalog', () => ({
    useDiaryCatalog: () => ({
        catalogo: { macrocategorias: [] },
        carregando: false,
        erro: null,
        recarregar: jest.fn()
    })
}));
jest.mock('../../../../src/features/diary/hooks/useDiaryEntryForm', () => ({
    useDiaryEntryForm: () => ({
        data: '2026-10-08',
        valores: {},
        erros: {},
        salvando: false,
        alterarValor: jest.fn(),
        salvar: jest.fn(),
        erroSalvamento: null
    })
}));
jest.mock(
    '../../../../src/features/diary/components/DiaryMacrocategoryList/DiaryMacrocategoryList',
    () => ({
        DiaryMacrocategoryList: () => null
    })
);

import { CycleDiaryCheckIn } from '../../../../src/features/cycles/components/CycleDiaryCheckIn';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('usa o formulário real do Diário sem liberar registro vazio', async () => {
    await render(<CycleDiaryCheckIn date="2026-10-08" service={{}} />);

    expect(screen.getByText('Como você está hoje?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar check-in' })).toBeDisabled();
});
