export function planejarPausas(
    metodo,
    regra,
    posicao,
    tamanho,
    decorrido,
    data,
    horarios,
    agendar
) {
    if (regra.diasPausa) {
        if (posicao === regra.diasUso) {
            agendar('rotina.inicioPausa', data, horarios[0]);
            if (metodo.tipo === 'adesivo') agendar('adesivo.retirada', data, horarios[0]);
            if (metodo.tipo === 'anel_vaginal') agendar('anel.retirada', data, horarios[0]);
        }
        if (posicao === tamanho - 1) agendar('rotina.fimPausa', data, horarios[0]);
        if (posicao === 0 && decorrido > 0) {
            agendar('rotina.retomada', data, horarios[0]);
            if (metodo.tipo === 'adesivo') agendar('adesivo.novo', data, horarios[0]);
            if (metodo.tipo === 'anel_vaginal') agendar('anel.insercao', data, horarios[0]);
        }
    } else if (metodo.tipo === 'anel_vaginal' && decorrido > 0 && posicao === 0) {
        agendar('anel.troca', data, horarios[0]);
    }
}
