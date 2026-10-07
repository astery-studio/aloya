//Calcula o estado atual exibido na Home sem carregar a grade mensal.
import { AppError } from '../../../shared/errors/AppError.js';
import { calcularPrevisao } from '../../cycles/prediction.js';
import {
    adicionarDias,
    diferencaDias,
    formatarData,
    paraDataCalendario
} from '../../cycles/utils/calendar.js';

function validarDependencias(repository, agora) {
    const possuiConsulta = typeof repository?.buscarDadosAtuais === 'function';
    const possuiRelogio = typeof agora === 'function';

    if (!possuiConsulta || !possuiRelogio) {
        throw new TypeError('Não foi possível configurar o estado atual do ciclo.');
    }
}

function validarUsuarioId(usuarioId) {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');
    }
}

function estaNoIntervalo(data, intervalo) {
    return Boolean(
        intervalo
        && data >= intervalo.inicio
        && data <= intervalo.fim
    );
}

function obterFaseAtual(previsao, dataReferencia) {
    const fases = previsao.fasesEstimadas;

    if (!fases) return null;
    if (estaNoIntervalo(dataReferencia, fases.menstrual)) return 'MENSTRUAL';
    if (estaNoIntervalo(dataReferencia, fases.folicularPosMenstrual)) return 'FOLICULAR';
    if (fases.ovulatoria?.data === dataReferencia) return 'OVULATORIA';
    if (estaNoIntervalo(dataReferencia, fases.lutea)) return 'LUTEA';

    return null;
}

function criarEstadoVazio(dataReferencia, possuiCiclos) {
    return {
        possuiCiclos,
        dataReferencia,
        diaDoCiclo: null,
        faseAtual: null,
        estaNaJanelaFertil: false,
        proximoInicioEstimado: null,
        nivelConfianca: null,
        statusPrevisao: null
    };
}

function criarCurrentCycleService({
    repository,
    agora = () => new Date()
} = {}) {
    validarDependencias(repository, agora);

    async function buscarEstadoAtual({usuarioId} = {}) {
        validarUsuarioId(usuarioId);

        const dataReferencia = formatarData(agora());
        const proximoDia = adicionarDias(dataReferencia, 1);
        const usuario = await repository.buscarDadosAtuais({
            usuarioId,
            fimReferenciaExclusivo: paraDataCalendario(proximoDia)
        });

        if (!usuario) {
            throw new AppError('Usuário não encontrado.', 404, 'USUARIO_NAO_ENCONTRADO');
        }

        const quantidadeCiclos = usuario._count?.registrosCiclo;

        if (!Number.isSafeInteger(quantidadeCiclos) || quantidadeCiclos < 0) {
            throw new TypeError('Os dados do ciclo atual são inválidos.');
        }

        if (quantidadeCiclos === 0) {
            return criarEstadoVazio(dataReferencia, false);
        }

        const {
            registrosCiclo,
            _count,
            ...parametros
        } = usuario;

        if (registrosCiclo.length === 0) {
            return criarEstadoVazio(dataReferencia, true);
        }

        const previsao = calcularPrevisao({
            registros: registrosCiclo,
            parametros,
            dataReferencia
        });
        const ultimoRegistro = registrosCiclo[0];
        const inicioCiclo = formatarData(
            ultimoRegistro.dataInicio
        );

        return {
            possuiCiclos: true,
            dataReferencia,
            diaDoCiclo: diferencaDias(
                inicioCiclo,
                dataReferencia
            ) + 1,
            faseAtual: obterFaseAtual(
                previsao,
                dataReferencia
            ),
            estaNaJanelaFertil: estaNoIntervalo(
                dataReferencia,
                previsao.janelaFertilEstimada
            ),
            proximoInicioEstimado:
                previsao.proximoInicioEstimado ?? null,
            nivelConfianca:
                previsao.confiabilidadeMenstrual?.nivel ?? null,
            statusPrevisao:
                previsao.status
        };
    }

    return {buscarEstadoAtual};
}

export { criarCurrentCycleService };
