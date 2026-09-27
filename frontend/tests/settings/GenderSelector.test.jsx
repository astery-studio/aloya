//Confere se a seleção de gênero usa somente os valores aceitos pelo backend.
import { render } from '@testing-library/react-native'

jest.mock('../../components/feedback/SelectionSheet/SelectionSheet', () => ({
    SelectionSheet: jest.fn(() => null)
}))

import { SelectionSheet } from '../../components/feedback/SelectionSheet/SelectionSheet'
import { GenderSelector } from '../../features/settings/profile/GenderSelector'

describe('GenderSelector', () => {
    beforeEach(() => {
        SelectionSheet.mockClear()
    })

    test('encaminha os controles para o painel de seleção', async () => {
        const onSelecionar = jest.fn()
        const onFechar = jest.fn()

        await render(
            <GenderSelector
                visivel
                valorSelecionado="Mulher Cisgênero"
                onSelecionar={onSelecionar}
                onFechar={onFechar}
            />
        )

        expect(SelectionSheet.mock.calls[0][0]).toEqual(expect.objectContaining({
            visivel: true,
            titulo: 'Identidade de Gênero',
            valorSelecionado: 'Mulher Cisgênero',
            onSelecionar,
            onFechar
        }))
    })

    test('usa exatamente as identidades aceitas pelo backend', async () => {
        await render(<GenderSelector visivel valorSelecionado="Não-binário" onSelecionar={jest.fn()} onFechar={jest.fn()} />)

        const opcoes = SelectionSheet.mock.calls[0][0].opcoes

        expect(opcoes.map(opcao => opcao.id)).toEqual([
            'Prefiro não informar',
            'Mulher Cisgênero',
            'Homem Cisgênero',
            'Mulher Trans',
            'Homem Trans',
            'Não-binário',
            'Outro'
        ])
    })

    test('usa o mesmo texto como identificador e rótulo', async () => {
        await render(<GenderSelector visivel onSelecionar={jest.fn()} onFechar={jest.fn()} />)

        const opcoes = SelectionSheet.mock.calls[0][0].opcoes

        expect(opcoes.every(opcao => opcao.id === opcao.label)).toBe(true)
    })

    test('aceita perfil ainda sem identidade selecionada', async () => {
        await render(<GenderSelector visivel valorSelecionado={null} onSelecionar={jest.fn()} onFechar={jest.fn()} />)

        expect(SelectionSheet.mock.calls[0][0].valorSelecionado).toBeNull()
    })
})