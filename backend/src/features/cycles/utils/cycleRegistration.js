import { incluirCiclosProximos } from './cycleContinuity.js';
import { AppError } from '../../../shared/errors/AppError.js';
import { adicionarDias, diferencaDias, paraDataCalendario, formatarData } from './calendar.js';

function conflitoRegistro() {
    return new AppError(
        'O período conflita com um ciclo existente. Edite o ciclo pelo Histórico de Ciclos.',
        409,
        'CONFLITO_REGISTRO_MENSTRUAL'
    );
}

function selecionarPeriodo(registros, inicio, fim) {
    const ordenados = [...registros].sort((a, b) =>
        formatarData(a.dataInicio).localeCompare(formatarData(b.dataInicio))
    );

    for (const registro of ordenados) {
        const primeiro = formatarData(registro.dataInicio);
        const ultimo = formatarData(
            registro.dataFim ?? registro.diasMenstruacao.at(-1)?.data ?? registro.dataInicio
        );
        if (primeiro <= fim && ultimo >= inicio) throw conflitoRegistro();
    }
    const dias = Array.from({ length: diferencaDias(inicio, fim) + 1 }, (_, i) =>
        paraDataCalendario(adicionarDias(inicio, i))
    );
    const continuidade = incluirCiclosProximos(dias, ordenados);
    return {
        registro: continuidade.registros[0] ?? null,
        registrosParaUnir: continuidade.registros.slice(1)
    };
}

// Uma categoria atribuída define as permissões; as individuais valem sem categoria.
function permiteHistorico(vinculo) {
    const permissoes = vinculo.categoria
        ? vinculo.categoria.conjuntoDadosVisiveis
        : vinculo.permissoesIndividuais;
    return (
        vinculo.status === 'ativo' &&
        Number.isSafeInteger(vinculo.contatoId) &&
        Array.isArray(permissoes) &&
        permissoes.includes('geral.historico_ciclo')
    );
}

export { selecionarPeriodo, permiteHistorico };
