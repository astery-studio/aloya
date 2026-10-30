//Testa carregamento, paginação, erros e cancelamento do calendário.
import {act, renderHook, waitFor} from '@testing-library/react-native'
import {obterChaveMes, useCalendar} from '../../../../src/features/calendar/hooks/useCalendar'

function criarCalendario(mes) {
    return {
        mes,
        possuiCiclos: true,
        diasMenstruacao: [],
        previsao: null
    }
}

function obterMesAnterior(mes) {
    const [ano, numeroMes] = mes.split('-').map(Number)
    const data = new Date(0)
    data.setFullYear(ano, numeroMes - 2, 1)

    return `${String(data.getFullYear()).padStart(4, '0')}-${String(data.getMonth() + 1).padStart(2, '0')}`
}

function obterMesPosterior(mes) {
    const [ano, numeroMes] = mes.split('-').map(Number)
    const data = new Date(0)
    data.setFullYear(ano, numeroMes, 1)

    return `${String(data.getFullYear()).padStart(4, '0')}-${String(data.getMonth() + 1).padStart(2, '0')}`
}

describe('useCalendar', () => {
    test('busca o mês atual e prepara o mês seguinte para permitir rolagem futura', async () => {
        const mesAtual = obterChaveMes()
        const mesSeguinte = obterMesPosterior(mesAtual)
        const service = {
            buscarMes: jest.fn(async ({mes}) => criarCalendario(mes))
        }
        const {result} = await renderHook(() => useCalendar({service}))

        await waitFor(() => {
            expect(result.current.carregando).toBe(false)
            expect(result.current.carregandoPosteriores).toBe(false)
            expect(result.current.meses).toEqual([
                criarCalendario(mesAtual),
                criarCalendario(mesSeguinte)
            ])
        })

        expect(service.buscarMes).toHaveBeenCalledWith({
            mes: mesAtual,
            signal: expect.any(AbortSignal)
        })
        expect(service.buscarMes).toHaveBeenCalledWith({
            mes: mesSeguinte,
            signal: expect.any(AbortSignal)
        })
    })

    test('carrega e ordena meses anteriores e posteriores', async () => {
        const mesAtual = obterChaveMes()
        const service = {
            buscarMes: jest.fn(async ({mes}) => criarCalendario(mes))
        }
        const {result} = await renderHook(() => useCalendar({service}))

        await waitFor(() => expect(result.current.carregando).toBe(false))
        await waitFor(() => expect(result.current.meses).toHaveLength(2))

        await act(async () => {
            await result.current.carregarAnteriores()
        })

        await act(async () => {
            await result.current.carregarPosteriores()
        })

        expect(result.current.meses.map(mes => mes.mes)).toEqual([
            obterMesAnterior(mesAtual),
            mesAtual,
            obterMesPosterior(mesAtual),
            obterMesPosterior(obterMesPosterior(mesAtual))
        ])
        expect(result.current.carregandoAnteriores).toBe(false)
        expect(result.current.carregandoPosteriores).toBe(false)
    })

    test('mantém meses visíveis quando a paginação falha e permite tentar novamente', async () => {
        const mesAtual = obterChaveMes()
        const mesAnterior = obterMesAnterior(mesAtual)
        const service = {
            buscarMes: jest.fn()
                .mockResolvedValueOnce(criarCalendario(mesAtual))
                .mockResolvedValueOnce(criarCalendario(obterMesPosterior(mesAtual)))
                .mockRejectedValueOnce(new Error('Falha de rede.'))
                .mockResolvedValueOnce(criarCalendario(mesAnterior))
        }
        const {result} = await renderHook(() => useCalendar({service}))

        await waitFor(() => expect(result.current.carregando).toBe(false))
        await waitFor(() => expect(result.current.meses).toHaveLength(2))

        await act(async () => {
            await result.current.carregarAnteriores()
        })

        expect(result.current.meses).toEqual([
            criarCalendario(mesAtual),
            criarCalendario(obterMesPosterior(mesAtual))
        ])
        expect(result.current.erro).toBe('Não foi possível carregar os dados do calendário. Tente novamente.')

        await act(async () => {
            await result.current.tentarNovamente()
        })

        expect(result.current.meses.map(mes => mes.mes)).toEqual([
            mesAnterior,
            mesAtual,
            obterMesPosterior(mesAtual)
        ])
        expect(result.current.erro).toBeNull()
    })

    test('encerra a sessão quando a API informa token inválido', async () => {
        const mesAtual = obterChaveMes()
        const onSessaoExpirada = jest.fn()
        const erro = new Error('Sessão inválida.')
        erro.status = 401
        erro.codigo = 'TOKEN_INVALIDO'

        const service = {
            buscarMes: jest.fn().mockRejectedValue(erro)
        }
        const {result} = await renderHook(() => useCalendar({
            service,
            onSessaoExpirada
        }))

        await waitFor(() => expect(result.current.carregando).toBe(false))

        expect(onSessaoExpirada).toHaveBeenCalledTimes(1)
        expect(result.current.meses).toEqual([])
        expect(result.current.erro).toBeNull()
        expect(service.buscarMes).toHaveBeenCalledWith({
            mes: mesAtual,
            signal: expect.any(AbortSignal)
        })
    })

    test('cancela requisições pendentes ao desmontar', async () => {
        let sinalRecebido
        const service = {
            buscarMes: jest.fn(({signal}) => {
                sinalRecebido = signal
                return new Promise(() => {})
            })
        }
        const {unmount} = await renderHook(() => useCalendar({service}))

        expect(sinalRecebido).toBeDefined()
        expect(sinalRecebido.aborted).toBe(false)

        await act(async () => {
            unmount()
        })

        expect(sinalRecebido.aborted).toBe(true)
    })

    test('mostra erro e encerra o carregamento se não receber um serviço válido', async () => {
        const {result} = await renderHook(() => useCalendar())

        await waitFor(() => expect(result.current.carregando).toBe(false))

        expect(result.current.meses).toEqual([])
        expect(result.current.erro).toBe('Não foi possível carregar os dados do calendário. Tente novamente.')
    })
})
