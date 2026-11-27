const ciclo = {
    titulo: 'Ciclo e Previsões',
    grupos: {
        menstrual: ['Ciclo Menstrual', [['proxima', 'Próxima menstruação'], ['confirmacao', 'Confirmação do início do ciclo']]],
        fases: ['Mudanças de Fase', [
            ['menstrual', 'Início da fase menstrual'], ['folicular', 'Início da fase folicular'],
            ['ovulatoria', 'Início da fase ovulatória'], ['lutea', 'Início da fase lútea'],
            ['antecedenciaProximoCiclo', 'Quando notificar o próximo ciclo', 'antecedencia']
        ]],
        dicas: ['Dicas de Autocuidado', [
            ['menstrual', 'Dicas da fase menstrual'], ['folicular', 'Dicas da fase folicular'],
            ['ovulatoria', 'Dicas da fase ovulatória'], ['lutea', 'Dicas da fase lútea']
        ]],
        diario: ['Diário', [
            ['lembreteDiarioAtivo', 'Lembrete diário', 'legado'],
            ['horarioLembreteDiario', 'Horário do lembrete diário', 'horario'],
            ['resumoSemanal', 'Resumo semanal'], ['comparacaoPeriodos', 'Comparação de períodos']
        ]]
    }
};

const anticoncepcional = {
    titulo: 'Anticoncepcional',
    grupos: {
        rotina: ['Rotina de Uso', [
            ['horario', 'Horário programado'], ['inicioPausa', 'Início da pausa'],
            ['fimPausa', 'Fim da pausa'], ['retomada', 'Retomada do uso']
        ]],
        naoConfirmado: ['Uso Não Confirmado', [
            ['aviso', 'Primeiro aviso'], ['moderados', 'Reenvios moderados'],
            ['criticos', 'Reenvios críticos'], ['fimJanela', 'Fim da janela de eficácia']
        ]],
        injetavel: ['Anticoncepcional Injetável', [['proxima', 'Aplicação se aproximando'], ['hoje', 'Aplicação programada para hoje']]],
        adesivo: ['Adesivo Anticoncepcional', [['troca', 'Troca do adesivo'], ['retirada', 'Retirada para pausa'], ['novo', 'Novo adesivo após a pausa']]],
        anel: ['Anel Vaginal', [['retirada', 'Retirada do anel'], ['insercao', 'Inserção após a pausa'], ['troca', 'Troca do anel']]],
        diu: ['DIU Hormonal', [['proxima', 'Troca se aproximando'], ['data', 'Data da troca']]],
        validade: ['Validade', [['proxima', 'Validade se aproximando'], ['atingida', 'Validade atingida']]]
    }
};

const redeApoio = {
    titulo: 'Rede de Apoio',
    ordemGrupo: ['convites', 'ciclo', 'dicas', 'diario', 'anticoncepcional', 'consentimento'],
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
        consentimento: ['Consentimento Parental', [['confirmado', 'Autorização confirmada'], ['expirado', 'Solicitação expirada']]],
        anticoncepcional: ['Anticoncepcional Compartilhado', [
            ['horario', 'Horário programado'], ['naoConfirmado', 'Uso não confirmado'],
            ['moderados', 'Reenvios moderados'], ['criticos', 'Reenvios críticos'],
            ['fimJanela', 'Fim da janela de eficácia'], ['aplicacoesTrocas', 'Aplicações e trocas']
        ]]
    }
};

export const catalogoNotificacoes = { ciclo, anticoncepcional, redeApoio };

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
