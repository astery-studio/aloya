//Testa os modos de cadastro e edição e os modais do formulário de anticoncepcionais.
import { render, screen } from '@testing-library/react-native';
import { useContraceptiveForm } from '../../../../src/features/contraceptives/hooks/useContraceptiveForm';
import { ContraceptiveForm } from '../../../../src/features/contraceptives/forms/ContraceptiveForm';

const mockSimpleModal = jest.fn(() => null);
const mockEditFieldSheet = jest.fn(() => null);
const mockSelectorField = jest.fn(() => null);

jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => ({
    __esModule: true,
    default: (props) => mockSimpleModal(props)
}));

jest.mock('../../../../src/shared/components/feedback/EditFieldSheet/EditFieldSheet', () => ({
    EditFieldSheet: (props) => mockEditFieldSheet(props)
}));

jest.mock('../../../../src/features/contraceptives/hooks/useContraceptiveForm', () => ({
    useContraceptiveForm: jest.fn()
}));

jest.mock('../../../../src/features/contraceptives/forms/SelectorField', () => ({
    SelectorField: (props) => mockSelectorField(props)
}));

jest.mock('../../../../src/features/contraceptives/forms/AlertIntensitySelector', () => ({
    AlertIntensitySelector: () => null
}));

jest.mock('../../../../src/features/contraceptives/forms/ContraceptiveTypeSelector', () => ({
    ContraceptiveTypeSelector: () => null
}));

jest.mock('../../../../src/features/contraceptives/forms/ExpirationDateField', () => ({
    ExpirationDateField: () => null
}));

jest.mock('../../../../src/features/contraceptives/forms/FrequencySelector', () => ({
    FrequencySelector: () => null
}));

jest.mock('../../../../src/features/contraceptives/forms/UsageTimeSelector', () => ({
    UsageTimeSelector: () => null
}));

const anticoncepcional = {
    id: '7',
    nome: 'Mercilon',
    tipo: 'pilula',
    intensidadeAlerta: 'critico',
    dataValidade: null,
    programacao: {
        horarios: ['08:00'],
        frequenciaId: 'pilula_continuo',
        dataPrimeiroUso: '2026-09-25'
    }
};

const base = {
    dados: {
        id: null,
        nome: '',
        tipo: '',
        frequenciaId: '',
        horarios: [],
        intensidadeAlerta: '',
        dataValidade: '',
        dataPrimeiroUso: ''
    },
    painel: null,
    alerta: null,
    hoje: '2026-09-24',
    modoEdicao: false,
    podeEnviar: true,
    alterar: jest.fn(),
    enviar: jest.fn(),
    abrir: jest.fn(),
    fecharPainel: jest.fn(),
    fecharAlerta: jest.fn(),
    selecionarTipo: jest.fn(),
    selecionarFrequencia: jest.fn(),
    permiteMultiplos: false,
    exigePrimeiroUso: false
};

beforeEach(() => {
    jest.clearAllMocks();
});

test('mantém o botão e o campo de nome do cadastro', async () => {
    useContraceptiveForm.mockReturnValue(base);

    await render(
        <ContraceptiveForm
            onSubmit={jest.fn()}
        />
    );

    expect(
        screen.getByLabelText('Digite o nome')
    ).toHaveProp('maxLength', 120);

    expect(
        screen.getByRole('button', {
            name: 'Salvar anticoncepcional'
        })
    ).toBeEnabled();

    expect(mockEditFieldSheet).not.toHaveBeenCalled();
});

test('preenche o modo de edição e desativa o botão quando nada mudou', async () => {
    const onSubmit = jest.fn();

    useContraceptiveForm.mockReturnValue({
        ...base,
        dados: {
            ...base.dados,
            id: '7',
            nome: 'Mercilon',
            tipo: 'pilula',
            frequenciaId: 'pilula_continuo',
            horarios: ['08:00'],
            intensidadeAlerta: 'critico',
            dataPrimeiroUso: '2026-09-25'
        },
        modoEdicao: true,
        podeEnviar: false
    });

    await render(
        <ContraceptiveForm
            anticoncepcional={anticoncepcional}
            onSubmit={onSubmit}
        />
    );

    expect(useContraceptiveForm).toHaveBeenCalledWith(
        onSubmit,
        anticoncepcional
    );

    expect(
        screen.getByRole('button', {
            name: 'Atualizar anticoncepcional'
        })
    ).toBeDisabled();

    expect(mockSelectorField).toHaveBeenCalledWith(
        expect.objectContaining({
            label: 'Nome da Medicação',
            valor: 'Mercilon',
            placeholder: 'Digite o nome'
        })
    );

    expect(mockEditFieldSheet).toHaveBeenCalledWith(
        expect.objectContaining({
            visivel: false,
            titulo: 'Editar nome do anticoncepcional',
            tipo: 'nome',
            valor: 'Mercilon'
        })
    );
});

test('ativa o botão da edição quando existe alteração real', async () => {
    useContraceptiveForm.mockReturnValue({
        ...base,
        dados: {
            ...base.dados,
            id: '7',
            nome: 'Mercilon atualizado',
            tipo: 'pilula',
            intensidadeAlerta: 'critico'
        },
        modoEdicao: true,
        podeEnviar: true
    });

    await render(
        <ContraceptiveForm
            anticoncepcional={anticoncepcional}
            onSubmit={jest.fn()}
        />
    );

    expect(
        screen.getByRole('button', {
            name: 'Atualizar anticoncepcional'
        })
    ).toBeEnabled();
});

test('mostra o carregamento e bloqueia o botão durante a atualização', async () => {
    useContraceptiveForm.mockReturnValue({
        ...base,
        dados: {
            ...base.dados,
            id: '7',
            nome: 'Mercilon atualizado',
            tipo: 'pilula',
            intensidadeAlerta: 'critico'
        },
        modoEdicao: true,
        podeEnviar: true
    });

    await render(
        <ContraceptiveForm
            anticoncepcional={anticoncepcional}
            onSubmit={jest.fn()}
            salvando
        />
    );

    const botao = screen.getByRole('button', {
        name: 'Atualizar anticoncepcional'
    });

    expect(botao).toBeDisabled();
    expect(botao).toHaveProp(
        'accessibilityState',
        expect.objectContaining({
            disabled: true,
            busy: true
        })
    );
});

test('usa o popup simples para erros de validação', async () => {
    useContraceptiveForm.mockReturnValue({
        ...base,
        alerta: {
            tipo: 'validacao',
            titulo: 'Salvar sem nome',
            mensagem: 'Informe o nome do anticoncepcional.'
        }
    });

    await render(
        <ContraceptiveForm />
    );

    const propriedades = mockSimpleModal.mock.calls.at(-1)[0];

    expect(propriedades.titulo).toBe('Salvar sem nome');
    expect(propriedades.fundoIcone).toBe('#F5EDE3');
    expect(propriedades.acaoPrincipal.variante).toBe('verde');
    expect(propriedades.acaoSecundaria).toBeUndefined();
});

test('usa o popup de duas ações para erro interno', async () => {
    useContraceptiveForm.mockReturnValue({
        ...base,
        modoEdicao: true,
        alerta: {
            tipo: 'rede',
            titulo: 'Algo deu errado',
            mensagem: 'Ocorreu um erro ao atualizar. Verifique sua conexão e tente novamente.'
        }
    });

    await render(
        <ContraceptiveForm
            anticoncepcional={anticoncepcional}
        />
    );

    const propriedades = mockSimpleModal.mock.calls.at(-1)[0];

    expect(propriedades.titulo).toBe('Algo deu errado');
    expect(propriedades.mensagem).toBe('Ocorreu um erro ao atualizar. Verifique sua conexão e tente novamente.');
    expect(propriedades.fundoIcone).toBe('#EDEDED');
    expect(propriedades.acaoPrincipal).toEqual(expect.objectContaining({
        texto: 'Tentar novamente',
        variante: 'preto'
    }));
    expect(propriedades.acaoSecundaria.texto).toBe('Voltar');
});

test('bloqueia as ações do erro enquanto uma nova tentativa está salvando', async () => {
    useContraceptiveForm.mockReturnValue({
        ...base,
        modoEdicao: true,
        alerta: {
            tipo: 'rede',
            titulo: 'Algo deu errado',
            mensagem: 'Ocorreu um erro ao atualizar.'
        }
    });

    await render(
        <ContraceptiveForm
            anticoncepcional={anticoncepcional}
            salvando
        />
    );

    const propriedades = mockSimpleModal.mock.calls.at(-1)[0];

    expect(propriedades.aoFechar).toBeUndefined();
    expect(propriedades.acaoPrincipal).toEqual(expect.objectContaining({
        carregando: true,
        desativado: true
    }));
    expect(propriedades.acaoSecundaria.desativado).toBe(true);
});