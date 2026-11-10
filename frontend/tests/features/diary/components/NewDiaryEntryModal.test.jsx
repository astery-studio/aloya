import { fireEvent, screen } from '@testing-library/react-native';

const mockUseDiaryCatalog = jest.fn();
const mockUseDiaryEntryForm = jest.fn();
jest.mock('../../../../src/features/diary/hooks/useDiaryCatalog', () => ({
    useDiaryCatalog: (...args) => mockUseDiaryCatalog(...args)
}));
jest.mock('../../../../src/features/diary/hooks/useDiaryEntryForm', () => ({
    useDiaryEntryForm: (...args) => mockUseDiaryEntryForm(...args)
}));
jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => ({
    BottomSheet: require('./newDiaryEntryModalDoubles').MockBottomSheet
}));
jest.mock(
    '../../../../src/features/diary/components/NewDiaryEntryModal/NewDiaryEntryContent',
    () => ({
        NewDiaryEntryContent: require('./newDiaryEntryModalDoubles').MockContent
    })
);

import { NewDiaryEntryModal } from '../../../../src/features/diary/components/NewDiaryEntryModal/NewDiaryEntryModal';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('liga o painel aos estados do catálogo e formulário', async () => {
    const catalogo = { versao: 2, macrocategorias: [] };
    const service = {};
    const onFechar = jest.fn();
    const onCriado = jest.fn();
    const onSessaoExpirada = jest.fn();
    mockUseDiaryCatalog.mockReturnValue({
        catalogo,
        carregando: false,
        erro: null,
        recarregar: jest.fn()
    });
    mockUseDiaryEntryForm.mockReturnValue({ salvando: false });

    await render(
        <NewDiaryEntryModal
            visivel
            service={service}
            onFechar={onFechar}
            onCriado={onCriado}
            onSessaoExpirada={onSessaoExpirada}
        />
    );

    expect(mockUseDiaryCatalog).toHaveBeenCalledWith({ ativo: true, service, onSessaoExpirada });
    const parametrosFormulario = mockUseDiaryEntryForm.mock.calls[0][0];
    expect(parametrosFormulario).toMatchObject({
        ativo: true,
        catalogo,
        service,
        onSessaoExpirada
    });
    parametrosFormulario.onCriado({ id: 1 });
    expect(onCriado).toHaveBeenCalledWith({ id: 1 });
    expect(onFechar).toHaveBeenCalledTimes(1);
    expect(screen.getByText('bloqueado:false;deslize:true')).toBeOnTheScreen();
    expect(screen.getByText('Catálogo:2')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Fechar painel'));
    expect(onFechar).toHaveBeenCalledTimes(2);
});
