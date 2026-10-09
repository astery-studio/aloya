//Verifica a continuidade das previsões mensais usando as regras existentes de cálculo.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCalendarService } from '../../../../src/features/calendar/services/calendar.service.js';
import { calcularPrevisao } from '../../../../src/features/cycles/utils/prediction.js';
import { estimarFases } from '../../../../src/features/cycles/utils/prediction.phases.js';
import { adicionarDias } from '../../../../src/features/cycles/utils/calendar.js';

function criarCenario({
    inicio = '2026-09-04',
    fim = '2026-09-08',
    duracaoCiclo = 28,
    duracaoMenstruacao = 5,
    duracaoLutea = 14,
    registrosCiclo
} = {}) {
    const registros = registrosCiclo ?? [{id: 1, dataInicio: inicio, dataFim: fim}];
    const parametros = {
        duracaoCicloInformada: duracaoCiclo,
        duracaoMenstruacaoInformada: duracaoMenstruacao,
        duracaoLuteaInformada: duracaoLutea
    };
    const chamadas = [];
    const service = criarCalendarService({
        repository: {
            async buscarDadosDoMes(argumentos) {
                chamadas.push(argumentos);
                return {
                    usuario: {
                        ...parametros,
                        registrosCiclo: registros,
                        _count: {registrosCiclo: registros.length}
                    },
                    diasMenstruacao: []
                };
            }
        }
    });

    return {service, parametros, registros, chamadas};
}

function obterLimites(mes) {
    const [ano, numeroMes] = mes.split('-').map(Number);
    return {
        inicio: `${mes}-01`,
        fim: new Date(Date.UTC(ano, numeroMes, 0)).toISOString().slice(0, 10)
    };
}

function recortar(intervalo, mes) {
    const limites = obterLimites(mes);
    if (!intervalo || intervalo.fim < limites.inicio || intervalo.inicio > limites.fim) {
        return null;
    }
    return {
        inicio: intervalo.inicio < limites.inicio ? limites.inicio : intervalo.inicio,
        fim: intervalo.fim > limites.fim ? limites.fim : intervalo.fim
    };
}

function verificarCobertura(periodos, mes, inicioEsperado = `${mes}-01`) {
    const limites = obterLimites(mes);
    const diasCobertos = new Set();
    const camposIntervalo = [
        'faseMenstrual',
        'faseFolicular',
        'faseLutea',
        'menstruacaoPrevista'
    ];

    assert.ok(Array.isArray(periodos), 'A previsão mensal deve incluir seus períodos.');
    for (const periodo of periodos) {
        for (const campo of [...camposIntervalo, 'janelaFertil']) {
            const intervalo = periodo[campo];
            if (!intervalo) {
                continue;
            }
            assert.ok(intervalo.inicio >= limites.inicio, `${campo} começa fora do mês.`);
            assert.ok(intervalo.fim <= limites.fim, `${campo} termina fora do mês.`);
            assert.ok(intervalo.inicio <= intervalo.fim, `${campo} possui intervalo invertido.`);
            if (campo === 'janelaFertil') {
                continue;
            }
            for (let data = intervalo.inicio; data <= intervalo.fim; data = adicionarDias(data, 1)) {
                assert.ok(!diasCobertos.has(data), `O dia ${data} recebeu duas fases.`);
                diasCobertos.add(data);
            }
        }
        if (periodo.ovulacao) {
            assert.ok(periodo.ovulacao >= limites.inicio && periodo.ovulacao <= limites.fim);
            assert.ok(!diasCobertos.has(periodo.ovulacao));
            diasCobertos.add(periodo.ovulacao);
        }
    }

    for (let data = inicioEsperado; data <= limites.fim; data = adicionarDias(data, 1)) {
        assert.ok(diasCobertos.has(data), `A previsão perdeu a fase do dia ${data}.`);
    }
}

test('continua as fases após a próxima menstruação começar dentro do mês solicitado', async () => {
    const {service} = criarCenario();
    const resultado = await service.buscarMes({usuarioId: 7, mes: '2026-10'});
    const periodos = resultado.previsao.periodos;
    const projetado = periodos.find(periodo => (
        periodo.menstruacaoPrevista?.inicio === '2026-10-02'
    ));

    assert.ok(projetado);
    assert.equal(projetado.previsto, true);
    assert.equal(projetado.faseMenstrual, null);
    assert.deepEqual(projetado.menstruacaoPrevista, {inicio: '2026-10-02', fim: '2026-10-06'});
    assert.deepEqual(projetado.faseFolicular, {inicio: '2026-10-07', fim: '2026-10-14'});
    assert.equal(projetado.ovulacao, '2026-10-15');
    assert.deepEqual(projetado.faseLutea, {inicio: '2026-10-16', fim: '2026-10-29'});
    verificarCobertura(periodos, '2026-10');
});

test('mantém a menstruação prevista que cruza setembro e outubro e as fases seguintes', async () => {
    const {service} = criarCenario({
        inicio: '2026-09-01',
        fim: '2026-09-07',
        duracaoMenstruacao: 7
    });
    const setembro = await service.buscarMes({usuarioId: 7, mes: '2026-09'});
    const outubro = await service.buscarMes({usuarioId: 7, mes: '2026-10'});

    assert.ok(setembro.previsao.periodos.some(periodo => (
        periodo.menstruacaoPrevista?.inicio === '2026-09-29'
        && periodo.menstruacaoPrevista.fim === '2026-09-30'
    )));
    const periodo = outubro.previsao.periodos.find(item => (
        item.menstruacaoPrevista?.inicio === '2026-10-01'
    ));
    assert.ok(periodo);
    assert.deepEqual(periodo.menstruacaoPrevista, {inicio: '2026-10-01', fim: '2026-10-05'});
    assert.deepEqual(periodo.faseFolicular, {inicio: '2026-10-06', fim: '2026-10-11'});
    assert.equal(periodo.ovulacao, '2026-10-12');
    assert.deepEqual(periodo.faseLutea, {inicio: '2026-10-13', fim: '2026-10-26'});
    verificarCobertura(outubro.previsao.periodos, '2026-10');
});

test('representa dois inícios previstos no mesmo mês sem perder os dias posteriores', async () => {
    const {service} = criarCenario({
        inicio: '2026-09-10',
        fim: '2026-09-14',
        duracaoCiclo: 24
    });
    const resultado = await service.buscarMes({usuarioId: 7, mes: '2026-10'});
    const periodos = resultado.previsao.periodos;
    const iniciosPrevistos = periodos
        .filter(periodo => periodo.menstruacaoPrevista)
        .map(periodo => periodo.menstruacaoPrevista.inicio);

    assert.deepEqual(iniciosPrevistos, ['2026-10-04', '2026-10-28']);
    verificarCobertura(periodos, '2026-10');
});

test('mantém o último registro real separado dos períodos projetados', async () => {
    const {service} = criarCenario();
    const resultado = await service.buscarMes({usuarioId: 7, mes: '2026-09'});
    const periodoReal = resultado.previsao.periodos.find(periodo => periodo.previsto === false);

    assert.ok(periodoReal);
    assert.deepEqual(periodoReal.faseMenstrual, {inicio: '2026-09-04', fim: '2026-09-08'});
    assert.equal(periodoReal.menstruacaoPrevista, null);
    verificarCobertura(resultado.previsao.periodos, '2026-09', '2026-09-04');
});

test('continua as previsões na mudança de dezembro para janeiro', async () => {
    const {service} = criarCenario({inicio: '2026-11-20', fim: '2026-11-24'});
    const dezembro = await service.buscarMes({usuarioId: 7, mes: '2026-12'});
    const janeiro = await service.buscarMes({usuarioId: 7, mes: '2027-01'});

    assert.ok(dezembro.previsao.periodos.some(periodo => (
        periodo.menstruacaoPrevista?.inicio === '2026-12-18'
    )));
    assert.ok(janeiro.previsao.periodos.some(periodo => (
        periodo.menstruacaoPrevista?.inicio === '2027-01-15'
    )));
    verificarCobertura(janeiro.previsao.periodos, '2027-01');
});

test('mantém a previsão também em 29 de fevereiro de um ano bissexto', async () => {
    const {service} = criarCenario({inicio: '2028-01-20', fim: '2028-01-24'});
    const resultado = await service.buscarMes({usuarioId: 7, mes: '2028-02'});
    const periodo = resultado.previsao.periodos.find(item => (
        item.menstruacaoPrevista?.inicio === '2028-02-17'
    ));

    assert.ok(periodo);
    assert.deepEqual(periodo.faseFolicular, {inicio: '2028-02-22', fim: '2028-02-29'});
    verificarCobertura(resultado.previsao.periodos, '2028-02');
});

test('consulta um mês distante sem retornar todo o histórico de ciclos projetados', async () => {
    const {service, chamadas} = criarCenario({inicio: '2026-09-01', fim: '2026-09-05'});
    const resultado = await service.buscarMes({usuarioId: 7, mes: '2040-07'});

    assert.equal(chamadas.length, 1);
    assert.ok(resultado.previsao.periodos.length <= 3);
    assert.ok(resultado.previsao.periodos.every(periodo => periodo.previsto === true));
    verificarCobertura(resultado.previsao.periodos, '2040-07');
});

test('preserva a duração, a confiança e a janela fértil calculadas pelas regras existentes', async () => {
    const {service, parametros, registros} = criarCenario({
        registrosCiclo: [
            {id: 1, dataInicio: '2026-06-01', dataFim: '2026-06-05'},
            {id: 2, dataInicio: '2026-06-29', dataFim: '2026-07-03'},
            {id: 3, dataInicio: '2026-07-27', dataFim: '2026-07-31'},
            {id: 4, dataInicio: '2026-08-24', dataFim: '2026-08-28'}
        ]
    });
    const mes = '2026-10';
    const previsaoBase = calcularPrevisao({
        registros,
        parametros,
        dataReferencia: obterLimites(mes).fim
    });
    const resultado = await service.buscarMes({usuarioId: 7, mes});
    const inicioProjetado = adicionarDias(
        previsaoBase.proximoInicioEstimado,
        previsaoBase.duracaoCicloEstimada
    );
    const fimMenstrual = adicionarDias(inicioProjetado, 4);
    const fases = estimarFases({
        inicioCiclo: inicioProjetado,
        fimMenstrual,
        proximoInicio: adicionarDias(inicioProjetado, previsaoBase.duracaoCicloEstimada),
        duracaoLutea: parametros.duracaoLuteaInformada
    });
    const periodo = resultado.previsao.periodos.find(item => (
        item.menstruacaoPrevista?.inicio === inicioProjetado
    ));

    assert.ok(periodo);
    assert.equal(resultado.previsao.status, previsaoBase.status);
    assert.equal(resultado.previsao.nivelConfianca, previsaoBase.confiabilidadeMenstrual.nivel);
    assert.equal(resultado.previsao.versaoAlgoritmo, previsaoBase.versaoAlgoritmo);
    assert.deepEqual(periodo.faseFolicular, recortar(fases.fases.folicularPosMenstrual, mes));
    const limites = obterLimites(mes);
    const ovulacao = fases.fases.ovulatoria.data;
    assert.equal(
        periodo.ovulacao,
        ovulacao >= limites.inicio && ovulacao <= limites.fim ? ovulacao : null
    );
    assert.deepEqual(periodo.faseLutea, recortar(fases.fases.lutea, mes));
    assert.deepEqual(periodo.janelaFertil, recortar(fases.janelaFertil, mes));
    verificarCobertura(resultado.previsao.periodos, mes);
});

test('não fabrica fases ou janela fértil quando os intervalos são incompatíveis', async () => {
    const {service} = criarCenario({
        inicio: '2026-09-01',
        fim: '2026-09-07',
        duracaoCiclo: 10,
        duracaoMenstruacao: 7
    });
    const resultado = await service.buscarMes({usuarioId: 7, mes: '2026-10'});
    const periodos = resultado.previsao.periodos;

    assert.ok(periodos.some(periodo => periodo.menstruacaoPrevista));
    for (const periodo of periodos) {
        assert.equal(periodo.faseMenstrual, null);
        assert.equal(periodo.faseFolicular, null);
        assert.equal(periodo.ovulacao, null);
        assert.equal(periodo.faseLutea, null);
        assert.equal(periodo.janelaFertil, null);
    }
});
