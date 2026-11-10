import { endpoints } from '../../../shared/services/api/endpoints';

const MENSAGEM_ERRO_LISTAGEM =
    'Não foi possível carregar sua Rede de Apoio no momento. Tente novamente.';

const MENSAGEM_ERRO_REENVIO = 'Não foi possível reenviar o convite no momento. Tente novamente.';

const STATUS_CONTATO = Object.freeze(['pendente', 'ativo', 'inativo', 'recusado']);

function criarErroLocal(mensagem, codigo) {
    const erro = new Error(mensagem);

    erro.codigo = codigo;
    erro.mensagemUsuario = mensagem;

    return erro;
}

function ehObjeto(valor) {
    return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

function ehTextoPreenchido(valor) {
    return typeof valor === 'string' && valor.trim().length > 0;
}

function ehDataIsoValida(valor) {
    return typeof valor === 'string' && valor.trim().length > 0 && !Number.isNaN(Date.parse(valor));
}

function normalizarPermissoes(permissoes) {
    if (
        !Array.isArray(permissoes) ||
        permissoes.some((permissao) => !ehTextoPreenchido(permissao))
    ) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    return Object.freeze(permissoes.map((permissao) => permissao.trim()));
}

function normalizarCategoria(categoria) {
    if (categoria === null) {
        return null;
    }

    if (
        !ehObjeto(categoria) ||
        !Number.isSafeInteger(categoria.id) ||
        categoria.id <= 0 ||
        !ehTextoPreenchido(categoria.nome)
    ) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    return Object.freeze({
        id: categoria.id,
        nome: categoria.nome.trim()
    });
}

function normalizarVinculo(vinculo) {
    if (
        !ehObjeto(vinculo) ||
        !['categoria', 'individual'].includes(vinculo.tipo) ||
        !ehTextoPreenchido(vinculo.rotulo)
    ) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    const categoria = normalizarCategoria(vinculo.categoria);

    if (vinculo.tipo === 'categoria' && categoria === null) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    if (vinculo.tipo === 'individual' && categoria !== null) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    return Object.freeze({
        tipo: vinculo.tipo,
        rotulo: vinculo.rotulo.trim(),
        categoria,
        permissoes: normalizarPermissoes(vinculo.permissoes)
    });
}

function normalizarAguardando(aguardando) {
    if (aguardando === null || aguardando === undefined) {
        return null;
    }

    if (
        !ehObjeto(aguardando) ||
        !Number.isSafeInteger(aguardando.dias) ||
        aguardando.dias < 0 ||
        typeof aguardando.atrasado !== 'boolean' ||
        !ehTextoPreenchido(aguardando.rotulo)
    ) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    return Object.freeze({
        dias: aguardando.dias,
        atrasado: aguardando.atrasado,
        rotulo: aguardando.rotulo.trim()
    });
}

function normalizarAcoes(acoes) {
    if (
        !ehObjeto(acoes) ||
        typeof acoes.podeAlterarVinculo !== 'boolean' ||
        typeof acoes.podeRemover !== 'boolean' ||
        typeof acoes.podeReenviarConvite !== 'boolean'
    ) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    return Object.freeze({
        podeAlterarVinculo: acoes.podeAlterarVinculo,
        podeRemover: acoes.podeRemover,
        podeReenviarConvite: acoes.podeReenviarConvite
    });
}

function normalizarContato(contato) {
    const idValido = Number.isSafeInteger(contato?.id) && contato.id > 0;

    const statusValido = STATUS_CONTATO.includes(contato?.status);

    if (
        !idValido ||
        !statusValido ||
        !ehTextoPreenchido(contato?.email) ||
        !ehTextoPreenchido(contato?.identificacao) ||
        !ehTextoPreenchido(contato?.iconeId) ||
        !ehTextoPreenchido(contato?.corId) ||
        !ehTextoPreenchido(contato?.statusRotulo) ||
        !ehDataIsoValida(contato?.dataConvite)
    ) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    if (contato.nome !== null && contato.nome !== undefined && !ehTextoPreenchido(contato.nome)) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    return Object.freeze({
        ...contato,
        nome: typeof contato.nome === 'string' ? contato.nome.trim() : null,
        email: contato.email.trim(),
        identificacao: contato.identificacao.trim(),
        iconeId: contato.iconeId.trim(),
        corId: contato.corId.trim(),
        statusRotulo: contato.statusRotulo.trim(),
        vinculo: normalizarVinculo(contato.vinculo),
        aguardando: normalizarAguardando(contato.aguardando),
        acoes: normalizarAcoes(contato.acoes)
    });
}

function calcularResumo(contatos) {
    return Object.freeze({
        total: contatos.length,
        pendentes: contatos.filter(({ status }) => status === 'pendente').length,
        ativos: contatos.filter(({ status }) => status === 'ativo').length,
        inativos: contatos.filter(({ status }) => status === 'inativo').length,
        recusados: contatos.filter(({ status }) => status === 'recusado').length
    });
}

function normalizarListagem(resposta) {
    if (!ehObjeto(resposta) || !Array.isArray(resposta.contatos) || !ehObjeto(resposta.resumo)) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    const contatos = Object.freeze(resposta.contatos.map(normalizarContato));

    const resumo = calcularResumo(contatos);

    const resumoConsistente = Object.entries(resumo).every(
        ([campo, quantidade]) => resposta.resumo[campo] === quantidade
    );

    if (!resumoConsistente) {
        throw criarErroLocal(MENSAGEM_ERRO_LISTAGEM, 'RESPOSTA_CONTATOS_INVALIDA');
    }

    return Object.freeze({
        contatos,
        resumo
    });
}

function validarContatoId(contatoId) {
    if (!Number.isSafeInteger(contatoId) || contatoId <= 0) {
        throw criarErroLocal('Contato inválido.', 'CONTATO_ID_INVALIDO');
    }

    return contatoId;
}

function normalizarConviteReenviado(resposta) {
    const convite = resposta?.convite;

    if (
        !ehObjeto(resposta) ||
        resposta.mensagem !== 'Convite reenviado com sucesso.' ||
        !ehObjeto(convite) ||
        !Number.isSafeInteger(convite.id) ||
        convite.id <= 0 ||
        !ehTextoPreenchido(convite.email) ||
        convite.status !== 'pendente' ||
        !ehDataIsoValida(convite.dataEnvio) ||
        !ehDataIsoValida(convite.dataExpiracao)
    ) {
        throw criarErroLocal(MENSAGEM_ERRO_REENVIO, 'RESPOSTA_REENVIO_INVALIDA');
    }

    return Object.freeze({
        mensagem: resposta.mensagem,
        convite: Object.freeze({
            id: convite.id,
            email: convite.email.trim(),
            status: convite.status,
            dataEnvio: convite.dataEnvio,
            dataExpiracao: convite.dataExpiracao
        })
    });
}

function criarSupportContactService({ requisicaoAutenticada } = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço de contatos.');
    }

    const reenviosEmAndamento = new Map();

    async function listar({ signal } = {}) {
        const opcoes = {
            metodo: 'GET',
            caminho: endpoints.contatosRedeApoio
        };

        if (signal !== undefined) {
            opcoes.signal = signal;
        }

        const resposta = await requisicaoAutenticada(opcoes);

        return normalizarListagem(resposta);
    }

    function reenviarConvite(contatoId) {
        let id;

        try {
            id = validarContatoId(contatoId);
        } catch (erro) {
            return Promise.reject(erro);
        }

        if (reenviosEmAndamento.has(id)) {
            return reenviosEmAndamento.get(id);
        }

        const requisicao = Promise.resolve()
            .then(() =>
                requisicaoAutenticada({
                    metodo: 'POST',
                    caminho: endpoints.reenviarConviteContato(id)
                })
            )
            .then(normalizarConviteReenviado)
            .finally(() => {
                reenviosEmAndamento.delete(id);
            });

        reenviosEmAndamento.set(id, requisicao);

        return requisicao;
    }

    return Object.freeze({
        listar,
        reenviarConvite
    });
}

export {
    MENSAGEM_ERRO_LISTAGEM,
    MENSAGEM_ERRO_REENVIO,
    STATUS_CONTATO,
    criarSupportContactService,
    normalizarContato,
    normalizarListagem
};
