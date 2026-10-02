//Testa as interações que o formulário encaminha para o hook e para os seletores.
import {fireEvent, render, screen, waitFor} from '@testing-library/react-native'

const mockUseContraceptiveForm = jest.fn()
const mockSelectorField = jest.fn()
const mockEditFieldSheet = jest.fn()
const mockTypeSelector = jest.fn()
const mockExpirationDateField = jest.fn()
const mockUsageTimeSelector = jest.fn()
const mockFrequencySelector = jest.fn()
const mockAlertIntensitySelector = jest.fn()
const mockSimpleModal = jest.fn()

jest.mock('../../../../src/features/contraceptives/hooks/useContraceptiveForm', () => ({
    useContraceptiveForm: (...argumentos) => mockUseContraceptiveForm(...argumentos)
}))

jest.mock('../../../../src/features/contraceptives/forms/SelectorField', () => {
    const {Pressable, Text} = require('react-native')

    return {
        SelectorField: propriedades => {
            mockSelectorField(propriedades)

            return (
                <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${propriedades.label}`} onPress={propriedades.onPress}>
                    <Text>{propriedades.label}</Text>
                </Pressable>
            )
        }
    }
})

jest.mock('../../../../src/shared/components/feedback/EditFieldSheet/EditFieldSheet', () => {
    const {Pressable, Text, View} = require('react-native')

    return {
        EditFieldSheet: propriedades => {
            mockEditFieldSheet(propriedades)

            if (!propriedades.visivel) return null

            return (
                <View>
                    <Pressable accessibilityRole="button" accessibilityLabel="Definir novo nome" onPress={() => propriedades.onAlterar('  Anticoncepcional atualizado  ')}>
                        <Text>Definir novo nome</Text>
                    </Pressable>

                    {propriedades.botaoSalvar}
                </View>
            )
        }
    }
})

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen', () => {
    const {Pressable, Text} = require('react-native')

    return {
        __esModule: true,
        default: ({texto, aoPressionar, desativado, carregando}) => (
            <Pressable accessibilityRole="button" accessibilityLabel={texto} accessibilityState={{disabled: desativado || carregando, busy: carregando}} disabled={desativado || carregando} onPress={aoPressionar}>
                <Text>{texto}</Text>
            </Pressable>
        )
    }
})

jest.mock('../../../../src/shared/components/forms/FormField', () => {
    const {View} = require('react-native')

    return {
        __esModule: true,
        default: ({campo}) => <View>{campo}</View>
    }
})

jest.mock('../../../../src/shared/components/forms/TextInput', () => {
    const {TextInput: EntradaNativa} = require('react-native')

    return {
        __esModule: true,
        default: ({placeholder, value, onChangeText, desativado, maxLength}) => (
            <EntradaNativa accessibilityLabel={placeholder} value={value} editable={!desativado} maxLength={maxLength} onChangeText={onChangeText} />
        )
    }
})

jest.mock('../../../../src/features/contraceptives/forms/ContraceptiveTypeSelector', () => ({
    ContraceptiveTypeSelector: propriedades => {
        mockTypeSelector(propriedades)
        return null
    }
}))

jest.mock('../../../../src/features/contraceptives/forms/ExpirationDateField', () => ({
    ExpirationDateField: propriedades => {
        mockExpirationDateField(propriedades)
        return null
    }
}))

jest.mock('../../../../src/features/contraceptives/forms/UsageTimeSelector', () => ({
    UsageTimeSelector: propriedades => {
        mockUsageTimeSelector(propriedades)
        return null
    }
}))

jest.mock('../../../../src/features/contraceptives/forms/FrequencySelector', () => ({
    FrequencySelector: propriedades => {
        mockFrequencySelector(propriedades)
        return null
    }
}))

jest.mock('../../../../src/features/contraceptives/forms/AlertIntensitySelector', () => ({
    AlertIntensitySelector: propriedades => {
        mockAlertIntensitySelector(propriedades)
        return null
    }
}))

jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => ({
    __esModule: true,
    default: propriedades => {
        mockSimpleModal(propriedades)
        return null
    }
}))

jest.mock('phosphor-react-native', () => ({
    FilePlus: () => null,
    WarningCircle: () => null
}))

import {ContraceptiveForm} from '../../../../src/features/contraceptives/forms/ContraceptiveForm'

function criarControle(sobrescritas = {}) {
    const dadosPadrao = {
        nome: 'Mercilon',
        tipo: 'pilula',
        frequenciaId: 'pilula_continuo',
        horarios: ['08:00'],
        dataValidade: '',
        dataPrimeiroUso: '',
        intensidadeAlerta: 'critico'
    }

    return {
        dados: {
            ...dadosPadrao,
            ...(sobrescritas.dados ?? {})
        },
        painel: null,
        alerta: null,
        hoje: '2026-10-02',
        modoEdicao: false,
        podeEnviar: true,
        permiteMultiplos: false,
        exigePrimeiroUso: false,
        alterar: jest.fn(),
        abrir: jest.fn(),
        fecharPainel: jest.fn(),
        enviar: jest.fn(),
        fecharAlerta: jest.fn(),
        selecionarTipo: jest.fn(),
        selecionarFrequencia: jest.fn(),
        ...sobrescritas,
        dados: {
            ...dadosPadrao,
            ...(sobrescritas.dados ?? {})
        }
    }
}

function obterUltimasPropriedades(mock) {
    return mock.mock.calls.at(-1)?.[0]
}

describe('ContraceptiveForm - interações', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('altera o nome e envia o formulário de cadastro', async () => {
        const controle = criarControle()
        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} />)

        await fireEvent.changeText(screen.getByLabelText('Digite o nome'), 'Selene')

        expect(controle.alterar).toHaveBeenCalledWith('nome', 'Selene')

        await fireEvent.press(screen.getByRole('button', {name: 'Salvar anticoncepcional'}))

        expect(controle.enviar).toHaveBeenCalledTimes(1)
    })

    test('abre a edição do nome quando não está salvando', async () => {
        const controle = criarControle({
            modoEdicao: true
        })

        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} anticoncepcional={{id: '1'}} />)

        await fireEvent.press(screen.getByRole('button', {name: 'Abrir Nome da Medicação'}))

        expect(controle.abrir).toHaveBeenCalledWith('nome')
    })

    test('não abre a edição do nome durante o salvamento', async () => {
        const controle = criarControle({
            modoEdicao: true
        })

        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} anticoncepcional={{id: '1'}} salvando />)

        await fireEvent.press(screen.getByRole('button', {name: 'Abrir Nome da Medicação'}))

        expect(controle.abrir).not.toHaveBeenCalled()
    })

    test('salva o nome editado sem espaços nas extremidades', async () => {
        const controle = criarControle({
            modoEdicao: true,
            painel: 'nome'
        })

        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} anticoncepcional={{id: '1'}} />)

        await fireEvent.press(screen.getByRole('button', {name: 'Definir novo nome'}))

        await waitFor(() => {
            expect(screen.getByRole('button', {name: 'Salvar'})).toBeEnabled()
        })

        await fireEvent.press(screen.getByRole('button', {name: 'Salvar'}))

        expect(controle.alterar).toHaveBeenCalledWith('nome', 'Anticoncepcional atualizado')
        expect(controle.fecharPainel).toHaveBeenCalledTimes(1)
    })

    test('mantém o botão de nome desativado quando o nome não foi alterado', async () => {
        const controle = criarControle({
            modoEdicao: true,
            painel: 'nome'
        })

        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} anticoncepcional={{id: '1'}} />)

        expect(screen.getByRole('button', {name: 'Salvar'})).toBeDisabled()
    })

    test('encaminha a seleção do tipo para o hook', async () => {
        const controle = criarControle()
        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} />)

        const seletor = obterUltimasPropriedades(mockTypeSelector)

        seletor.onAbrir()
        seletor.onSelecionar('injetavel')
        seletor.onFechar()

        expect(controle.abrir).toHaveBeenCalledWith('tipo')
        expect(controle.selecionarTipo).toHaveBeenCalledWith('injetavel')
        expect(controle.fecharPainel).toHaveBeenCalledTimes(1)
    })

    test('configura a validade do DIU hormonal', async () => {
        const controle = criarControle({
            dados: {
                tipo: 'diu_hormonal',
                frequenciaId: '',
                horarios: [],
                dataValidade: '2030-10-20'
            }
        })

        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} />)

        const seletor = obterUltimasPropriedades(mockExpirationDateField)

        seletor.onAbrir()
        const resultado = await seletor.onSelecionar('2031-01-15')
        seletor.onFechar()

        expect(resultado).toBe(true)
        expect(controle.abrir).toHaveBeenCalledWith('validade')
        expect(controle.alterar).toHaveBeenCalledWith('dataValidade', '2031-01-15')
        expect(controle.fecharPainel).toHaveBeenCalledTimes(1)
        expect(mockUsageTimeSelector).not.toHaveBeenCalled()
        expect(mockFrequencySelector).not.toHaveBeenCalled()
    })

    test('configura frequência e horários de um método com lembretes', async () => {
        const controle = criarControle({
            permiteMultiplos: true
        })

        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} />)

        const frequencia = obterUltimasPropriedades(mockFrequencySelector)
        const horarios = obterUltimasPropriedades(mockUsageTimeSelector)

        frequencia.onAbrir()
        frequencia.onSelecionar('pilula_21_dias')
        frequencia.onFechar()

        expect(controle.abrir).toHaveBeenCalledWith('frequencia')
        expect(controle.selecionarFrequencia).toHaveBeenCalledWith('pilula_21_dias')

        horarios.onAbrir()
        horarios.onConfirmar(['09:30', '21:30'])
        horarios.onFechar()

        expect(controle.abrir).toHaveBeenCalledWith('horarios')
        expect(controle.alterar).toHaveBeenCalledWith('horarios', ['09:30', '21:30'])
        expect(controle.fecharPainel).toHaveBeenCalledTimes(3)
    })

    test('configura a data do primeiro uso quando ela é exigida', async () => {
        const controle = criarControle({
            exigePrimeiroUso: true,
            dados: {
                tipo: 'anel',
                dataPrimeiroUso: '2026-09-20'
            }
        })

        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} />)

        const seletor = obterUltimasPropriedades(mockExpirationDateField)

        expect(seletor.label).toBe('Data do primeiro uso')
        expect(seletor.titulo).toBe('Data do primeiro uso')

        seletor.onAbrir()
        const resultado = await seletor.onSelecionar('2026-10-01')

        expect(resultado).toBe(true)
        expect(controle.abrir).toHaveBeenCalledWith('primeiroUso')
        expect(controle.alterar).toHaveBeenCalledWith('dataPrimeiroUso', '2026-10-01')
    })

    test('configura a intensidade do alerta e fecha o painel', async () => {
        const controle = criarControle()
        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} />)

        const seletor = obterUltimasPropriedades(mockAlertIntensitySelector)

        seletor.onAbrir()
        seletor.onSelecionar('moderado')
        seletor.onFechar()

        expect(controle.abrir).toHaveBeenCalledWith('intensidade')
        expect(controle.alterar).toHaveBeenCalledWith('intensidadeAlerta', 'moderado')
        expect(controle.fecharPainel).toHaveBeenCalledTimes(2)
    })

    test('repete o envio ou volta ao formulário pelo alerta de rede', async () => {
        const controle = criarControle({
            alerta: {
                tipo: 'rede',
                titulo: 'Não foi possível atualizar',
                mensagem: 'Tente novamente.'
            }
        })

        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} />)

        const modal = obterUltimasPropriedades(mockSimpleModal)

        modal.acaoPrincipal.aoPressionar()
        modal.acaoSecundaria.aoPressionar()
        modal.aoFechar()

        expect(controle.enviar).toHaveBeenCalledTimes(1)
        expect(controle.fecharAlerta).toHaveBeenCalledTimes(2)
    })

    test('fecha o alerta de validação sem reenviar o formulário', async () => {
        const controle = criarControle({
            alerta: {
                tipo: 'validacao',
                titulo: 'Confira os dados',
                mensagem: 'Existem campos inválidos.'
            }
        })

        mockUseContraceptiveForm.mockReturnValue(controle)

        await render(<ContraceptiveForm onSubmit={jest.fn()} />)

        const modal = obterUltimasPropriedades(mockSimpleModal)

        modal.acaoPrincipal.aoPressionar()

        expect(controle.fecharAlerta).toHaveBeenCalledTimes(1)
        expect(controle.enviar).not.toHaveBeenCalled()
    })
})