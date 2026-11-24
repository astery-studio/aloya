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
import { estilos } from '../../../../src/features/cycles/components/CycleDiaryCheckIn.styles';
import { estilos as estilosOpcoes } from '../../../../src/features/cycles/components/home/CompactDiaryOptions.styles';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

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
    expect(screen.getByText('Check-in registrado no Diário.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Adicionar detalhes' })).toBeEnabled();
});
