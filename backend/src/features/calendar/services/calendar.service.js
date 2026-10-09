//Monta os dados compactos de um mês do calendário usando os cálculos de previsão.
import { AppError } from '../../../shared/errors/AppError.js';
import { CONFIG_PREVISAO } from '../../cycles/prediction.config.js';
import { calcularPrevisao } from '../../cycles/prediction.js';
import { estimarFases } from '../../cycles/prediction.phases.js';
import { adicionarDias, diferencaDias, formatarData } from '../../cycles/utils/calendar.js';
import { criarIntervaloMensal } from '../utils/calendar.period.js';
import { validarMesCalendario } from '../validators/calendar.validator.js';

function validarRepository(repository) {
    if (typeof repository?.buscarDadosDoMes !== 'function') {
        throw new TypeError('Não foi possível configurar o serviço do calendário.');
    }
}

function validarUsuarioId(usuarioId) {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');
    }
}

function recortarIntervalo(intervalo, inicioMes, ultimoDia) {
    if (!intervalo || intervalo.fim < inicioMes || intervalo.inicio > ultimoDia) {
        return null;
    }

    return {
        inicio: intervalo.inicio < inicioMes ? inicioMes : intervalo.inicio,
        fim: intervalo.fim > ultimoDia ? ultimoDia : intervalo.fim
    };
}

function recortarData(data, inicioMes, ultimoDia) {
    return data && data >= inicioMes && data <= ultimoDia ? data : null;
}

function normalizarDiasMenstruacao(diasMenstruacao) {
    const diasPorData = new Map();

    for (const dia of diasMenstruacao) {
        const data = formatarData(dia.data);

        diasPorData.set(data, {
            data,
            registroCicloId: dia.registroCicloId
        });
    }

    return [...diasPorData.values()].sort((a, b) => a.data.localeCompare(b.data));
}

function apresentarPrevisao(previsao, inicioMes, ultimoDia) {
    const fases = previsao.fasesEstimadas;

    return {
        status: previsao.status,
        nivelConfianca: previsao.confiabilidadeMenstrual?.nivel ?? null,
        faseMenstrual: recortarIntervalo(
            fases?.menstrual,
            inicioMes,
            ultimoDia
        ),
        faseFolicular: recortarIntervalo(
            fases?.folicularPosMenstrual,
            inicioMes,
            ultimoDia
        ),
        ovulacao: recortarData(
            fases?.ovulatoria?.data,
            inicioMes,
            ultimoDia
        ),
        faseLutea: recortarIntervalo(
            fases?.lutea,
            inicioMes,
            ultimoDia
        ),
        janelaFertil: recortarIntervalo(
            previsao.janelaFertilEstimada,
            inicioMes,
            ultimoDia
        ),
        menstruacaoPrevista: recortarIntervalo(
            previsao.periodoSangramentoEstimado,
            inicioMes,
            ultimoDia
        ),
        versaoAlgoritmo: previsao.versaoAlgoritmo
    };
}

function projetarPrevisaoDoMes(previsaoBase, parametros, inicioMes) {
    const primeiroInicioPrevisto = previsaoBase.proximoInicioEstimado;
    const duracaoCiclo = previsaoBase.duracaoCicloEstimada;
    const periodoInicial = previsaoBase.periodoSangramentoEstimado;

    if (
        typeof primeiroInicioPrevisto !== 'string'
        || !Number.isSafeInteger(duracaoCiclo)
        || duracaoCiclo <= 0
        || !periodoInicial?.inicio
        || !periodoInicial?.fim
        || inicioMes <= primeiroInicioPrevisto
    ) {
        return previsaoBase;
    }

    const duracaoMenstruacao = diferencaDias(
        periodoInicial.inicio,
        periodoInicial.fim
    ) + 1;
    const indiceCiclo = Math.floor(
        diferencaDias(primeiroInicioPrevisto, inicioMes) / duracaoCiclo
    );
    const inicioCicloProjetado = adicionarDias(
        primeiroInicioPrevisto,
        indiceCiclo * duracaoCiclo
    );
    const proximoInicioProjetado = adicionarDias(
        inicioCicloProjetado,
        duracaoCiclo
    );
    const fimMenstrualProjetado = adicionarDias(
        inicioCicloProjetado,
        duracaoMenstruacao - 1
    );
    const fases = estimarFases({
        inicioCiclo: inicioCicloProjetado,
        fimMenstrual: fimMenstrualProjetado,
        proximoInicio: proximoInicioProjetado,
        duracaoLutea: parametros.duracaoLuteaInformada
            ?? CONFIG_PREVISAO.luteaPadrao
    });

    return {
        ...previsaoBase,
        proximoInicioEstimado: proximoInicioProjetado,
        periodoSangramentoEstimado: {
            ...periodoInicial,
            inicio: proximoInicioProjetado,
            fim: adicionarDias(proximoInicioProjetado, duracaoMenstruacao - 1)
        },
        fasesEstimadas: fases.fases,
        dataOvulacaoEstimada: fases.fases?.ovulatoria?.data ?? null,
        janelaFertilEstimada: fases.janelaFertil
    };
}

function criarPeriodosDoMes(previsaoBase, parametros, inicioMes, ultimoDia) {
    const periodos = [];

    function incluirPeriodo(previsao, previsto) {
        const {
            status,
            nivelConfianca,
            versaoAlgoritmo,
            ...periodo
        } = apresentarPrevisao(previsao, inicioMes, ultimoDia);

        //Sangramento projetado nunca deve aparecer como registro menstrual real.
        if (previsto) periodo.faseMenstrual = null;
        else periodo.menstruacaoPrevista = null;

        if (Object.values(periodo).some(Boolean)) {
            periodos.push({previsto, ...periodo});
        }
    }

    incluirPeriodo(previsaoBase, false);

    const primeiroInicio = previsaoBase.proximoInicioEstimado;
    const duracaoCiclo = previsaoBase.duracaoCicloEstimada;
    const sangramento = previsaoBase.periodoSangramentoEstimado;

    if (
        typeof primeiroInicio !== 'string'
        || !Number.isSafeInteger(duracaoCiclo)
        || duracaoCiclo <= 0
        || !sangramento?.inicio
        || !sangramento?.fim
        || primeiroInicio > ultimoDia
    ) return periodos;

    const duracaoMenstruacao = diferencaDias(sangramento.inicio, sangramento.fim) + 1;
    //Salta direto para o ciclo do mês, mesmo em um ano distante.
    const indice = Math.max(0, Math.floor(
        diferencaDias(primeiroInicio, inicioMes) / duracaoCiclo
    ));
    let inicioCiclo = adicionarDias(primeiroInicio, indice * duracaoCiclo);

    while (inicioCiclo <= ultimoDia) {
        const proximoInicio = adicionarDias(inicioCiclo, duracaoCiclo);
        const fimMenstrual = adicionarDias(inicioCiclo, duracaoMenstruacao - 1);
        const fases = estimarFases({
            inicioCiclo,
            fimMenstrual,
            proximoInicio,
            duracaoLutea: parametros.duracaoLuteaInformada ?? CONFIG_PREVISAO.luteaPadrao
        });

        incluirPeriodo({
            ...previsaoBase,
            fasesEstimadas: fases.fases,
            janelaFertilEstimada: fases.janelaFertil,
            periodoSangramentoEstimado: {inicio: inicioCiclo, fim: fimMenstrual}
        }, true);

        inicioCiclo = proximoInicio;
    }

    return periodos;
}

function criarCalendarService({repository} = {}) {
    validarRepository(repository);

    async function buscarMes({usuarioId, mes} = {}) {
        validarUsuarioId(usuarioId);

        const mesValidado = validarMesCalendario(mes);
        const intervalo = criarIntervaloMensal(mesValidado);
        const resultado = await repository.buscarDadosDoMes({
            usuarioId,
            inicioMes: intervalo.inicioMes,
            fimMesExclusivo: intervalo.fimMesExclusivo
        });

        if (!resultado.usuario) {
            throw new AppError('Usuário não encontrado.', 404, 'USUARIO_NAO_ENCONTRADO');
        }

        const quantidadeCiclos = resultado.usuario._count?.registrosCiclo;

        if (!Number.isSafeInteger(quantidadeCiclos) || quantidadeCiclos < 0) {
            throw new TypeError('Os dados do calendário são inválidos.');
        }

        const diasMenstruacao = normalizarDiasMenstruacao(
            resultado.diasMenstruacao
        );

        if (quantidadeCiclos === 0) {
            return {
                mes: mesValidado.chave,
                possuiCiclos: false,
                diasMenstruacao: [],
                previsao: null
            };
        }

        const {
            registrosCiclo,
            _count,
            ...parametros
        } = resultado.usuario;

        if (registrosCiclo.length === 0) {
            return {
                mes: mesValidado.chave,
                possuiCiclos: true,
                diasMenstruacao,
                previsao: null
            };
        }

        const previsaoBase = calcularPrevisao({
            registros: registrosCiclo,
            parametros,
            dataReferencia: intervalo.ultimoDia
        });
        const previsao = projetarPrevisaoDoMes(
            previsaoBase,
            parametros,
            `${mesValidado.chave}-01`
        );

        return {
            mes: mesValidado.chave,
            possuiCiclos: true,
            diasMenstruacao,
            previsao: {
                ...apresentarPrevisao(
                    previsao,
                    `${mesValidado.chave}-01`,
                    intervalo.ultimoDia
                ),
                periodos: criarPeriodosDoMes(
                    previsaoBase,
                    parametros,
                    `${mesValidado.chave}-01`,
                    intervalo.ultimoDia
                )
            }
        };
    }

    return {buscarMes};
}

export { criarCalendarService };
