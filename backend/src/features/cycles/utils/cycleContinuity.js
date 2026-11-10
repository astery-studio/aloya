import { formatarData, paraDataCalendario } from './calendar.js';

const MAXIMA_DISTANCIA = 3 * 86400000;
function agruparDias(dias) {
    const grupos = [];
    const unicos = [
        ...new Map(dias.map((dia) => [formatarData(dia), paraDataCalendario(dia)])).values()
    ].sort((a, b) => a - b);
    for (const dia of unicos) {
        const grupo = grupos.at(-1);
        if (!grupo || dia - grupo.at(-1) > MAXIMA_DISTANCIA) grupos.push([dia]);
        else grupo.push(dia);
    }
    return grupos;
}
function incluirCiclosProximos(dias, registros) {
    let datas = agruparDias(dias).flat();
    const incluidos = [];
    const pendentes = [...registros];
    let encontrou = true;
    while (encontrou) {
        encontrou = false;
        for (let i = pendentes.length - 1; i >= 0; i--) {
            const registro = pendentes[i];
            const inicio = paraDataCalendario(registro.dataInicio);
            const fim = paraDataCalendario(
                registro.dataFim ?? registro.diasMenstruacao.at(-1)?.data ?? registro.dataInicio
            );
            const conectado = agruparDias(datas).some((grupo) =>
                grupo.some(
                    (dia) =>
                        (dia < inicio && inicio - dia <= MAXIMA_DISTANCIA) ||
                        (dia > fim && dia - fim <= MAXIMA_DISTANCIA)
                )
            );
            if (!conectado) continue;
            incluidos.push(registro);
            datas = agruparDias([
                ...datas,
                ...registro.diasMenstruacao.map((dia) => dia.data)
            ]).flat();
            pendentes.splice(i, 1);
            encontrou = true;
        }
    }
    return {
        dias: datas,
        registros: incluidos.sort(
            (a, b) => paraDataCalendario(a.dataInicio) - paraDataCalendario(b.dataInicio)
        )
    };
}
export { agruparDias, incluirCiclosProximos };
