import { render } from '@testing-library/react-native';
import { useContraceptiveForm } from '../../../features/contraceptives/hooks/useContraceptiveForm';
import { ContraceptiveForm } from '../../../features/contraceptives/forms/ContraceptiveForm';

const mockSimpleModal = jest.fn(() => null);

jest.mock('../../../components/feedback/Modal/SimpleModal', () => ({
    __esModule: true,
    default: (props) => mockSimpleModal(props)
}));
jest.mock('../../../features/contraceptives/hooks/useContraceptiveForm', () => ({
    useContraceptiveForm: jest.fn()
}));
jest.mock('../../../features/contraceptives/forms/AlertIntensitySelector', () => ({ AlertIntensitySelector: () => null }));
jest.mock('../../../features/contraceptives/forms/ContraceptiveTypeSelector', () => ({ ContraceptiveTypeSelector: () => null }));
jest.mock('../../../features/contraceptives/forms/ExpirationDateField', () => ({ ExpirationDateField: () => null }));
jest.mock('../../../features/contraceptives/forms/FrequencySelector', () => ({ FrequencySelector: () => null }));
jest.mock('../../../features/contraceptives/forms/UsageTimeSelector', () => ({ UsageTimeSelector: () => null }));

const base = {
    dados: { nome: '', tipo: '', intensidadeAlerta: '' },
    painel: null,
    hoje: '2026-09-24',
    alterar: jest.fn(),
    enviar: jest.fn(),
    fecharAlerta: jest.fn()
};

test('usa o popup simples para erros de validação', async () => {
    useContraceptiveForm.mockReturnValue({
        ...base,
        alerta: { tipo: 'validacao', titulo: 'Salvar sem nome', mensagem: 'Informe o nome do anticoncepcional.' }
    });

    await render(<ContraceptiveForm />);
    const propriedades = mockSimpleModal.mock.calls.at(-1)[0];
    expect(propriedades.titulo).toBe('Salvar sem nome');
    expect(propriedades.fundoIcone).toBe('#F5EDE3');
    expect(propriedades.acaoPrincipal.variante).toBe('verde');
    expect(propriedades.acaoSecundaria).toBeUndefined();
});

test('usa o popup de duas ações para erro interno', async () => {
    useContraceptiveForm.mockReturnValue({
        ...base,
        alerta: { tipo: 'rede', titulo: 'Algo deu errado', mensagem: 'Tente novamente.' }
    });

    await render(<ContraceptiveForm />);
    const propriedades = mockSimpleModal.mock.calls.at(-1)[0];
    expect(propriedades.fundoIcone).toBe('#EDEDED');
    expect(propriedades.acaoPrincipal.variante).toBe('preto');
    expect(propriedades.acaoSecundaria.texto).toBe('Voltar');
});
