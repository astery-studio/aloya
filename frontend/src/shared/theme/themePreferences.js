const PREFERENCIAS_TEMA = Object.freeze({
    claro: 'claro',
    escuro: 'escuro',
    automatico: 'automatico'
});

const MODOS_TEMA = Object.freeze({
    claro: 'claro',
    escuro: 'escuro'
});

const preferenciasPermitidas = new Set(Object.values(PREFERENCIAS_TEMA));

function preferenciaTemaEhValida(preferencia) {
    return preferenciasPermitidas.has(preferencia);
}

function resolverModoTema(preferencia = PREFERENCIAS_TEMA.automatico, esquemaDoSistema = 'light') {
    if (!preferenciaTemaEhValida(preferencia)) {
        return MODOS_TEMA.claro;
    }

    if (preferencia === PREFERENCIAS_TEMA.automatico) {
        return esquemaDoSistema === 'dark' ? MODOS_TEMA.escuro : MODOS_TEMA.claro;
    }

    return preferencia;
}

export { MODOS_TEMA, PREFERENCIAS_TEMA, preferenciaTemaEhValida, resolverModoTema };
