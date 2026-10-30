import { AppError } from '../../../shared/errors/AppError.js';
import { adicionarDias, formatarData } from './calendar.js';

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
    let anterior = null;
    let seguinte = null;
    for (const registro of ordenados) {
        const primeiro = formatarData(registro.dataInicio);
        const ultimo = formatarData(
            registro.dataFim ?? registro.diasMenstruacao.at(-1)?.data ?? registro.dataInicio
        );
        if (primeiro <= fim && ultimo >= inicio) throw conflitoRegistro();
        if (ultimo < inicio) anterior = { registro, ultimo };
        if (primeiro > fim && !seguinte) seguinte = registro;
    }
    const continuaAnterior = anterior && adicionarDias(anterior.ultimo, 1) === inicio;
    const continuaSeguinte =
        seguinte && adicionarDias(fim, 1) === formatarData(seguinte.dataInicio);
    if (continuaAnterior && continuaSeguinte) throw conflitoRegistro();
    return { registro: continuaAnterior ? anterior.registro : continuaSeguinte ? seguinte : null };
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
