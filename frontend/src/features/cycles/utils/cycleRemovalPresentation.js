import { obterHojeLocal } from '../../calendar/utils/cycleCalendar.utils';

function formatarData(data) {
    if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return 'data não informada';
    }

    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function obterPeriodo(ciclo) {
    if (!ciclo?.dataInicio) return 'Período não informado';
    return `${formatarData(ciclo.dataInicio)} a ${formatarData(ciclo.dataFim || obterHojeLocal())}`;
}

export { obterPeriodo };
