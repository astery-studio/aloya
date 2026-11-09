const ESTADOS_BANCO = Object.freeze({
    ELEVACAO_DETECTADA: 'elevacao_detectada',
    INCONCLUSIVO: 'inconclusivo',
    NENHUMA_ELEVACAO_IDENTIFICADA: 'nenhuma_elevacao_identificada',
    DADOS_INSUFICIENTES: 'dados_insuficientes'
});

async function persistirAnaliseTermica(tx, ciclo, usuarioId, config, resultado, provisorio, avaliadoAte) {
    const chave = {
        registroCicloId: ciclo.id,
        versaoAlgoritmo: config.versao,
        variante: config.variante,
        disponibilidade: config.disponibilidade
    };
    const dados = {
        usuarioId,
        algoritmo: config.algoritmo,
        estado: ESTADOS_BANCO[resultado.estado],
        provisorio,
        janelasAvaliaveis: resultado.janelasAvaliaveis,
        configuracao: config,
        sequencias: resultado.sequencias,
        evidenciaAplicada: false,
        avaliadoAte
    };
    await tx.analiseTermicaCiclo.upsert({
        where: { registroCicloId_versaoAlgoritmo_variante_disponibilidade: chave },
        create: { ...chave, ...dados },
        update: dados
    });
}

export { persistirAnaliseTermica };
