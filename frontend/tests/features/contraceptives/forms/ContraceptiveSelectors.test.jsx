//Testa os seletores de tipo, frequência, validade e intensidade usados no formulário de anticoncepcionais.
import { render, screen, userEvent, waitFor } from '@testing-library/react-native'
import { AlertIntensitySelector } from '../../../../src/features/contraceptives/forms/AlertIntensitySelector'
import { ContraceptiveTypeSelector } from '../../../../src/features/contraceptives/forms/ContraceptiveTypeSelector'
import { ExpirationDateField } from '../../../../src/features/contraceptives/forms/ExpirationDateField'
import { FrequencySelector } from '../../../../src/features/contraceptives/forms/FrequencySelector'
import { SelectorField } from '../../../../src/features/contraceptives/forms/SelectorField'
import { INTENSIDADES_ALERTA, TIPOS_ANTICONCEPCIONAL } from '../../../../src/features/contraceptives/constants/contraceptiveOptions'

const mockSelectionSheet = jest.fn()
const mockDatePickerSheet = jest.fn()
const mockButtonSelection = jest.fn()

jest.mock('phosphor-react-native', () => {
    const { Text } = require('react-native')

    function IconeFalso({color}) {
        return <Text>{color || 'ícone'}</Text>
    }

    return {
        ArrowsClockwise: IconeFalso,
        Bell: IconeFalso,
        CalendarBlank: IconeFalso,
        CaretDown: IconeFalso,
        CaretRight: IconeFalso,
        Pill: IconeFalso
    }
})

jest.mock('../../../../src/shared/components/forms/FormField', () => {
    const { Text, View } = require('react-native')

    return {
        __esModule: true,
        default: ({label, campo}) => (
            <View>
                <Text>{label}</Text>
                {campo}
            </View>
        )
    }
})

jest.mock('../../../../src/shared/components/feedback/SelectionSheet/SelectionSheet', () => ({
    SelectionSheet: (props) => {
        mockSelectionSheet(props)
        return null
    }
}))

jest.mock('../../../../src/shared/components/feedback/DatePickerSheet/DatePickerSheet', () => ({
    DatePickerSheet: (props) => {
        mockDatePickerSheet(props)
        return null
    }
}))

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen', () => {
    const { Pressable, Text } = require('react-native')

    return {
        __esModule: true,
        default: ({texto, aoPressionar, desativado}) => (
            <Pressable accessibilityRole="button" accessibilityLabel={texto} disabled={desativado} onPress={aoPressionar}>
                <Text>{texto}</Text>
            </Pressable>
        )
    }
})

jest.mock('../../../../src/shared/components/common/Button/ButtonSelection/ButtonSelection', () => {
    const { Pressable, Text } = require('react-native')

    return {
        ButtonSelection: (props) => {
            mockButtonSelection(props)

            return (
                <Pressable accessibilityRole="button" accessibilityLabel={props.label} accessibilityState={{selected: props.selected}} onPress={props.onPress}>
                    <Text>{props.label}</Text>
                    <Text>{props.descricao}</Text>
                </Pressable>
            )
        }
    }
})

jest.mock('../../../../src/shared/components/navigation/Header/Header', () => {
    const { Pressable, Text, View } = require('react-native')

    return {
        Header: ({titulo, onVoltar}) => (
            <View>
                <Text>{titulo}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onVoltar}>
                    <Text>Voltar</Text>
                </Pressable>
            </View>
        )
    }
})

beforeEach(() => {
    jest.clearAllMocks()
})

test('mostra o placeholder e executa a abertura do seletor genérico', async () => {
    const usuario = userEvent.setup()
    const onPress = jest.fn()

    await render(
        <SelectorField
            label="Tipo"
            placeholder="Selecione o tipo"
            onPress={onPress}
        />
    )

    const campo = screen.getByRole('button', {
        name: 'Tipo: Selecione o tipo'
    })

    expect(screen.getByText('Selecione o tipo')).toBeOnTheScreen()

    await usuario.press(campo)

    expect(onPress).toHaveBeenCalledTimes(1)
})

test('mostra valor, ícone e variante de navegação no seletor genérico', async () => {
    const Icone = () => null

    await render(
        <SelectorField
            label="Nome"
            valor="Mercilon"
            placeholder="Digite o nome"
            onPress={jest.fn()}
            navegar
            icone={Icone}
            corIcone="#123456"
            fundoIcone="#FFFFFF"
        />
    )

    expect(screen.getByRole('button', {
        name: 'Nome: Mercilon'
    })).toBeOnTheScreen()

    expect(screen.getByText('Mercilon')).toHaveProp(
        'numberOfLines',
        2
    )
})

test('mostra o tipo atual e encaminha todas as ações para a folha de seleção', async () => {
    const usuario = userEvent.setup()
    const onAbrir = jest.fn()
    const onSelecionar = jest.fn()
    const onFechar = jest.fn()

    await render(
        <ContraceptiveTypeSelector
            valor="pilula"
            aberto
            onAbrir={onAbrir}
            onSelecionar={onSelecionar}
            onFechar={onFechar}
        />
    )

    await usuario.press(screen.getByRole('button', {
        name: 'Tipo: Pílula'
    }))

    expect(onAbrir).toHaveBeenCalledTimes(1)

    const propriedades = mockSelectionSheet.mock.calls.at(-1)[0]

    expect(propriedades).toMatchObject({
        visivel: true,
        titulo: 'Tipo de Anticoncepcional',
        opcoes: TIPOS_ANTICONCEPCIONAL,
        valorSelecionado: 'pilula',
        onSelecionar,
        onFechar
    })

    propriedades.onSelecionar('injetavel')
    propriedades.onFechar()

    expect(onSelecionar).toHaveBeenCalledWith('injetavel')
    expect(onFechar).toHaveBeenCalledTimes(1)
})

test('mostra placeholder quando o tipo recebido é desconhecido', async () => {
    await render(
        <ContraceptiveTypeSelector
            valor="tipo_inexistente"
            aberto={false}
            onAbrir={jest.fn()}
            onSelecionar={jest.fn()}
            onFechar={jest.fn()}
        />
    )

    expect(screen.getByRole('button', {
        name: 'Tipo: Selecione o tipo'
    })).toBeOnTheScreen()
})

test('mostra somente as frequências compatíveis com o tipo', async () => {
    const usuario = userEvent.setup()
    const onAbrir = jest.fn()
    const onSelecionar = jest.fn()
    const onFechar = jest.fn()

    await render(
        <FrequencySelector
            tipo="injetavel"
            valor="injetavel_bimestral"
            aberto
            onAbrir={onAbrir}
            onSelecionar={onSelecionar}
            onFechar={onFechar}
        />
    )

    await usuario.press(screen.getByRole('button', {
        name: 'Frequência de Uso: A cada 2 meses'
    }))

    expect(onAbrir).toHaveBeenCalledTimes(1)

    const propriedades = mockSelectionSheet.mock.calls.at(-1)[0]

    expect(propriedades.visivel).toBe(true)
    expect(propriedades.valorSelecionado).toBe('injetavel_bimestral')
    expect(propriedades.opcoes.map((opcao) => opcao.id)).toEqual([
        'injetavel_mensal',
        'injetavel_bimestral',
        'injetavel_trimestral'
    ])

    propriedades.onSelecionar('injetavel_mensal')
    propriedades.onFechar()

    expect(onSelecionar).toHaveBeenCalledWith('injetavel_mensal')
    expect(onFechar).toHaveBeenCalledTimes(1)
})

test('usa lista vazia e placeholder para uma frequência desconhecida', async () => {
    await render(
        <FrequencySelector
            tipo="tipo_inexistente"
            valor="frequencia_inexistente"
            aberto={false}
            onAbrir={jest.fn()}
            onSelecionar={jest.fn()}
            onFechar={jest.fn()}
        />
    )

    expect(screen.getByRole('button', {
        name: 'Frequência de Uso: Selecione a frequência'
    })).toBeOnTheScreen()

    expect(mockSelectionSheet.mock.calls.at(-1)[0].opcoes).toEqual([])
})

test('formata a validade e encaminha as configurações para o calendário', async () => {
    const usuario = userEvent.setup()
    const onAbrir = jest.fn()
    const onSelecionar = jest.fn()
    const onFechar = jest.fn()

    await render(
        <ExpirationDateField
            valor="2030-12-05"
            aberto
            onAbrir={onAbrir}
            onSelecionar={onSelecionar}
            onFechar={onFechar}
            dataMinima="2026-10-02"
        />
    )

    await usuario.press(screen.getByRole('button', {
        name: 'Data de Validade: 05/12/2030'
    }))

    expect(onAbrir).toHaveBeenCalledTimes(1)

    const propriedades = mockDatePickerSheet.mock.calls.at(-1)[0]

    expect(propriedades).toMatchObject({
        visivel: true,
        titulo: 'Data de Validade',
        valorSelecionado: '2030-12-05',
        dataMinima: '2026-10-02',
        onSelecionar,
        onFechar
    })
})

test('permite personalizar o título e mostra placeholder sem data', async () => {
    await render(
        <ExpirationDateField
            valor=""
            aberto={false}
            onAbrir={jest.fn()}
            onSelecionar={jest.fn()}
            onFechar={jest.fn()}
            label="Data do primeiro uso"
            titulo="Escolher primeiro uso"
        />
    )

    expect(screen.getByRole('button', {
        name: 'Data do primeiro uso: DD/MM/AAAA'
    })).toBeOnTheScreen()

    expect(mockDatePickerSheet.mock.calls.at(-1)[0].titulo).toBe(
        'Escolher primeiro uso'
    )
})

test('seleciona temporariamente uma intensidade e confirma somente no botão', async () => {
    const usuario = userEvent.setup()
    const onSelecionar = jest.fn()
    const onFechar = jest.fn()

    await render(
        <AlertIntensitySelector
            valor="moderado"
            aberto
            onAbrir={jest.fn()}
            onSelecionar={onSelecionar}
            onFechar={onFechar}
        />
    )

    expect(screen.getByRole('button', {
        name: 'Intensidade do Alerta: Moderado'
    })).toBeOnTheScreen()

    expect(screen.getByRole('button', {
        name: 'Moderado'
    })).toHaveProp(
        'accessibilityState',
        expect.objectContaining({
            selected: true
        })
    )

    await usuario.press(screen.getByRole('button', {
        name: 'Leve'
    }))

    await waitFor(() => {
        expect(screen.getByRole('button', {
            name: 'Leve'
        })).toHaveProp(
            'accessibilityState',
            expect.objectContaining({
                selected: true
            })
        )
    })

    expect(onSelecionar).not.toHaveBeenCalled()

    await usuario.press(screen.getByRole('button', {
        name: 'Confirmar'
    }))

    expect(onSelecionar).toHaveBeenCalledTimes(1)
    expect(onSelecionar).toHaveBeenCalledWith('leve')
})

test('usa crítico como padrão e permite fechar pelo cabeçalho', async () => {
    const usuario = userEvent.setup()
    const onAbrir = jest.fn()
    const onSelecionar = jest.fn()
    const onFechar = jest.fn()

    await render(
        <AlertIntensitySelector
            valor=""
            aberto
            onAbrir={onAbrir}
            onSelecionar={onSelecionar}
            onFechar={onFechar}
        />
    )

    await usuario.press(screen.getByRole('button', {
        name: 'Intensidade do Alerta: Crítico'
    }))

    expect(onAbrir).toHaveBeenCalledTimes(1)

    await usuario.press(screen.getByRole('button', {
        name: 'Confirmar'
    }))

    expect(onSelecionar).toHaveBeenCalledWith('critico')

    await usuario.press(screen.getByRole('button', {
        name: 'Voltar'
    }))

    expect(onFechar).toHaveBeenCalledTimes(1)
    expect(mockButtonSelection).toHaveBeenCalledTimes(
        INTENSIDADES_ALERTA.length
    )
})