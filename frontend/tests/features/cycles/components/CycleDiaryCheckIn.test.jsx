import { act, fireEvent, screen } from '@testing-library/react-native';

let mockOnCreated;
let mockFormOptions;
let mockExistingRecord;
let mockCatalogState;
let mockFormState;

jest.mock('../../../../src/features/diary/hooks/useDiaryCatalog', () => ({
    useDiaryCatalog: () => ({
        catalogo: { macrocategorias: [] },
        carregando: false,
        erro: null,
        recarregar: jest.fn(),
        ...mockCatalogState
    })
}));
jest.mock('../../../../src/features/diary/hooks/useDiaryEntryForm', () => ({
    useDiaryEntryForm: (options) => {
        mockFormOptions = options;
        mockOnCreated = options.onCriado;
        return {
            data: '2026-10-08',
            valores: {},
            erros: {},
            salvando: false,
            alterarValor: jest.fn(),
            salvar: jest.fn(),
            erroSalvamento: null,
            ...mockFormState
        };
    }
}));
jest.mock('../../../../src/features/cycles/hooks/useDiaryRecordForDate', () => ({
    useDiaryRecordForDate: () => ({ record: mockExistingRecord, loading: false })
}));
jest.mock(
    '../../../../src/features/diary/components/DiaryMacrocategoryList/DiaryMacrocategoryList',
    () => ({
        DiaryMacrocategoryList: () => null
    })
);

import { CycleDiaryCheckIn } from '../../../../src/features/cycles/components/CycleDiaryCheckIn';
import { estilos } from '../../../../src/features/cycles/components/CycleDiaryCheckIn.styles';
import { estilos as estilosOpcoes } from '../../../../src/features/cycles/components/home/CompactDiaryOptions.styles';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

beforeEach(() => {
    mockExistingRecord = null;
    mockCatalogState = {};
    mockFormState = {};
});

test('usa o formulário real do Diário sem liberar registro vazio', async () => {
    await render(
        <CycleDiaryCheckIn
            date="2026-10-08"
            service={{}}
            onOpenDiary={jest.fn()}
            corDestaque="#4A758E"
        />
    );

    expect(screen.getByText('Como você está se sentindo hoje?')).toBeOnTheScreen();
    expect(screen.getByText('Check-in gentil')).toHaveStyle({ color: '#4A758E' });
    expect(screen.getByRole('button', { name: 'Salvar no Diário' })).toBeDisabled();
    expect(mockFormOptions.marcarCheckIn).toBe(true);
    expect(screen.getByRole('button', { name: 'Salvar no Diário' })).toHaveStyle({
        width: '100%',
        height: 36,
        minHeight: 36,
        maxHeight: 36,
        borderRadius: 10,
        paddingVertical: 0
    });
    expect(estilos.textoBotao).toMatchObject({
        fontSize: 13,
        lineHeight: 20,
        includeFontPadding: false
    });
    expect(estilos.rotulo).toMatchObject({ fontWeight: '700', includeFontPadding: false });
    expect(estilos.titulo).toMatchObject({ fontWeight: '400', includeFontPadding: false });
    expect(estilos.descricao).toMatchObject({ fontWeight: '400', includeFontPadding: false });
    expect(estilosOpcoes.titulo).toMatchObject({
        fontFamily: 'DMSans_700Bold',
        fontWeight: '700',
        fontSize: 10,
        lineHeight: 15,
        letterSpacing: 0.55,
        includeFontPadding: false
    });
    expect(estilosOpcoes.textoOpcao).toMatchObject({
        fontWeight: '600',
        fontSize: 11,
        lineHeight: 16,
        includeFontPadding: false
    });

    await act(async () => mockOnCreated());
    expect(
        screen.getByText('Você realizou seu check-in com sucesso. Verifique os detalhes no diário:')
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Diário' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Diário' })).toHaveStyle({
        width: '100%',
        height: 36,
        borderRadius: 10
    });
});

test('mantém o check-in concluído ao recarregar o registro persistido do dia', async () => {
    mockExistingRecord = {
        id: 9,
        data: '2026-10-08',
        versao: 2,
        checkInRealizado: true,
        categorias: []
    };

    await render(<CycleDiaryCheckIn date="2026-10-08" service={{}} onOpenDiary={jest.fn()} />);

    expect(
        screen.getByText('Você realizou seu check-in com sucesso. Verifique os detalhes no diário:')
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Salvar no Diário' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Diário' })).toBeEnabled();
});

test('permite complementar silenciosamente o registro já existente para a data', async () => {
    mockExistingRecord = { id: 9, data: '2026-10-08', versao: 2, categorias: [] };
    await render(<CycleDiaryCheckIn date="2026-10-08" service={{}} />);

    expect(mockFormOptions).toMatchObject({
        modo: 'editar',
        registroInicial: mockExistingRecord
    });
    expect(screen.queryByText(/Você realizou seu check-in com sucesso/)).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar no Diário' })).toBeDisabled();
});

test('não exibe o check-in quando o Diário está indisponível', async () => {
    await render(<CycleDiaryCheckIn date="2026-10-08" />);
    expect(screen.queryByText('Check-in gentil')).not.toBeOnTheScreen();
});

test('exibe carregamento e permite tentar de novo após erro do catálogo', async () => {
    const service = {};
    mockCatalogState = { catalogo: null, carregando: true };
    const { rerender } = await render(<CycleDiaryCheckIn date="2026-10-08" service={service} />);

    expect(screen.getByText('Carregando seu check-in...')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Salvar no Diário' })).not.toBeOnTheScreen();

    const recarregar = jest.fn();
    mockCatalogState = { catalogo: null, erro: 'Falha ao carregar o Diário', recarregar };
    await rerender(<CycleDiaryCheckIn date="2026-10-08" service={service} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar o Diário');
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(recarregar).toHaveBeenCalledTimes(1);
});

test('habilita a edição após alterar o dia e não repete itens registrados', async () => {
    const service = {};
    const salvar = jest.fn();
    const digestao = {
        id: 'digestao',
        tipoValor: 'opcoes',
        ativaEfetiva: true,
        opcoes: [
            { id: 'gases', nome: 'Gases' },
            { id: 'azia', nome: 'Azia' }
        ]
    };
    mockCatalogState = {
        catalogo: { macrocategorias: [{ ativa: true, categorias: [digestao] }] }
    };
    mockExistingRecord = {
        categorias: [
            { id: 'digestao', opcoes: [{ id: 'gases' }] },
            { id: 'anotacao_livre', texto: 'Uma anotação' }
        ]
    };
    mockFormState = { valores: { digestao: ['gases'] }, alterado: false, salvar };
    const checkIn = <CycleDiaryCheckIn date="2026-10-08" fase="lutea" service={service} />;
    const { rerender } = await render(checkIn, { preferencia: 'escuro' });

    expect(screen.queryByRole('button', { name: 'Gases' })).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Azia' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Salvar no Diário' })).toBeDisabled();

    mockFormState = {
        valores: { digestao: ['gases', 'azia'] },
        alterado: true,
        salvar,
        erroSalvamento: 'Falha ao salvar'
    };
    await rerender(<CycleDiaryCheckIn date="2026-10-08" fase="lutea" service={service} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao salvar');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar no Diário' }));
    expect(salvar).toHaveBeenCalledTimes(1);

    await act(() => mockFormOptions.onSalvo());
    expect(
        screen.getByText('Você realizou seu check-in com sucesso. Verifique os detalhes no diário:')
    ).toBeOnTheScreen();
});
