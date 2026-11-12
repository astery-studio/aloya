import { isValidDate } from '../../../shared/utils/validation/isValidDate';
import { decomporData, formatarDataDiario, obterHojeDiario } from './diaryDate';

const FASES_FILTRO = Object.freeze(['menstrual', 'folicular', 'ovulatoria', 'lutea']);
const FILTROS_DIARIO_VAZIOS = Object.freeze({
    dataInicio: null,
    dataFim: null,
    categorias: Object.freeze([]),
    fases: Object.freeze([])
});

function ordenarUnicos(valores, permitidos = null) {
    if (!Array.isArray(valores)) return [];
    return [...new Set(valores.filter((valor) => typeof valor === 'string' && valor.trim()))]
        .filter((valor) => !permitidos || permitidos.includes(valor))
        .sort();
}

function normalizarFiltrosDiario(filtros = {}) {
    return {
        dataInicio: decomporData(filtros.dataInicio) ? filtros.dataInicio : null,
        dataFim: decomporData(filtros.dataFim) ? filtros.dataFim : null,
        categorias: ordenarUnicos(filtros.categorias),
        fases: ordenarUnicos(filtros.fases, FASES_FILTRO)
    };
}

function possuiFiltrosDiario(filtros) {
    const normalizados = normalizarFiltrosDiario(filtros);
    return Boolean(
        normalizados.dataInicio ||
        normalizados.dataFim ||
        normalizados.categorias.length ||
        normalizados.fases.length
    );
}

function criarChaveFiltrosDiario(filtros) {
    const normalizados = normalizarFiltrosDiario(filtros);
    return JSON.stringify(normalizados);
}

function converterDataFiltroParaIso(valor) {
    if (typeof valor !== 'string') return null;
    const dataNormalizada = valor.trim();
    if (!isValidDate(dataNormalizada)) return null;
    const correspondencia = /^(\d{2})\/(\d{2})\/(\d{4})$/u.exec(dataNormalizada);
    if (!correspondencia) return null;
    const iso = `${correspondencia[3]}-${correspondencia[2]}-${correspondencia[1]}`;
    return decomporData(iso) ? iso : null;
}

function formatarDataFiltro(data) {
    return formatarDataDiario(data);
}

function validarPeriodoDiario({ dataInicio, dataFim }, hoje = obterHojeDiario()) {
    const inicio = dataInicio ? converterDataFiltroParaIso(dataInicio) : null;
    const fim = dataFim ? converterDataFiltroParaIso(dataFim) : null;
    if (dataInicio && !inicio) return 'Informe uma data inicial válida.';
    if (dataFim && !fim) return 'Informe uma data final válida.';
    if (inicio && inicio > hoje) return 'A data inicial não pode ser futura.';
    if (fim && fim > hoje) return 'A data final não pode ser futura.';
    if (inicio && fim && inicio > fim) {
        return 'A data inicial não pode ser posterior à data final.';
    }
    return null;
}

function alternarValorFiltro(valores, valor) {
    const atuais = ordenarUnicos(valores);
    return atuais.includes(valor)
        ? atuais.filter((item) => item !== valor)
        : ordenarUnicos([...atuais, valor]);
}

function criarFiltrosDaEdicao({ dataInicio = '', dataFim = '', categorias = [], fases = [] }) {
    return normalizarFiltrosDiario({
        dataInicio: dataInicio ? converterDataFiltroParaIso(dataInicio) : null,
        dataFim: dataFim ? converterDataFiltroParaIso(dataFim) : null,
        categorias,
        fases
    });
}

export {
    alternarValorFiltro,
    converterDataFiltroParaIso,
    criarChaveFiltrosDiario,
    criarFiltrosDaEdicao,
    FASES_FILTRO,
    FILTROS_DIARIO_VAZIOS,
    formatarDataFiltro,
    normalizarFiltrosDiario,
    possuiFiltrosDiario,
    validarPeriodoDiario
};
