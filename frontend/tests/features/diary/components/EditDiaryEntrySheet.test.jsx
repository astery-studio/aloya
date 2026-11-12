import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

const mockUseDiaryCatalog = jest.fn();
const mockUseDiaryEntryForm = jest.fn();
const mockUseDiaryPhase = jest.fn();

jest.mock('../../../../src/features/diary/hooks/useDiaryCatalog', () => ({
    useDiaryCatalog: (...args) => mockUseDiaryCatalog(...args)
}));
jest.mock('../../../../src/features/diary/hooks/useDiaryEntryForm', () => ({
    useDiaryEntryForm: (...args) => mockUseDiaryEntryForm(...args)
}));
jest.mock('../../../../src/features/diary/hooks/useDiaryPhase', () => ({
    useDiaryPhase: (...args) => mockUseDiaryPhase(...args)
}));
jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => ({
    BottomSheet: require('./diaryEntrySheetDoubles').MockBottomSheet
}));
jest.mock('../../../../src/features/diary/components/DiaryEntryForm/DiaryEntryFormContent', () => {
    const { Text } = require('react-native');
    return {
        DiaryEntryFormContent: ({ bloquearSalvarSemAlteracoes }) => (
            <Text>{`salvar-bloqueado:${bloquearSalvarSemAlteracoes}`}</Text>
        )
    };
});
jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => ({
    __esModule: true,
    default: require('./newDiaryEntrySheetIntegrationDoubles').MockSimpleModal
}));

import { EditDiaryEntrySheet } from '../../../../src/features/diary/components/EditDiaryEntrySheet/EditDiaryEntrySheet';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const registro = {
    id: 7,
    data: '2026-11-08',
    versao: 3,
    categorias: [{ id: 'pele', opcoes: [{ id: 'espinhas' }] }]
};

function configurarFormulario(sobrescritas = {}) {
    const formulario = {
        data: registro.data,
        valores: { pele: ['espinhas'] },
        erros: {},
        salvando: false,
        alterado: false,
        erroSalvamento: null,
        conflitoVersao: false,
        salvar: jest.fn(),
        limparErroSalvamento: jest.fn(),
        ...sobrescritas
    };
    mockUseDiaryCatalog.mockReturnValue({
        catalogo: { versao: 2, macrocategorias: [] },
        carregando: false,
        erro: null,
        recarregar: jest.fn()
    });
    mockUseDiaryEntryForm.mockReturnValue(formulario);
    mockUseDiaryPhase.mockReturnValue({ fase: 'folicular', carregando: false });
    return formulario;
}

test('mantém a edição em um sheet próprio e bloqueia salvar sem mudanças', async () => {
    configurarFormulario();
    const onFechar = jest.fn();
    await render(<EditDiaryEntrySheet visivel registro={registro} onFechar={onFechar} />);

    expect(mockUseDiaryEntryForm).toHaveBeenCalledWith(
        expect.objectContaining({
            ativo: true,
            modo: 'editar',
            registroInicial: registro
        })
    );
    expect(screen.getByText('salvar-bloqueado:true')).toBeOnTheScreen();
    expect(
        screen.getByText('Formulário de edição carregado com os valores existentes.')
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Fechar painel'));
    expect(onFechar).toHaveBeenCalledTimes(1);
});

test('confirma o descarte quando a edição possui mudanças', async () => {
    configurarFormulario({ alterado: true });
    const onFechar = jest.fn();
    await render(<EditDiaryEntrySheet visivel registro={registro} onFechar={onFechar} />);

    expect(screen.getByText('salvar-bloqueado:false')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Fechar painel'));
    expect(onFechar).not.toHaveBeenCalled();
    expect(screen.getByText('Dados não salvos')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Continuar a editar'));
    expect(screen.queryByText('Dados não salvos')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Fechar painel'));
    await fireEvent.press(screen.getByText('Sair sem salvar'));
    expect(onFechar).toHaveBeenCalledTimes(1);
});

test('recarrega um conflito de versão e anuncia a substituição do rascunho', async () => {
    const formulario = configurarFormulario({
        alterado: true,
        conflitoVersao: true,
        erroSalvamento: 'O registro possui uma versão mais recente.'
    });
    const aoRecarregarRegistro = jest.fn().mockResolvedValue(true);
    await render(
        <EditDiaryEntrySheet
            visivel
            registro={registro}
            aoRecarregarRegistro={aoRecarregarRegistro}
        />
    );

    expect(screen.getByText('Registro atualizado')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Recarregar dados'));
    await waitFor(() => expect(aoRecarregarRegistro).toHaveBeenCalledTimes(1));
    expect(formulario.limparErroSalvamento).toHaveBeenCalledTimes(1);
    expect(
        screen.getByText('Dados externos carregados. O rascunho anterior foi substituído.')
    ).toBeOnTheScreen();
});

test('salva pelo callback da edição e fecha somente depois da atualização externa', async () => {
    configurarFormulario({ alterado: true });
    const onSalvo = jest.fn().mockResolvedValue(undefined);
    const onFechar = jest.fn();
    await render(
        <EditDiaryEntrySheet visivel registro={registro} onSalvo={onSalvo} onFechar={onFechar} />
    );
    const parametros = mockUseDiaryEntryForm.mock.calls.at(-1)[0];
    await act(async () => parametros.onSalvo({ ...registro, versao: 4 }));
    expect(onSalvo).toHaveBeenCalledWith({ ...registro, versao: 4 });
    expect(onFechar).toHaveBeenCalledTimes(1);
});
