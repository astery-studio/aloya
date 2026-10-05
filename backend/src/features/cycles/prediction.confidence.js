import { mediana, ORIGENS } from './prediction.statistics.js';
import { CONFIG_PREVISAO } from './prediction.config.js';

function classificarConfiabilidade({ intervalos, origem, ambiguidades = [] }) {
    const valores = intervalos.slice(-CONFIG_PREVISAO.maximoIntervalos).map(({ duracao }) => duracao);
    const amplitude = valores.length ? Math.max(...valores) - Math.min(...valores) : null;
    const motivos = [];
    if (origem === ORIGENS.PADRAO) motivos.push('PADRAO_PROVISORIO');
    if (origem === ORIGENS.DECLARADA) motivos.push('APENAS_DURACAO_DECLARADA');
    if (valores.length < 3) motivos.push('HISTORICO_INSUFICIENTE');
    if (ambiguidades.length) motivos.push('REGISTROS_AMBIGUOS');
    if (amplitude > CONFIG_PREVISAO.variacaoElevada) motivos.push('VARIABILIDADE_ELEVADA');
    else if (amplitude > CONFIG_PREVISAO.variacaoModerada) motivos.push('VARIABILIDADE_MODERADA');
    const anteriores = valores.slice(0, -1);
    if (anteriores.length >= 2 && Math.abs(valores.at(-1) - mediana(anteriores)) > CONFIG_PREVISAO.variacaoModerada) {
        motivos.push('MUDANCA_RECENTE');
    }
    const baixa = origem !== ORIGENS.HISTORICO || valores.length < 3
        || ambiguidades.length || amplitude > CONFIG_PREVISAO.variacaoElevada;
    const alta = valores.length >= CONFIG_PREVISAO.maximoIntervalos && amplitude <= CONFIG_PREVISAO.variacaoModerada
        && !motivos.includes('MUDANCA_RECENTE');
    if (alta) motivos.push('HISTORICO_CONSISTENTE');
    return { nivel: baixa ? 'BAIXA' : alta ? 'ALTA' : 'MEDIA', motivos };
}

export { classificarConfiabilidade };
