//Testa a preparação eficiente dos dados mensais usados pelo calendário.
import {
    TIPOS_DIA,
    normalizarMes,
    normalizarMeses,
    obterHojeLocal
} from '../../../../src/features/calendar/utils/cycleCalendar.utils'

function localizarDia(mes, numero) {
    return mes.semanas.flat().find((dia) => dia?.dia === numero)
}

describe('cycleCalendar.utils', () => {
    test('obtém a data local sem depender da conversão UTC', () => {
        const data = new Date(2026, 9, 3, 23, 30)

        expect(obterHojeLocal(data)).toBe('2026-10-03')
    })

    test('monta as semanas e o título do mês', () => {
        const mes = normalizarMes({
            mes: '2026-10',
            possuiCiclos: false,
            diasMenstruacao: [],
            previsao: null
        }, '2026-10-03')

        expect(mes.titulo).toBe('Outubro 2026')
        expect(mes.semanas).toHaveLength(5)
        expect(mes.semanas.every((semana) => semana.length === 7)).toBe(true)
        expect(localizarDia(mes, 1).data).toBe('2026-10-01')
        expect(localizarDia(mes, 31).data).toBe('2026-10-31')
    })

    test('prioriza a menstruação registrada e preserva o ciclo editável', () => {
        const mes = normalizarMes({
            mes: '2026-10',
            possuiCiclos: true,
            diasMenstruacao: [
                {
                    data: '2026-10-01',
                    registroCicloId: 18
                },
                {
                    data: '2026-10-02',
                    registroCicloId: 18
                }
            ],
            previsao: {
                faseMenstrual: {
                    inicio: '2026-10-01',
                    fim: '2026-10-05'
                }
            }
        }, '2026-10-03')

        expect(localizarDia(mes, 1)).toMatchObject({
            tipo: TIPOS_DIA.menstruacao,
            previsto: false,
            futuro: false,
            registroCicloId: 18,
            inicioSegmento: true,
            fimSegmento: false
        })

        expect(localizarDia(mes, 2)).toMatchObject({
            tipo: TIPOS_DIA.menstruacao,
            previsto: false,
            registroCicloId: 18,
            inicioSegmento: false,
            fimSegmento: false
        })

        expect(localizarDia(mes, 3)).toMatchObject({
            tipo: TIPOS_DIA.menstruacao,
            previsto: false,
            registroCicloId: null,
            inicioSegmento: false,
            fimSegmento: true
        })

        expect(localizarDia(mes, 4)).toMatchObject({
            tipo: TIPOS_DIA.menstruacao,
            previsto: true,
            inicioSegmento: true,
            fimSegmento: false
        })

        expect(localizarDia(mes, 5)).toMatchObject({
            tipo: TIPOS_DIA.menstruacao,
            previsto: true,
            inicioSegmento: false,
            fimSegmento: true
        })
    })

    test('transforma fases futuras em marcações previstas', () => {
        const mes = normalizarMes({
            mes: '2026-10',
            possuiCiclos: true,
            diasMenstruacao: [],
            previsao: {
                faseFolicular: {
                    inicio: '2026-10-03',
                    fim: '2026-10-05'
                },
                ovulacao: '2026-10-06',
                faseLutea: {
                    inicio: '2026-10-07',
                    fim: '2026-10-09'
                },
                janelaFertil: {
                    inicio: '2026-10-04',
                    fim: '2026-10-07'
                },
                menstruacaoPrevista: {
                    inicio: '2026-10-10',
                    fim: '2026-10-12'
                }
            }
        }, '2026-10-03')

        expect(localizarDia(mes, 3)).toMatchObject({
            tipo: TIPOS_DIA.folicular,
            previsto: false,
            futuro: false
        })

        expect(localizarDia(mes, 4)).toMatchObject({
            tipo: TIPOS_DIA.folicular,
            previsto: true,
            futuro: true,
            janelaFertil: true,
            janelaFertilPrevista: true
        })

        expect(localizarDia(mes, 6)).toMatchObject({
            tipo: TIPOS_DIA.ovulacao,
            previsto: true
        })

        expect(localizarDia(mes, 7)).toMatchObject({
            tipo: TIPOS_DIA.lutea,
            previsto: true,
            janelaFertil: true
        })

        expect(localizarDia(mes, 10)).toMatchObject({
            tipo: TIPOS_DIA.menstruacao,
            previsto: true
        })
    })

    test('mantém dias futuros sem marcação desativados visualmente', () => {
        const mes = normalizarMes({
            mes: '2026-10',
            possuiCiclos: false,
            diasMenstruacao: [],
            previsao: null
        }, '2026-10-03')

        expect(localizarDia(mes, 4)).toMatchObject({
            tipo: null,
            futuro: true,
            registroCicloId: null
        })
    })

    test('mostra todas as fases de múltiplos períodos sem transformar previsão passada em registro', () => {
        const mes = normalizarMes({
            mes: '2026-10',
            possuiCiclos: true,
            diasMenstruacao: [{data: '2026-10-02', registroCicloId: 18}],
            previsao: {
                periodos: [
                    {
                        previsto: true,
                        menstruacaoPrevista: {inicio: '2026-10-01', fim: '2026-10-05'},
                        faseFolicular: {inicio: '2026-10-06', fim: '2026-10-11'},
                        ovulacao: '2026-10-12',
                        faseLutea: {inicio: '2026-10-13', fim: '2026-10-26'},
                        janelaFertil: {inicio: '2026-10-07', fim: '2026-10-12'}
                    },
                    {
                        previsto: true,
                        menstruacaoPrevista: {inicio: '2026-10-27', fim: '2026-10-29'},
                        faseFolicular: {inicio: '2026-10-30', fim: '2026-10-31'}
                    }
                ]
            }
        }, '2026-10-09')

        expect(localizarDia(mes, 2)).toMatchObject({tipo: 'menstruacao', previsto: false, registroCicloId: 18})
        expect(localizarDia(mes, 6)).toMatchObject({tipo: 'folicular', previsto: true, futuro: false})
        expect(localizarDia(mes, 7)).toMatchObject({janelaFertil: true, janelaFertilPrevista: true})
        expect(localizarDia(mes, 12)).toMatchObject({tipo: 'ovulacao', previsto: true})
        expect(localizarDia(mes, 13)).toMatchObject({tipo: 'lutea', previsto: true})
        expect(localizarDia(mes, 27)).toMatchObject({tipo: 'menstruacao', previsto: true})
        expect(localizarDia(mes, 30)).toMatchObject({tipo: 'folicular', previsto: true})
        expect(mes.semanas.flat().filter(Boolean).every(dia => dia.tipo !== null)).toBe(true)
    })

    test('ignora períodos malformados e não reaproveita intervalos antigos quando a lista vem vazia', () => {
        for (const periodos of [[], [null, undefined, 'inválido', {}]]) {
            const mes = normalizarMes({
                mes: '2026-10',
                diasMenstruacao: [],
                previsao: {
                    faseFolicular: {inicio: '2026-10-01', fim: '2026-10-31'},
                    periodos
                }
            }, '2026-10-09')

            expect(mes.semanas.flat().filter(Boolean).every(dia => dia.tipo === null)).toBe(true)
        }
    })

    test('aceita a resposta ainda envelopada pelo contrato da API', () => {
        const mes = normalizarMes({
            calendario: {
                mes: '2026-09',
                possuiCiclos: false,
                diasMenstruacao: [],
                previsao: null
            }
        }, '2026-10-03')

        expect(mes.chave).toBe('2026-09')
        expect(mes.titulo).toBe('Setembro 2026')
    })

    test('remove meses duplicados e mantém a ordem cronológica', () => {
        const meses = normalizarMeses([
            {
                mes: '2026-10',
                possuiCiclos: false,
                diasMenstruacao: [],
                previsao: null
            },
            {
                mes: '2026-09',
                possuiCiclos: false,
                diasMenstruacao: [],
                previsao: null
            },
            {
                mes: '2026-10',
                possuiCiclos: true,
                diasMenstruacao: [],
                previsao: null
            }
        ], '2026-10-03')

        expect(meses.map(({chave}) => chave)).toEqual([
            '2026-09',
            '2026-10'
        ])

        expect(meses[1].possuiCiclos).toBe(true)
    })

    test.each([
        undefined,
        null,
        {},
        {
            mes: '2026-13'
        }
    ])('ignora mês inválido sem quebrar a lista', (entrada) => {
        expect(normalizarMes(entrada, '2026-10-03')).toBeNull()
    })
})
