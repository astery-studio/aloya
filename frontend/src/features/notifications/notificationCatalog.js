const redeApoio = {
    titulo: 'Rede de Apoio',
    ordemGrupo: ['convites', 'ciclo', 'dicas', 'diario', 'anticoncepcional'],
    grupos: {
        convites: ['Convites', [
            ['recebido', 'Novo convite recebido'], ['respondido', 'Convite aceito ou recusado'],
            ['renovado', 'Convite renovado'], ['acessoAtualizado', 'Acesso atualizado'],
            ['acessoRevogado', 'Acesso revogado'], ['proximoExpiracao', 'Convite próximo de expirar'],
            ['expirado', 'Convite expirado'], ['contaExcluida', 'Conta do contato excluída']
        ]],
        ciclo: ['Ciclo Compartilhado', [['registro', 'Novo registro menstrual'], ['resumo', 'Resumo semanal do ciclo']]],
        dicas: ['Dicas de Apoio', [['apoio', 'Receber dicas de como apoiar']]],
        diario: ['Diário Compartilhado', [
            ['ciclo', 'Ciclo e Sangramento'], ['corpo', 'Corpo e Sintomas Físicos'],
            ['emocional', 'Emocional'], ['energia', 'Energia e Sono'],
            ['vidaIntima', 'Vida Íntima e Social'], ['saude', 'Saúde e Acompanhamento']
        ]],
        anticoncepcional: ['Anticoncepcional Compartilhado', [
            ['horario', 'Horário programado'], ['naoConfirmado', 'Uso não confirmado'],
            ['moderados', 'Reenvios moderados'], ['criticos', 'Reenvios críticos'],
            ['fimJanela', 'Fim da janela de eficácia'], ['aplicacoesTrocas', 'Aplicações e trocas']
        ]]
    }
};

export function categoriaNotificacoesContato(chavesDisponiveis) {
    const chaves = new Set(chavesDisponiveis);
    const grupos = Object.fromEntries(
        Object.entries(redeApoio.grupos)
            .map(([id, [nome, eventos]]) => {
                const visiveis = eventos
                    .filter(([evento]) => chaves.has(`redeApoio.${id}.${evento}`))
                    .map((linha) =>
                        id === 'convites' && linha[0] === 'contaExcluida'
                            ? ['contaExcluida', 'Conta da pessoa apoiada excluída']
                            : linha
                    );
                return [id, [nome, visiveis]];
            })
            .filter(([, [, eventos]]) => eventos.length > 0)
    );

    return {
        ...redeApoio,
        grupos,
        ordemGrupo: redeApoio.ordemGrupo.filter((id) => Object.hasOwn(grupos, id))
    };
}
