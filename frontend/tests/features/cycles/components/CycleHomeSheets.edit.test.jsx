import { fireEvent, screen } from '@testing-library/react-native';
import { CycleHomeSheets } from '../../../../src/features/cycles/components/sheets/CycleHomeSheets';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const mockUseDiaryCatalog = jest.fn();
const mockUseDiaryEntryForm = jest.fn();
const mockUseDiaryRecordForDate = jest.fn();

jest.mock('../../../../src/features/diary/hooks/useDiaryCatalog', () => ({
    useDiaryCatalog: (args) => mockUseDiaryCatalog(args)
}));
jest.mock('../../../../src/features/diary/hooks/useDiaryEntryForm', () => ({
    useDiaryEntryForm: (args) => mockUseDiaryEntryForm(args)
}));
jest.mock('../../../../src/features/cycles/hooks/useDiaryRecordForDate', () => ({
    useDiaryRecordForDate: (args) => mockUseDiaryRecordForDate(args)
}));
jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => ({
    BottomSheet: ({ children, visivel }) => (visivel ? children : null)
}));

test('adiciona a reflexão ao registro existente como edição', async () => {
    const registro = {
        id: 'registro-1',
        versao: 3,
        data: '2026-11-24',
        categorias: [{ id: 'digestao', opcoes: ['gases'] }]
    };
    const salvar = jest.fn();
    const aoFechar = jest.fn();
    const service = {};
    mockUseDiaryCatalog.mockReturnValue({ catalogo: { categorias: [] } });
    mockUseDiaryRecordForDate.mockReturnValue({ record: registro, loading: false });
    mockUseDiaryEntryForm.mockReturnValue({
        valores: { anotacao_livre: 'Preciso descansar' },
        erros: {},
        alterarValor: jest.fn(),
        salvar,
        salvando: false
    });

    await render(
        <CycleHomeSheets
            aberto="reflexao"
            data="2026-11-24"
            diaryService={service}
            aoFechar={aoFechar}
        />
    );

    expect(mockUseDiaryRecordForDate).toHaveBeenCalledWith(
        expect.objectContaining({ date: '2026-11-24', service })
    );
    expect(mockUseDiaryEntryForm).toHaveBeenCalledWith(
        expect.objectContaining({
            modo: 'editar',
            registroInicial: registro,
            onSalvo: aoFechar
        })
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar no Diário' }));
    expect(salvar).toHaveBeenCalledTimes(1);
});

test('encaminha a digitação da reflexão para o campo de anotação livre', async () => {
    const alterarValor = jest.fn();
    mockUseDiaryCatalog.mockReturnValue({ catalogo: { categorias: [] } });
    mockUseDiaryRecordForDate.mockReturnValue({ record: null, loading: false });
    mockUseDiaryEntryForm.mockReturnValue({ valores: {}, erros: {}, alterarValor });

    await render(<CycleHomeSheets aberto="reflexao" data="2026-11-24" diaryService={{}} />);
    await fireEvent.changeText(screen.getByPlaceholderText('Escreva livremente...'), 'Uma nota');

    expect(alterarValor).toHaveBeenCalledWith('anotacao_livre', 'Uma nota');
});
