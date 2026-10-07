//Monta os dados compactos de um mês do calendário usando os cálculos de previsão.
import { AppError } from '../../../shared/errors/AppError.js';
import { calcularPrevisao } from '../prediction.js';
import { formatarData } from '../utils/calendar.js';
import { criarIntervaloMensal } from '../utils/calendar.period.js';
import { validarMesCalendario } from './calendar.validator.js';

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

        const previsao = calcularPrevisao({
            registros: registrosCiclo,
            parametros,
            dataReferencia: intervalo.ultimoDia
        });

        return {
            mes: mesValidado.chave,
            possuiCiclos: true,
            diasMenstruacao,
            previsao: apresentarPrevisao(
                previsao,
                `${mesValidado.chave}-01`,
                intervalo.ultimoDia
            )
        };
    }

    return {buscarMes};
}

export { criarCalendarService };