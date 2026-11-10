import {
    DIAS_PARA_CONVITE_ATRASADO,
    STATUS_CONTATO_ATIVO,
    STATUS_CONTATO_PENDENTE
} from '../constants/supportContact.constants.js';

const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;
const comparadorNomes = new Intl.Collator('pt-BR', {
    numeric: true,
    sensitivity: 'base'
});
const ORDEM_STATUS = Object.freeze({
    pendente: 0,
    ativo: 1,
    inativo: 2,
    recusado: 3
});
const ROTULOS_STATUS = Object.freeze({
    pendente: 'Pendente',
    ativo: 'Ativo',
    inativo: 'Inativo',
    recusado: 'Recusado'
});

function inicioUtcDoDia(data) {
    return Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
}

function calcularDiasAguardando(dataEnvio, agora = new Date()) {
    if (!(dataEnvio instanceof Date) || Number.isNaN(dataEnvio.getTime())) return 0;
    if (!(agora instanceof Date) || Number.isNaN(agora.getTime())) return 0;

    const diferenca = inicioUtcDoDia(agora) - inicioUtcDoDia(dataEnvio);
    return Math.max(0, Math.floor(diferenca / MILISSEGUNDOS_POR_DIA));
}

function criarResumoEspera(status, dataEnvio, agora) {
    if (status !== STATUS_CONTATO_PENDENTE) return null;

    const dias = calcularDiasAguardando(dataEnvio, agora);
    return Object.freeze({
        dias,
        atrasado: dias > DIAS_PARA_CONVITE_ATRASADO,
        rotulo: `Aguardando há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
    });
}

function normalizarStatusContato(status) {
    return status === 'revogado' ? 'inativo' : status;
}

function criarResumoSituacao(status, dataEnvio, dataResposta, agora) {
    if (status === STATUS_CONTATO_PENDENTE) {
        return criarResumoEspera(status, dataEnvio, agora);
    }

    const configuracoes = {
        inativo: 'Desativado',
        recusado: 'Recusado'
    };
    const prefixo = configuracoes[status];

    if (!prefixo) return null;

    const dias = calcularDiasAguardando(dataResposta, agora);
    return Object.freeze({
        dias,
        atrasado: false,
        rotulo: `${prefixo} há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
    });
}

function copiarPermissoes(permissoes) {
    return Array.isArray(permissoes)
        ? permissoes.filter((permissao) => typeof permissao === 'string')
        : [];
}

function resolverVinculo(vinculo) {
    if (vinculo.categoria) {
        return Object.freeze({
            tipo: 'categoria',
            rotulo: `Categoria: ${vinculo.categoria.nome}`,
            categoria: Object.freeze({
                id: vinculo.categoria.id,
                nome: vinculo.categoria.nome
            }),
            permissoes: Object.freeze(copiarPermissoes(vinculo.categoria.conjuntoDadosVisiveis))
        });
    }

    return Object.freeze({
        tipo: 'individual',
        rotulo: 'Permissão individual',
        categoria: null,
        permissoes: Object.freeze(copiarPermissoes(vinculo.permissoesIndividuais))
    });
}

function formatarContato(vinculo, agora = new Date()) {
    const nome =
        typeof vinculo?.contato?.nome === 'string' && vinculo.contato.nome.trim().length > 0
            ? vinculo.contato.nome.trim()
            : null;
    const email = vinculo.emailConvidado;
    const status = normalizarStatusContato(vinculo.status);
    const pendente = status === STATUS_CONTATO_PENDENTE;
    const ativo = status === STATUS_CONTATO_ATIVO;
    const podeReenviar = pendente || status === 'inativo' || status === 'recusado';

    return Object.freeze({
        id: vinculo.id,
        nome,
        email,
        identificacao: nome ?? email,
        status,
        statusRotulo: ROTULOS_STATUS[status],
        vinculo: resolverVinculo(vinculo),
        dataConvite: vinculo.dataEnvio,
        dataAtivacao: ativo ? vinculo.dataResposta : null,
        dataDesativacao: status === 'inativo' ? vinculo.dataResposta : null,
        dataRecusa: status === 'recusado' ? vinculo.dataResposta : null,
        aguardando: criarResumoSituacao(status, vinculo.dataEnvio, vinculo.dataResposta, agora),
        acoes: Object.freeze({
            podeAlterarVinculo: ativo,
            podeRemover: true,
            podeReenviarConvite: podeReenviar
        })
    });
}

function formatarContatoRecebido(vinculo, agora = new Date()) {
    const nome =
        typeof vinculo?.titular?.nome === 'string' && vinculo.titular.nome.trim().length > 0
            ? vinculo.titular.nome.trim()
            : null;
    const email = typeof vinculo?.titular?.email === 'string' ? vinculo.titular.email.trim() : '';
    const pendente = vinculo.status === STATUS_CONTATO_PENDENTE;

    return Object.freeze({
        id: vinculo.id,
        nome,
        email,
        identificacao: nome ?? email,
        iconeId: vinculo.iconeId,
        corId: vinculo.corId,
        status: vinculo.status,
        statusRotulo: pendente ? 'Pendente' : 'Ativo',
        vinculo: resolverVinculo(vinculo),
        dataConvite: vinculo.dataEnvio,
        dataAtivacao: vinculo.status === STATUS_CONTATO_ATIVO ? vinculo.dataResposta : null,
        aguardando: criarResumoEspera(vinculo.status, vinculo.dataEnvio, agora),
        acoes: Object.freeze({
            podeAceitar: pendente,
            podeRecusar: pendente,
            podeAbrirResumo: true
        })
    });
}

function compararContatos(primeiro, segundo) {
    const prioridadePrimeiro = ORDEM_STATUS[primeiro.status] ?? Number.MAX_SAFE_INTEGER;
    const prioridadeSegundo = ORDEM_STATUS[segundo.status] ?? Number.MAX_SAFE_INTEGER;

    if (prioridadePrimeiro !== prioridadeSegundo) {
        return prioridadePrimeiro - prioridadeSegundo;
    }

    const porNome = comparadorNomes.compare(primeiro.identificacao, segundo.identificacao);
    return porNome !== 0 ? porNome : primeiro.id - segundo.id;
}

function ordenarContatos(contatos) {
    return [...contatos].sort(compararContatos);
}

export {
    calcularDiasAguardando,
    criarResumoSituacao,
    criarResumoEspera,
    compararContatos,
    formatarContato,
    formatarContatoRecebido,
    normalizarStatusContato,
    ordenarContatos,
    resolverVinculo,
    STATUS_CONTATO_ATIVO,
    STATUS_CONTATO_PENDENTE
};
