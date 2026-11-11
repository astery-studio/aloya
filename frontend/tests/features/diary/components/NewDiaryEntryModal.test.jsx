import { act, fireEvent, screen } from '@testing-library/react-native';

const mockUseDiaryCatalog = jest.fn();
const mockUseDiaryEntryForm = jest.fn();
const mockUseDiaryPhase = jest.fn();
const mockSimpleModal = jest.fn(() => null);
jest.mock('../../../../src/features/diary/hooks/useDiaryCatalog', () => ({
    useDiaryCatalog: (...args) => mockUseDiaryCatalog(...args)
}));
jest.mock('../../../../src/features/diary/hooks/useDiaryEntryForm', () => ({
    useDiaryEntryForm: (...args) => mockUseDiaryEntryForm(...args)
}));
jest.mock('../../../../src/features/diary/hooks/useDiaryPhase', () => ({
    useDiaryPhase: (...args) => mockUseDiaryPhase(...args)
}));
jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => ({
    __esModule: true,
    default: (props) => mockSimpleModal(props)
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
    const calendarService = {};
    const onFechar = jest.fn();
    const onCriado = jest.fn();
    const onSessaoExpirada = jest.fn();
    mockUseDiaryCatalog.mockReturnValue({
        catalogo,
        carregando: false,
        erro: null,
        recarregar: jest.fn()
    });
    const salvar = jest.fn();
    const limparErroSalvamento = jest.fn();
    mockUseDiaryEntryForm.mockReturnValue({
        salvando: false,
        erroSalvamento: 'Falha ao salvar.',
        salvar,
        limparErroSalvamento
    });
    mockUseDiaryPhase.mockReturnValue({ fase: 'menstruacao', carregando: false });

    await render(
        <NewDiaryEntryModal
            visivel
            service={service}
            calendarService={calendarService}
            onFechar={onFechar}
            onCriado={onCriado}
            onSessaoExpirada={onSessaoExpirada}
        />
    );

    expect(mockUseDiaryCatalog).toHaveBeenCalledWith({ ativo: true, service, onSessaoExpirada });
    expect(mockUseDiaryPhase).toHaveBeenCalledWith({
        ativo: true,
        data: undefined,
        service: calendarService,
        onSessaoExpirada
    });
    const parametrosFormulario = mockUseDiaryEntryForm.mock.calls[0][0];
    expect(parametrosFormulario).toMatchObject({
        ativo: true,
        catalogo,
        service,
        onSessaoExpirada
    });
    await act(async () => parametrosFormulario.onCriado({ id: 1 }));
    const popups = mockSimpleModal.mock.calls.map(([props]) => props);
    const sucesso = popups.filter((props) => props.titulo === 'Registro salvo com sucesso.').at(-1);
    const erro = popups.find((props) => props.titulo === 'Algo deu errado');
    expect(sucesso.visivel).toBe(true);
    expect(erro).toMatchObject({ visivel: true, mensagem: 'Falha ao salvar.' });
    await act(async () => sucesso.acaoPrincipal.aoPressionar());
    expect(onCriado).toHaveBeenCalledWith({ id: 1 });
    expect(onFechar).toHaveBeenCalledTimes(1);
    expect(screen.getByText('bloqueado:false;deslize:true')).toBeOnTheScreen();
    expect(screen.getByText('Catálogo:2')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Fechar painel'));
    expect(onFechar).toHaveBeenCalledTimes(2);
});
