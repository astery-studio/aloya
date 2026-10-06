//Testa paginação, formatação e validação defensiva do serviço do histórico.
import {criarCycleHistoryService, normalizarCicloHistorico} from '../../../../src/features/cycles/services/cycleHistoryService'

const cicloApi = Object.freeze({
    id: 3,
    numero: 3,
    dataInicio: '2026-09-04',
    dataFim: null,
    diasMenstruais: 4,
    duracaoDias: 28,
    status: 'emAndamento',
    classificacao: 'normal',
    estimativaIncerta: false,
    cicloInicial: false
})

function criarRespostaApi(alteracoes = {}) {
    return {
        ciclos: [cicloApi],
        quantidadeCiclos: 3,
        paginacao: {
            limite: 20,
            temMais: false,
            proximoCursor: null
        },
        ...alteracoes
    }
}

test('converte um ciclo em andamento para o formato visual da tela', () => {
    expect(normalizarCicloHistorico(cicloApi)).toEqual({
        id: '3',
        numero: 3,
        periodo: '04 Set até hoje',
        dataInicio: '2026-09-04',
        dataFim: null,
        diasMenstruais: 4,
        duracaoDias: 28,
        status: 'emAndamento',
        classificacao: 'normal',
        estimativaIncerta: false,
        cicloInicial: false
    })
})

test('transforma ciclo irregular na variante visual incerta', () => {
    const ciclo = normalizarCicloHistorico({
        ...cicloApi,
        id: 2,
        numero: 2,
        dataInicio: '2026-08-07',
        dataFim: '2026-09-03',
        status: 'concluido',
        classificacao: 'irregular',
        estimativaIncerta: true
    })

    expect(ciclo.periodo).toBe('07 Ago até 03 Set')
    expect(ciclo.status).toBe('incerto')
})

test('não altera datas por causa do fuso horário do aparelho', () => {
    const ciclo = normalizarCicloHistorico({
        ...cicloApi,
        dataInicio: '2026-01-01',
        dataFim: '2026-01-28',
        status: 'concluido'
    })

    expect(ciclo.periodo).toBe('01 Jan até 28 Jan')
})

test('lista a primeira página usando autenticação', async () => {
    const requisicaoAutenticada = jest.fn().mockResolvedValue(criarRespostaApi())
    const service = criarCycleHistoryService({requisicaoAutenticada})

    const resultado = await service.listarPagina()

    expect(requisicaoAutenticada).toHaveBeenCalledWith({
        caminho: '/api/cycles/history?limit=20'
    })

    expect(resultado.ciclos).toHaveLength(1)
    expect(resultado.quantidadeCiclos).toBe(3)
    expect(Object.isFrozen(resultado)).toBe(true)
    expect(Object.isFrozen(resultado.ciclos)).toBe(true)
    expect(Object.isFrozen(resultado.paginacao)).toBe(true)
})

test('envia cursor codificado e sinal de cancelamento', async () => {
    const requisicaoAutenticada = jest.fn().mockResolvedValue(criarRespostaApi({
        ciclos: [],
        paginacao: {
            limite: 10,
            temMais: false,
            proximoCursor: null
        }
    }))

    const service = criarCycleHistoryService({requisicaoAutenticada})
    const controlador = new AbortController()

    await service.listarPagina({
        limite: 10,
        cursor: 'eyJ2IjoxfQ',
        signal: controlador.signal
    })

    expect(requisicaoAutenticada).toHaveBeenCalledWith({
        caminho: '/api/cycles/history?limit=10&cursor=eyJ2IjoxfQ',
        signal: controlador.signal
    })
})

test.each([
    0,
    51,
    1.5,
    '20'
])('rejeita limite inválido antes da requisição: %p', async limite => {
    const requisicaoAutenticada = jest.fn()
    const service = criarCycleHistoryService({requisicaoAutenticada})

    await expect(service.listarPagina({limite})).rejects.toThrow('O limite deve ser um número inteiro entre 1 e 50.')
    expect(requisicaoAutenticada).not.toHaveBeenCalled()
})

test.each([
    '',
    'cursor com espaços',
    'a'.repeat(257)
])('rejeita cursor inválido antes da requisição', async cursor => {
    const requisicaoAutenticada = jest.fn()
    const service = criarCycleHistoryService({requisicaoAutenticada})

    await expect(service.listarPagina({cursor})).rejects.toThrow('O cursor do histórico é inválido.')
    expect(requisicaoAutenticada).not.toHaveBeenCalled()
})

test('rejeita datas inexistentes na resposta da API', () => {
    expect(() => normalizarCicloHistorico({
        ...cicloApi,
        dataInicio: '2026-02-30'
    })).toThrow('Não foi possível interpretar o histórico de ciclos.')
})

test('rejeita resposta malformada sem quebrar a tela silenciosamente', async () => {
    const requisicaoAutenticada = jest.fn().mockResolvedValue({
        ciclos: 'dados inválidos',
        quantidadeCiclos: 3,
        paginacao: {}
    })

    const service = criarCycleHistoryService({requisicaoAutenticada})

    await expect(service.listarPagina()).rejects.toMatchObject({
        codigo: 'RESPOSTA_HISTORICO_INVALIDA',
        mensagemUsuario: 'Não foi possível interpretar o histórico de ciclos.'
    })
})

test('preserva erros de autenticação devolvidos pela requisição', async () => {
    const erro = new Error('Sua sessão expirou.')
    erro.status = 401
    erro.codigo = 'SESSAO_INVALIDA'

    const requisicaoAutenticada = jest.fn().mockRejectedValue(erro)
    const service = criarCycleHistoryService({requisicaoAutenticada})

    await expect(service.listarPagina()).rejects.toBe(erro)
})

test('rejeita criação sem requisição autenticada', () => {
    expect(() => criarCycleHistoryService()).toThrow('Não foi possível configurar o serviço do histórico de ciclos.')
})