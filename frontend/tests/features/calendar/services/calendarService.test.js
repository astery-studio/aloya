//Testa contrato, sessão autenticada e validação da resposta mensal do calendário.
import {criarCalendarService} from '../../../../src/features/calendar/services/calendarService'
import {endpoints} from '../../../../src/shared/services/api/endpoints'

function criarCalendario(alteracoes = {}) {
    return {
        mes: '2026-10',
        possuiCiclos: true,
        diasMenstruacao: [
            {
                data: '2026-10-04',
                registroCicloId: 12
            }
        ],
        previsao: {
            faseMenstrual: null,
            faseFolicular: {
                inicio: '2026-10-08',
                fim: '2026-10-17'
            },
            ovulacao: '2026-10-18',
            faseLutea: {
                inicio: '2026-10-19',
                fim: '2026-10-28'
            },
            janelaFertil: {
                inicio: '2026-10-13',
                fim: '2026-10-19'
            },
            menstruacaoPrevista: null
        },
        ...alteracoes
    }
}

describe('calendarService', () => {
    test('rejeita dependência ausente ou inválida', () => {
        expect(() => criarCalendarService({}))
            .toThrow('Não foi possível configurar o serviço do calendário.')

        expect(() => criarCalendarService({
            requisicaoAutenticada: 'inválida'
        })).toThrow('Não foi possível configurar o serviço do calendário.')
    })

    test('busca o mês pela rota autenticada e devolve o calendário', async () => {
        const calendario = criarCalendario()
        const requisicaoAutenticada = jest.fn().mockResolvedValue({calendario})
        const service = criarCalendarService({requisicaoAutenticada})

        await expect(service.buscarMes({mes: '2026-10'}))
            .resolves.toEqual(calendario)

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            caminho: `${endpoints.calendario}?mes=2026-10`,
            signal: undefined
        })
    })

    test('repassa o sinal para cancelar uma requisição', async () => {
        const signal = new AbortController().signal
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            calendario: criarCalendario()
        })
        const service = criarCalendarService({requisicaoAutenticada})

        await service.buscarMes({mes: '2026-10', signal})

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            caminho: `${endpoints.calendario}?mes=2026-10`,
            signal
        })
    })

    test.each([
        undefined,
        null,
        '',
        '2026-00',
        '2026-13',
        '26-10',
        '2026-10-01'
    ])('rejeita mês inválido antes de chamar a API: %p', async mes => {
        const requisicaoAutenticada = jest.fn()
        const service = criarCalendarService({requisicaoAutenticada})

        await expect(service.buscarMes({mes}))
            .rejects.toMatchObject({
                codigo: 'MES_CALENDARIO_INVALIDO',
                mensagemUsuario: 'Informe o mês no formato AAAA-MM.'
            })

        expect(requisicaoAutenticada).not.toHaveBeenCalled()
    })

    test('rejeita uma resposta mensal incompatível com o contrato', async () => {
        const service = criarCalendarService({
            requisicaoAutenticada: jest.fn().mockResolvedValue({
                calendario: {
                    mes: '2026-09',
                    possuiCiclos: true,
                    diasMenstruacao: [],
                    previsao: null
                }
            })
        })

        await expect(service.buscarMes({mes: '2026-10'}))
            .rejects.toMatchObject({
                codigo: 'RESPOSTA_CALENDARIO_INVALIDA',
                mensagemUsuario: 'Não foi possível carregar os dados do calendário. Tente novamente.'
            })
    })

    test('propaga o erro da API sem substituí-lo', async () => {
        const erroApi = new Error('Sua sessão expirou.')
        erroApi.status = 401
        erroApi.codigo = 'NAO_AUTENTICADO'

        const service = criarCalendarService({
            requisicaoAutenticada: jest.fn().mockRejectedValue(erroApi)
        })

        await expect(service.buscarMes({mes: '2026-10'}))
            .rejects.toBe(erroApi)
    })

    test('aceita mês sem ciclos e previsão vazia', async () => {
        const calendario = {
            mes: '2026-10',
            possuiCiclos: false,
            diasMenstruacao: [],
            previsao: null
        }
        const service = criarCalendarService({
            requisicaoAutenticada: jest.fn().mockResolvedValue({calendario})
        })

        await expect(service.buscarMes({mes: '2026-10'}))
            .resolves.toEqual(calendario)
    })
})