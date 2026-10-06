//Testa a conexão entre o hook de dados e a tela visual do histórico.
import {render} from '@testing-library/react-native'

import {CycleHistoryFlow} from '../../../src/features/cycles/CycleHistoryFlow'
import {useCycleHistory} from '../../../src/features/cycles/hooks/useCycleHistory'
import {CycleHistoryScreen} from '../../../src/features/cycles/screens/CycleHistoryScreen'

jest.mock(
    '../../../src/features/cycles/hooks/useCycleHistory',
    () => ({
        useCycleHistory: jest.fn()
    })
)

jest.mock(
    '../../../src/features/cycles/screens/CycleHistoryScreen',
    () => ({
        CycleHistoryScreen: jest.fn(() => null)
    })
)

const ciclos = Object.freeze([
    Object.freeze({
        id: '3',
        numero: 3,
        periodo: '04 Set até hoje'
    })
])

function criarEstadoDoHook(alteracoes = {}) {
    return {
        ciclos,
        quantidadeCiclos: 3,
        carregando: false,
        carregandoMais: false,
        erro: null,
        erroCarregarMais: null,
        temMais: true,
        carregarMais: jest.fn(),
        tentarNovamente: jest.fn(),
        tentarCarregarMais: jest.fn(),
        ...alteracoes
    }
}

beforeEach(() => {
    jest.clearAllMocks()
    useCycleHistory.mockReturnValue(criarEstadoDoHook())
})

test('entrega o serviço e a ação de sessão expirada ao hook', async () => {
    const service = {
        listarPagina: jest.fn()
    }

    const onSessaoExpirada = jest.fn()

    await render(
        <CycleHistoryFlow
            service={service}
            onSessaoExpirada={onSessaoExpirada}
        />
    )

    expect(useCycleHistory).toHaveBeenCalledWith({
        service,
        onSessaoExpirada
    })
})

test('encaminha os estados do hook para a tela', async () => {
    const estado = criarEstadoDoHook({
        carregando: true,
        carregandoMais: true,
        erro: 'Erro inicial',
        erroCarregarMais: 'Erro da próxima página'
    })

    useCycleHistory.mockReturnValue(estado)

    await render(
        <CycleHistoryFlow
            service={{
                listarPagina: jest.fn()
            }}
        />
    )

    expect(CycleHistoryScreen).toHaveBeenCalledWith(
        expect.objectContaining({
            ciclos: estado.ciclos,
            carregando: true,
            carregandoMais: true,
            erro: 'Erro inicial',
            erroCarregarMais: 'Erro da próxima página',
            temMais: true,
            aoTentarNovamente: estado.tentarNovamente,
            aoCarregarMais: estado.carregarMais,
            aoTentarCarregarMais: estado.tentarCarregarMais
        }),
        undefined
    )
})

test('usa a quantidade real sem inventar os cálculos estatísticos', async () => {
    useCycleHistory.mockReturnValue(criarEstadoDoHook({
        quantidadeCiclos: 7
    }))

    await render(
        <CycleHistoryFlow
            service={{
                listarPagina: jest.fn()
            }}
        />
    )

    const propriedades = CycleHistoryScreen.mock.calls[0][0]

    expect(propriedades.resumo).toEqual({
        quantidadeCiclos: 7
    })

    expect(propriedades.resumo).not.toHaveProperty('cicloMedioDias')
    expect(propriedades.resumo).not.toHaveProperty('menstruacaoMediaDias')
})

test('preserva o resumo quando os cálculos forem fornecidos pela outra integração', async () => {
    useCycleHistory.mockReturnValue(criarEstadoDoHook({
        quantidadeCiclos: 6
    }))

    await render(
        <CycleHistoryFlow
            service={{
                listarPagina: jest.fn()
            }}
            resumo={{
                cicloMedioDias: 28,
                menstruacaoMediaDias: 5,
                quantidadeCiclos: 999,
                confianca: 'alta'
            }}
        />
    )

    expect(CycleHistoryScreen.mock.calls[0][0].resumo).toEqual({
        cicloMedioDias: 28,
        menstruacaoMediaDias: 5,
        quantidadeCiclos: 6,
        confianca: 'alta'
    })
})

test('encaminha as ações visuais sem criar regras intermediárias', async () => {
    const aoAbrirCalendario = jest.fn()
    const aoEditarCiclo = jest.fn()
    const aoExcluirCiclo = jest.fn()
    const onSelecionarAba = jest.fn()

    await render(
        <CycleHistoryFlow
            service={{
                listarPagina: jest.fn()
            }}
            aoAbrirCalendario={aoAbrirCalendario}
            aoEditarCiclo={aoEditarCiclo}
            aoExcluirCiclo={aoExcluirCiclo}
            onSelecionarAba={onSelecionarAba}
        />
    )

    expect(CycleHistoryScreen).toHaveBeenCalledWith(
        expect.objectContaining({
            aoAbrirCalendario,
            aoEditarCiclo,
            aoExcluirCiclo,
            onSelecionarAba
        }),
        undefined
    )
})