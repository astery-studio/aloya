import { act, screen } from '@testing-library/react-native';

let mockOnCreated;

jest.mock('../../../../src/features/diary/hooks/useDiaryCatalog', () => ({
    useDiaryCatalog: () => ({
        catalogo: { macrocategorias: [] },
        carregando: false,
        erro: null,
        recarregar: jest.fn()
    })
}));
jest.mock('../../../../src/features/diary/hooks/useDiaryEntryForm', () => ({
    useDiaryEntryForm: (options) => {
        mockOnCreated = options.onCriado;
        return {
            data: '2026-10-08',
            valores: {},
            erros: {},
            salvando: false,
            alterarValor: jest.fn(),
            salvar: jest.fn(),
            erroSalvamento: null
        };
    }
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
    await render(<CycleDiaryCheckIn date="2026-10-08" service={{}} onOpenDiary={jest.fn()} />);

    expect(screen.getByText('Como você está hoje?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar check-in' })).toBeDisabled();

    await act(async () => mockOnCreated());
    expect(screen.getByText('Check-in registrado no Diário.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Adicionar detalhes' })).toBeEnabled();
});
