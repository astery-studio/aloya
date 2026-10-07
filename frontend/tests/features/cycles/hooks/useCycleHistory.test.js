//Testa carregamento, resumo, paginação, cancelamento e falhas do histórico.
import {act, renderHook, waitFor} from '@testing-library/react-native'

import {useCycleHistory} from '../../../../src/features/cycles/hooks/useCycleHistory'

const primeiroCiclo = Object.freeze({
    id: '3',
    numero: 3,
    periodo: '04 Set até hoje'
})

const segundoCiclo = Object.freeze({
    id: '2',
    numero: 2,
    periodo: '07 Ago até 03 Set'
})

function criarResumo(quantidadeCiclos = 1, alteracoes = {}) {
    return Object.freeze({
        cicloMedioDias: 28,
        menstruacaoMediaDias: 5,
        quantidadeCiclos,
        confianca: 'media',
        ...alteracoes
    })
}

function criarPagina({
    ciclos = [primeiroCiclo],
    quantidadeCiclos = 1,
    resumo = criarResumo(quantidadeCiclos),
    temMais = false,
    proximoCursor = null
} = {}) {
    return {
        ciclos,
        resumo,
        quantidadeCiclos,
        paginacao: {
            limite: 20,
            temMais,
            proximoCursor
        }
    }
}

test('carrega automaticamente a primeira página e o resumo', async () => {
    const pagina = criarPagina()

    const service = {
        listarPagina: jest.fn().mockResolvedValue(pagina)
    }

    const {result} = await renderHook(() => useCycleHistory({service}))

    await waitFor(() => {
        expect(result.current.carregando).toBe(false)
    })

    expect(service.listarPagina).toHaveBeenCalledWith({
        limite: 20,
        signal: expect.anything()
    })

    expect(result.current.ciclos).toEqual([primeiroCiclo])
    expect(result.current.resumo).toBe(pagina.resumo)
    expect(result.current.quantidadeCiclos).toBe(1)
    expect(result.current.erro).toBeNull()
})

test('mostra resumo inicial seguro enquanto a primeira requisição está pendente', async () => {
    let resolver

    const service = {
        listarPagina: jest.fn(() => new Promise(resolve => {
            resolver = resolve
        }))
    }

    const {result} = await renderHook(() => useCycleHistory({service}))

    expect(result.current.carregando).toBe(true)

    expect(result.current.resumo).toEqual({
        cicloMedioDias: null,
        menstruacaoMediaDias: null,
        quantidadeCiclos: 0,
        confianca: 'baixa'
    })

    await act(async () => {
        resolver(criarPagina())
    })

    expect(result.current.carregando).toBe(false)
})

test('mostra erro amigável sem expor detalhes técnicos', async () => {
    const service = {
        listarPagina: jest.fn().mockRejectedValue(new Error('Falha privada do banco'))
    }

    const {result} = await renderHook(() => useCycleHistory({service}))

    await waitFor(() => {
        expect(result.current.carregando).toBe(false)
    })

    expect(result.current.erro).toBe('Não foi possível carregar seu histórico de ciclos. Tente novamente.')
    expect(result.current.erro).not.toContain('banco')
})

test('permite tentar o carregamento inicial novamente', async () => {
    const pagina = criarPagina()

    const service = {
        listarPagina: jest.fn()
            .mockRejectedValueOnce(new Error('Falha temporária'))
            .mockResolvedValueOnce(pagina)
    }

    const {result} = await renderHook(() => useCycleHistory({service}))

    await waitFor(() => {
        expect(result.current.erro).not.toBeNull()
    })

    await act(async () => {
        await result.current.tentarNovamente()
    })

    expect(service.listarPagina).toHaveBeenCalledTimes(2)
    expect(result.current.erro).toBeNull()
    expect(result.current.ciclos).toEqual([primeiroCiclo])
    expect(result.current.resumo).toBe(pagina.resumo)
})

test('carrega a próxima página e mantém os ciclos anteriores', async () => {
    const resumoAtualizado = criarResumo(2, {
        confianca: 'alta'
    })

    const service = {
        listarPagina: jest.fn()
            .mockResolvedValueOnce(criarPagina({
                quantidadeCiclos: 2,
                temMais: true,
                proximoCursor: 'cursor-seguro'
            }))
            .mockResolvedValueOnce(criarPagina({
                ciclos: [segundoCiclo],
                quantidadeCiclos: 2,
                resumo: resumoAtualizado
            }))
    }

    const {result} = await renderHook(() => useCycleHistory({service}))

    await waitFor(() => {
        expect(result.current.temMais).toBe(true)
    })

    await act(async () => {
        await result.current.carregarMais()
    })

    expect(service.listarPagina).toHaveBeenNthCalledWith(2, {
        limite: 20,
        cursor: 'cursor-seguro',
        signal: expect.anything()
    })

    expect(result.current.ciclos).toEqual([
        primeiroCiclo,
        segundoCiclo
    ])

    expect(result.current.resumo).toBe(resumoAtualizado)
    expect(result.current.temMais).toBe(false)
})

test('não repete um ciclo recebido em duas páginas', async () => {
    const service = {
        listarPagina: jest.fn()
            .mockResolvedValueOnce(criarPagina({
                quantidadeCiclos: 2,
                temMais: true,
                proximoCursor: 'cursor-seguro'
            }))
            .mockResolvedValueOnce(criarPagina({
                ciclos: [
                    primeiroCiclo,
                    segundoCiclo
                ],
                quantidadeCiclos: 2
            }))
    }

    const {result} = await renderHook(() => useCycleHistory({service}))

    await waitFor(() => {
        expect(result.current.temMais).toBe(true)
    })

    await act(async () => {
        await result.current.carregarMais()
    })

    expect(result.current.ciclos).toEqual([
        primeiroCiclo,
        segundoCiclo
    ])
})

test('impede duas requisições simultâneas da próxima página', async () => {
    let resolverSegundaPagina

    const service = {
        listarPagina: jest.fn()
            .mockResolvedValueOnce(criarPagina({
                quantidadeCiclos: 2,
                temMais: true,
                proximoCursor: 'cursor-seguro'
            }))
            .mockImplementationOnce(() => new Promise(resolve => {
                resolverSegundaPagina = resolve
            }))
    }

    const {result} = await renderHook(() => useCycleHistory({service}))

    await waitFor(() => {
        expect(result.current.temMais).toBe(true)
    })

    let primeiraRequisicao
    let segundaRequisicao

    await act(async () => {
        primeiraRequisicao = result.current.carregarMais()
        segundaRequisicao = result.current.carregarMais()
        await segundaRequisicao
    })

    await expect(segundaRequisicao).resolves.toBe(false)
    expect(service.listarPagina).toHaveBeenCalledTimes(2)

    await act(async () => {
        resolverSegundaPagina(criarPagina({
            ciclos: [segundoCiclo],
            quantidadeCiclos: 2
        }))

        await primeiraRequisicao
    })

    expect(result.current.ciclos).toEqual([
        primeiroCiclo,
        segundoCiclo
    ])
})

test('mantém os ciclos visíveis quando a próxima página falha', async () => {
    const service = {
        listarPagina: jest.fn()
            .mockResolvedValueOnce(criarPagina({
                quantidadeCiclos: 2,
                temMais: true,
                proximoCursor: 'cursor-seguro'
            }))
            .mockRejectedValueOnce(new Error('Falha de rede'))
    }

    const {result} = await renderHook(() => useCycleHistory({service}))

    await waitFor(() => {
        expect(result.current.temMais).toBe(true)
    })

    const resumoAnterior = result.current.resumo

    await act(async () => {
        await result.current.carregarMais()
    })

    expect(result.current.ciclos).toEqual([primeiroCiclo])
    expect(result.current.resumo).toBe(resumoAnterior)
    expect(result.current.erro).toBeNull()
    expect(result.current.erroCarregarMais).toBe('Não foi possível carregar seu histórico de ciclos. Tente novamente.')
})

test('encerra a sessão quando a API devolve erro 401', async () => {
    const falha = new Error('Sessão inválida')
    falha.status = 401

    const service = {
        listarPagina: jest.fn().mockRejectedValue(falha)
    }

    const onSessaoExpirada = jest.fn()

    const {result} = await renderHook(() => useCycleHistory({
        service,
        onSessaoExpirada
    }))

    await waitFor(() => {
        expect(result.current.carregando).toBe(false)
    })

    expect(onSessaoExpirada).toHaveBeenCalledWith({
        mensagem: 'Sua sessão expirou. Entre novamente.'
    })

    expect(result.current.erro).toBeNull()
})

test('cancela a requisição quando a tela é desmontada', async () => {
    let sinalRecebido

    const service = {
        listarPagina: jest.fn(({signal}) => {
            sinalRecebido = signal
            return new Promise(() => {})
        })
    }

    const {unmount} = await renderHook(() => useCycleHistory({service}))

    await waitFor(() => {
        expect(sinalRecebido).toBeDefined()
    })

    expect(sinalRecebido.aborted).toBe(false)

    await unmount()

    expect(sinalRecebido.aborted).toBe(true)
})