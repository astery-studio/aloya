jest.mock('../components/feedback/Bottomsheet/BottomSheet', () => ({
    BottomSheet: jest.fn()
}))

jest.mock('../layouts/BottomSheet/BottomSheetLayout', () => ({
    BottomSheetLayout: jest.fn()
}))

import {SelectionSheet} from '../components/feedback/SelectionSheet/SelectionSheet'

test('usa uma lista vazia quando não recebe opções', () => {
    const componente = SelectionSheet({
        visivel: true,
        titulo: 'Selecionar opção',
        onSelecionar: jest.fn(),
        onFechar: jest.fn()
    })

    const layout = componente.props.children
    const lista = layout.props.children

    expect(lista.props.data).toEqual([])
    expect(lista.props.initialNumToRender).toBe(7)
    expect(lista.props.windowSize).toBe(5)
})