//Execute da raiz: node frontend/tests/features/calendar/benchmark.mjs [revisao-base]
import assert from 'node:assert/strict'
import {Buffer} from 'node:buffer'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {performance} from 'node:perf_hooks'

const caminho = 'frontend/src/features/calendar/utils/cycleCalendar.utils.js'
const base = process.argv[2] ?? 'HEAD'
const carregar = (fonte) => import(`data:text/javascript;base64,${Buffer.from(fonte).toString('base64')}`)
const anterior = await carregar(execFileSync('git', ['show', `${base}:${caminho}`], {encoding: 'utf8'}))
const atual = await carregar(readFileSync(caminho, 'utf8'))
const hoje = '2026-10-08'
const meses = Array.from({length: 121}, (_, indice) => {
    const mes = `${2016 + Math.floor(indice / 12)}-${String(indice % 12 + 1).padStart(2, '0')}`
    const intervalo = (inicio, fim) => ({inicio: `${mes}-${inicio}`, fim: `${mes}-${fim}`})
    return {
        mes,
        diasMenstruacao: [{data: `${mes}-01`, registroCicloId: indice + 1}],
        previsao: {
            faseMenstrual: intervalo('01', '05'),
            faseFolicular: intervalo('06', '14'),
            ovulacao: `${mes}-15`,
            faseLutea: intervalo('16', '28'),
            janelaFertil: intervalo('11', '16'),
            menstruacaoPrevista: intervalo('29', '31')
        }
    }
})

//Compara com a implementação original, inclusive bissextos e viradas de ano.
assert.deepEqual(atual.normalizarMeses(meses, hoje), anterior.normalizarMeses(meses, hoje))
const entradasInvalidas = [null, {}, {mes: '2026-13'}, {calendario: meses[0]}, meses[0], {
    mes: '2026-10', previsao: {faseMenstrual: {inicio: 2, fim: '2026-10-31'}}
}]
assert.deepEqual(atual.normalizarMeses(entradasInvalidas, hoje), anterior.normalizarMeses(entradasInvalidas, hoje))

function mediana(executar) {
    for (let i = 0; i < 30; i += 1) executar()
    const tempos = Array.from({length: 101}, () => {
        const inicio = performance.now()
        executar()
        return performance.now() - inicio
    }).sort((a, b) => a - b)
    return Number(tempos[50].toFixed(3))
}

const historico = meses.slice(0, 120)
const normalizar = atual.criarNormalizadorMeses(hoje)
const antesOriginal = anterior.normalizarMeses(historico, hoje)
const antesCache = normalizar(historico)
const depoisOriginal = anterior.normalizarMeses(meses, hoje)
const depoisCache = normalizar(meses)
const contarNovos = (antes, depois) => depois.filter((mes, i) => i < antes.length && mes !== antes[i]).length

console.log(JSON.stringify({
    ambiente: {node: process.version, plataforma: process.platform, arquitetura: process.arch},
    procedimento: 'Mediana de 101 amostras após 30 aquecimentos; tempos em ms; dados sintéticos; sem renderização nativa',
    equivalencia: '121 meses e 6 entradas inválidas/envelopadas/duplicadas comparados com git',
    montagem3Meses: {
        antes: mediana(() => anterior.normalizarMeses(meses.slice(0, 3), hoje)),
        depois: mediana(() => atual.criarNormalizadorMeses(hoje)(meses.slice(0, 3)))
    },
    paginacao120Para121: {
        antes: mediana(() => anterior.normalizarMeses([...historico, {...meses[120]}], hoje)),
        depois: mediana(() => normalizar([...historico, {...meses[120]}]))
    },
    mesesExistentesRecriados: {
        antes: contarNovos(antesOriginal, depoisOriginal),
        depois: contarNovos(antesCache, depoisCache)
    }
}, null, 2))
