// Mantém as transformações do calendário de remoção disponíveis para reutilização.
import { obterHojeLocal } from '../../calendar/utils/cycleCalendar.utils';

function listarMesesDoCiclo(ciclo) {
    const inicio = ciclo?.dataInicio;
    const fim = ciclo?.dataFim || obterHojeLocal();
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(inicio || '') ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fim) ||
        fim < inicio
    )
        return [];
    const [anoInicio, mesInicio] = inicio.split('-').map(Number);
    const [anoFim, mesFim] = fim.split('-').map(Number);
    const meses = [];
    let ano = anoInicio;
    let mes = mesInicio;
    while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
        meses.push(`${ano}-${String(mes).padStart(2, '0')}`);
        mes += 1;
        if (mes > 12) {
            mes = 1;
            ano += 1;
        }
    }
    return meses;
}

function filtrarDiasDoCiclo(calendario, cicloId) {
    const diasMenstruacao = calendario.diasMenstruacao.filter(
        (dia) => String(dia.registroCicloId) === String(cicloId)
    );
    return {
        ...calendario,
        possuiCiclos: diasMenstruacao.length > 0,
        diasMenstruacao,
        previsao: null
    };
}

export { listarMesesDoCiclo, filtrarDiasDoCiclo };
