import {criarNormalizadorMeses, normalizarMeses} from '../../../../src/features/calendar/utils/cycleCalendar.utils'

const hoje = '2026-10-08'

test('reutiliza meses existentes ao paginar nas duas direções', () => {
    const normalizar = criarNormalizadorMeses(hoje)
    const outubro = {mes: '2026-10'}
    const inicial = normalizar([outubro])
    const paginado = normalizar([{mes: '2026-09'}, outubro, {mes: '2026-11'}])

    expect(paginado[1]).toBe(inicial[0])
    expect(normalizar([{calendario: outubro}])[0]).toBe(inicial[0])
    expect(normalizar([])).toEqual([])
    expect(normalizar(null)).toEqual([])
})

test('substitui dados editados sem invalidar outros meses', () => {
    const normalizar = criarNormalizadorMeses(hoje)
    const setembro = {mes: '2026-09'}
    const outubro = {mes: '2026-10'}
    const inicial = normalizar([setembro, outubro])
    const atualizado = {...outubro, diasMenstruacao: [{data: '2026-10-01', registroCicloId: 18}]}
    const resultado = normalizar([setembro, atualizado])

    expect(resultado[0]).toBe(inicial[0])
    expect(resultado[1]).not.toBe(inicial[1])
    expect(resultado).toEqual(normalizarMeses([setembro, atualizado], hoje))
})

test('mantém caches independentes por instância e por data local', () => {
    const entrada = [{mes: '2026-10'}]
    const primeiro = criarNormalizadorMeses(hoje)(entrada)
    const segundo = criarNormalizadorMeses('2026-10-09')(entrada)
    expect(primeiro).not.toEqual(segundo)
    expect(criarNormalizadorMeses(hoje)(entrada)[0]).not.toBe(primeiro[0])
})

test.each(['2024-02', '2025-02', '2026-12', '2027-01', '0099-02', '1900-02', '2000-02'])(
    'preserva datas, semanas e duplicatas em %s', (mes) => {
        const normalizar = criarNormalizadorMeses(hoje)
        const entradas = [null, {}, {mes}, {calendario: {mes, possuiCiclos: true}}]
        expect(normalizar(entradas)).toEqual(normalizarMeses(entradas, hoje))
        expect(normalizar(entradas)).toEqual(normalizarMeses(entradas, hoje))
    }
)

test('ignora intervalos malformados e mantém prioridade das marcações', () => {
    const [mes] = normalizarMeses([{
        mes: '2026-10',
        previsao: {
            menstruacaoPrevista: {inicio: '2026-10-01', fim: 'invalido'},
            faseMenstrual: {inicio: 1, fim: '2026-10-31'},
            faseFolicular: {inicio: '2026-10-01', fim: '2026-10-02'},
            janelaFertil: {inicio: '2026-10-02', fim: '2026-10-01'}
        }
    }], hoje)
    expect(mes.semanas.flat().find((dia) => dia?.dia === 1)).toMatchObject({
        tipo: 'folicular', janelaFertil: false
    })
})
