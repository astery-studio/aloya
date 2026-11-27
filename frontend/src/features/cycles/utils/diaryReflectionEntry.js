const LIMITE_ANOTACAO_DIARIO = 5000;
const LIMITE_ANOTACAO_HOME = 100;
const PREFIXO_MODELO = '00:00: ';
const QUEBRA_LINHA = '\n';

function contarCaracteres(texto = '') {
    return [...texto].length;
}

function formatarHorario(instante = new Date()) {
    const horas = String(instante.getHours()).padStart(2, '0');
    const minutos = String(instante.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
}

function calcularCapacidadeAnotacao(anotacaoExistente = '') {
    const separador =
        anotacaoExistente && !anotacaoExistente.endsWith(QUEBRA_LINHA) ? QUEBRA_LINHA : '';
    const caracteresExistentes = contarCaracteres(anotacaoExistente);
    const espacoRestante = Math.max(0, LIMITE_ANOTACAO_DIARIO - caracteresExistentes);
    const caracteresEstruturais = contarCaracteres(`${separador}${PREFIXO_MODELO}${QUEBRA_LINHA}`);
    const limiteTexto = Math.min(
        LIMITE_ANOTACAO_HOME,
        Math.max(0, espacoRestante - caracteresEstruturais)
    );

    return {
        caracteresExistentes,
        caracteresEstruturais,
        limiteContador: limiteTexto,
        limiteTexto,
        semEspaco: limiteTexto === 0,
        separador
    };
}

function montarAnotacaoHome({ anotacaoExistente = '', texto = '', agora = new Date() } = {}) {
    const capacidade = calcularCapacidadeAnotacao(anotacaoExistente);
    const anotacao = [...texto].slice(0, capacidade.limiteTexto).join('');
    if (!anotacao.trim() || capacidade.semEspaco) return null;

    return `${anotacaoExistente}${capacidade.separador}${formatarHorario(agora)}: ${anotacao}${QUEBRA_LINHA}`;
}

export {
    calcularCapacidadeAnotacao,
    contarCaracteres,
    formatarHorario,
    LIMITE_ANOTACAO_DIARIO,
    LIMITE_ANOTACAO_HOME,
    montarAnotacaoHome
};
