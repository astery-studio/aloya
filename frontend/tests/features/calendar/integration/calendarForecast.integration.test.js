//Integra backend ESM em outro processo com frontend e grade reais, sem banco ou HTTP.
/* global __dirname */
import {execFileSync} from 'node:child_process'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import React from 'react'
import {render, screen} from '@testing-library/react-native'
import {criarCalendarService as criarFrontendCalendarService} from '../../../../src/features/calendar/services/calendarService'
import {CycleMonth} from '../../../../src/features/calendar/components/CycleCalendar/CycleMonth'
import {normalizarMes, TIPOS_DIA} from '../../../../src/features/calendar/utils/cycleCalendar.utils'

const HOJE = '2026-10-09'
const MODULO_BACKEND = pathToFileURL(resolve(
    __dirname,
    '../../../../../backend/src/features/calendar/services/calendar.service.js'
)).href

function buscarCalendarioBackend(parametros) {
    //O backend executa no Node nativo, sem depender da transformação Babel do Expo.
    const script = `
        import {criarCalendarService} from ${JSON.stringify(MODULO_BACKEND)};
        const parametros = ${JSON.stringify(parametros)};
        const consultas = [];
        const repository = {
            async buscarDadosDoMes(argumentos) {
                consultas.push(argumentos);
                return {
                    usuario: {
                        duracaoCicloInformada: 28,
                        duracaoMenstruacaoInformada: parametros.duracaoMenstruacao,
                        duracaoLuteaInformada: 14,
                        _count: {registrosCiclo: 1},
                        registrosCiclo: [{
                            id: 18,
                            dataInicio: new Date(parametros.inicio + 'T00:00:00.000Z'),
                            dataFim: new Date(parametros.fim + 'T00:00:00.000Z')
                        }]
                    },
                    diasMenstruacao: []
                };
            }
        };
        const backend = criarCalendarService({repository});
        const calendario = await backend.buscarMes({usuarioId: 7, mes: parametros.mes});
        process.stdout.write(JSON.stringify({calendario, consultas}));
    `

    const saida = execFileSync(process.execPath, ['--input-type=module'], {
        input: script,
        encoding: 'utf8',
        timeout: 10000,
        windowsHide: true
    })

    return JSON.parse(saida)
}

function criarIntegracao({inicio, fim, duracaoMenstruacao}) {
    const consultas = []
    const requisicaoAutenticada = jest.fn(async ({caminho}) => {
        const mes = decodeURIComponent(caminho.split('?mes=')[1])
        const resposta = buscarCalendarioBackend({mes, inicio, fim, duracaoMenstruacao})
        consultas.push(...resposta.consultas)
        return {calendario: resposta.calendario}
    })
    const frontend = criarFrontendCalendarService({requisicaoAutenticada})

    async function buscarMesNormalizado(mes) {
        const calendario = await frontend.buscarMes({mes})
        return normalizarMes(calendario, HOJE)
    }

    return {buscarMesNormalizado, consultas, requisicaoAutenticada}
}

function localizarDia(mes, numero) {
    return mes.semanas.flat().find(dia => dia?.dia === numero)
}

describe('previsão do backend até a grade do calendário', () => {
    test('mantém as fases depois da menstruação que atravessa setembro e outubro', async () => {
        const integracao = criarIntegracao({
            inicio: '2026-09-01',
            fim: '2026-09-07',
            duracaoMenstruacao: 7
        })
        const outubro = await integracao.buscarMesNormalizado('2026-10')

        expect(integracao.requisicaoAutenticada).toHaveBeenCalledWith({
            caminho: '/api/cycles/calendar?mes=2026-10',
            signal: undefined
        })
        expect(integracao.consultas).toEqual([{
            usuarioId: 7,
            inicioMes: '2026-10-01T00:00:00.000Z',
            fimMesExclusivo: '2026-11-01T00:00:00.000Z'
        }])
        for (const dia of [1, 2, 3, 4, 5, 27, 28, 29, 30, 31]) {
            expect(localizarDia(outubro, dia)).toMatchObject({
                tipo: TIPOS_DIA.menstruacao,
                previsto: true,
                registroCicloId: null
            })
        }
        expect(localizarDia(outubro, 6)).toMatchObject({tipo: TIPOS_DIA.folicular, previsto: true})
        expect(localizarDia(outubro, 12)).toMatchObject({
            tipo: TIPOS_DIA.ovulacao,
            previsto: true,
            janelaFertil: true,
            janelaFertilPrevista: true
        })
        expect(localizarDia(outubro, 13)).toMatchObject({tipo: TIPOS_DIA.lutea, previsto: true})

        await render(<CycleMonth mes={outubro} />)

        expect(screen.getByLabelText('Dia 5 de outubro de 2026, provável menstruação')).toBeOnTheScreen()
        expect(screen.getByLabelText('Dia 6 de outubro de 2026, provável fase folicular')).toBeOnTheScreen()
        expect(screen.getByLabelText('Dia 12 de outubro de 2026, provável ovulação, provável janela fértil')).toBeOnTheScreen()
        expect(screen.getByLabelText('Dia 13 de outubro de 2026, provável fase lútea')).toBeOnTheScreen()
        expect(screen.getByTestId('fundo-dia-2026-10-06')).toHaveStyle({
            backgroundColor: 'rgba(44, 76, 59, 0.56)'
        })
        expect(screen.queryAllByRole('button')).toHaveLength(0)
    })

    test('continua prevendo os ciclos seguintes e suas fases ao atravessar novos meses', async () => {
        const integracao = criarIntegracao({
            inicio: '2026-09-01',
            fim: '2026-09-07',
            duracaoMenstruacao: 7
        })
        const novembro = await integracao.buscarMesNormalizado('2026-11')
        const dezembro = await integracao.buscarMesNormalizado('2026-12')

        expect(localizarDia(novembro, 2)).toMatchObject({tipo: TIPOS_DIA.menstruacao, previsto: true})
        expect(localizarDia(novembro, 3)).toMatchObject({tipo: TIPOS_DIA.folicular, previsto: true})
        expect(localizarDia(novembro, 30)).toMatchObject({tipo: TIPOS_DIA.menstruacao, previsto: true})
        expect(localizarDia(dezembro, 1)).toMatchObject({tipo: TIPOS_DIA.folicular, previsto: true})

        await render(<><CycleMonth mes={novembro} /><CycleMonth mes={dezembro} /></>)

        expect(screen.getByLabelText('Dia 3 de novembro de 2026, provável fase folicular')).toBeOnTheScreen()
        expect(screen.getByLabelText('Dia 30 de novembro de 2026, provável menstruação')).toBeOnTheScreen()
        expect(screen.getByLabelText('Dia 1 de dezembro de 2026, provável fase folicular')).toBeOnTheScreen()
    })

    test('mostra as fases após uma previsão que começa dentro do próprio mês', async () => {
        const integracao = criarIntegracao({
            inicio: '2026-09-04',
            fim: '2026-09-08',
            duracaoMenstruacao: 5
        })
        const outubro = await integracao.buscarMesNormalizado('2026-10')

        expect(localizarDia(outubro, 6)).toMatchObject({tipo: TIPOS_DIA.menstruacao, previsto: true})
        expect(localizarDia(outubro, 7)).toMatchObject({tipo: TIPOS_DIA.folicular, previsto: true})
        expect(localizarDia(outubro, 15)).toMatchObject({tipo: TIPOS_DIA.ovulacao, previsto: true})

        await render(<CycleMonth mes={outubro} />)

        expect(screen.getByLabelText('Dia 7 de outubro de 2026, provável fase folicular')).toBeOnTheScreen()
        expect(screen.getByLabelText('Dia 15 de outubro de 2026, provável ovulação, provável janela fértil')).toBeOnTheScreen()
    })
})
