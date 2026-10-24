//Testa cancelamento, fechamento, repetição e bloqueio dos modais de exclusão.
import {act, fireEvent, render, screen} from '@testing-library/react-native'

const mockContraceptiveForm = jest.fn(() => null)
const mockSimpleModal = jest.fn(() => null)

jest.mock('../../../../src/features/contraceptives/forms/ContraceptiveForm', () => ({
    ContraceptiveForm: propriedades => mockContraceptiveForm(propriedades)
}))

jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => ({
    __esModule: true,
    default: propriedades => mockSimpleModal(propriedades)
}))

jest.mock('../../../../src/shared/components/navigation/Header/Header', () => {
    const {Text} = require('react-native')

    return {
        Header: ({titulo}) => <Text>{titulo}</Text>
    }
})

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    PillIcon: () => null,
    WarningCircleIcon: () => null
}))

import {EditContraceptiveScreen} from '../../../../src/features/contraceptives/screens/EditContraceptiveScreen'

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
}

//Cria uma promessa que o teste pode concluir manualmente para simular uma requisição pendente.
function criarPromessaControlada() {
    let resolver
    let rejeitar

    const promessa = new Promise((resolve, reject) => {
        resolver = resolve
        rejeitar = reject
    })

    return {
        promessa,
        resolver,
        rejeitar
    }
}

//Retorna a versão mais recente do modal com o título informado.
function obterModal(titulo) {
    return mockSimpleModal.mock.calls
        .map(([propriedades]) => propriedades)
        .filter(propriedades => propriedades.titulo === titulo)
        .at(-1)
}

//Monta a tela com valores seguros e permite trocar somente as propriedades necessárias.
async function montarTela(sobrescritas = {}) {
    const propriedades = {
        anticoncepcional,
        aoAtualizar: jest.fn(),
        aoExcluir: jest.fn(),
        aoVoltar: jest.fn(),
        ...sobrescritas
    }

    await render(<EditContraceptiveScreen {...propriedades} />)

    return propriedades
}

describe('EditContraceptiveScreen - modais', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('cancela a exclusão pelo botão Cancelar', async () => {
        const {aoExcluir} = await montarTela()

        await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}))

        const confirmacao = obterModal('Apagar anticoncepcional')

        expect(confirmacao.visivel).toBe(true)

        await act(async () => {
            confirmacao.acaoSecundaria.aoPressionar()
        })

        expect(obterModal('Apagar anticoncepcional').visivel).toBe(false)
        expect(aoExcluir).not.toHaveBeenCalled()
    })

    test('fecha a confirmação pela ação de fechar do modal', async () => {
        const {aoExcluir} = await montarTela()

        await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}))

        const confirmacao = obterModal('Apagar anticoncepcional')

        expect(confirmacao.aoFechar).toEqual(expect.any(Function))

        await act(async () => {
            confirmacao.aoFechar()
        })

        expect(obterModal('Apagar anticoncepcional').visivel).toBe(false)
        expect(aoExcluir).not.toHaveBeenCalled()
    })

    test('fecha o erro de exclusão pelo botão Voltar', async () => {
        const aoExcluir = jest.fn().mockRejectedValue(new Error('falha interna'))

        await montarTela({
            aoExcluir
        })

        await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}))

        await act(async () => {
            await obterModal('Apagar anticoncepcional').acaoPrincipal.aoPressionar()
        })

        const erro = obterModal('Algo deu errado')

        expect(erro.visivel).toBe(true)

        await act(async () => {
            erro.acaoSecundaria.aoPressionar()
        })

        expect(obterModal('Algo deu errado').visivel).toBe(false)
        expect(screen.getByText('Editar o Anticoncepcional')).toBeOnTheScreen()
    })

    test('fecha o erro de exclusão pela ação de fechar do modal', async () => {
        const aoExcluir = jest.fn().mockRejectedValue(new Error('falha interna'))

        await montarTela({
            aoExcluir
        })

        await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}))

        await act(async () => {
            await obterModal('Apagar anticoncepcional').acaoPrincipal.aoPressionar()
        })

        const erro = obterModal('Algo deu errado')

        expect(erro.aoFechar).toEqual(expect.any(Function))

        await act(async () => {
            erro.aoFechar()
        })

        expect(obterModal('Algo deu errado').visivel).toBe(false)
    })

    test('tenta excluir novamente depois de uma falha', async () => {
        const aoExcluir = jest.fn()
            .mockRejectedValueOnce(new Error('falha temporária'))
            .mockResolvedValueOnce(undefined)

        await montarTela({
            aoExcluir
        })

        await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}))

        await act(async () => {
            await obterModal('Apagar anticoncepcional').acaoPrincipal.aoPressionar()
        })

        const erro = obterModal('Algo deu errado')

        expect(erro.visivel).toBe(true)
        expect(erro.acaoPrincipal.texto).toBe('Tentar novamente')

        await act(async () => {
            await erro.acaoPrincipal.aoPressionar()
        })

        expect(aoExcluir).toHaveBeenCalledTimes(2)
        expect(aoExcluir).toHaveBeenNthCalledWith(1, '7')
        expect(aoExcluir).toHaveBeenNthCalledWith(2, '7')
        expect(obterModal('Algo deu errado').visivel).toBe(false)
        expect(obterModal('Anticoncepcional removido com sucesso').visivel).toBe(true)
    })

    test('bloqueia fechamento e ações enquanto a exclusão está pendente', async () => {
        const requisicao = criarPromessaControlada()
        const aoExcluir = jest.fn().mockReturnValue(requisicao.promessa)

        await montarTela({
            aoExcluir
        })

        await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}))

        const confirmacaoInicial = obterModal('Apagar anticoncepcional')
        let exclusaoPendente

        await act(async () => {
            exclusaoPendente = confirmacaoInicial.acaoPrincipal.aoPressionar()
            await Promise.resolve()
        })

        const confirmacaoPendente = obterModal('Apagar anticoncepcional')
        const erroPendente = obterModal('Algo deu errado')
        const botaoExcluir = screen.getByRole('button', {name: 'Apagar medicação'})

        expect(confirmacaoPendente.aoFechar).toBeUndefined()
        expect(confirmacaoPendente.acaoPrincipal.carregando).toBe(true)
        expect(confirmacaoPendente.acaoPrincipal.desativado).toBe(true)
        expect(confirmacaoPendente.acaoSecundaria.desativado).toBe(true)
        expect(erroPendente.aoFechar).toBeUndefined()
        expect(botaoExcluir).toBeDisabled()
        expect(botaoExcluir).toHaveProp('accessibilityState', expect.objectContaining({
            disabled: true,
            busy: true
        }))

        await act(async () => {
            requisicao.resolver()
            await exclusaoPendente
        })

        expect(obterModal('Anticoncepcional removido com sucesso').visivel).toBe(true)
    })

    test('retorna para a listagem ao fechar o sucesso da exclusão', async () => {
        const aoExcluir = jest.fn().mockResolvedValue(undefined)
        const aoVoltar = jest.fn()

        await montarTela({
            aoExcluir,
            aoVoltar
        })

        await fireEvent.press(screen.getByRole('button', {name: 'Apagar medicação'}))

        await act(async () => {
            await obterModal('Apagar anticoncepcional').acaoPrincipal.aoPressionar()
        })

        const sucesso = obterModal('Anticoncepcional removido com sucesso')

        expect(sucesso.visivel).toBe(true)

        await act(async () => {
            sucesso.aoFechar()
        })

        expect(aoVoltar).toHaveBeenCalledTimes(1)
        expect(obterModal('Anticoncepcional atualizado com sucesso').visivel).toBe(false)
    })

    test('não fornece atualização ao formulário quando a ação não existe', async () => {
        await montarTela({
            aoAtualizar: undefined
        })

        const formulario = mockContraceptiveForm.mock.calls.at(-1)[0]

        expect(formulario.onSubmit).toBeUndefined()
    })
})