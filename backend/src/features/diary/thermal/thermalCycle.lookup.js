import { formatarData } from '../../cycles/utils/calendar.js';

function localizarCiclosAfetados(ciclos, datas) {
    const ids = new Set();
    for (const data of datas) {
        let encontrado = null;
        for (const ciclo of ciclos) {
            if (formatarData(ciclo.dataInicio) > data) break;
            encontrado = ciclo;
        }
        if (encontrado) ids.add(encontrado.id);
    }
    return ids;
}

export { localizarCiclosAfetados };
