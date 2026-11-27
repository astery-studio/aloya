//Consulta contatos e envia convites autenticados para a Rede de Apoio.
import { endpoints } from '../../../shared/services/api/endpoints';
import { corContatoEhValida, iconeContatoEhValido } from '../constants/contactAppearanceOptions';
import { gruposPermissoes, permissoesGerais } from '../constants/permissionOptions';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const TAMANHO_MAXIMO_EMAIL = 254;

const MENSAGEM_ERRO_CONSULTA =
    'Não foi possível verificar este e-mail no momento. Tente novamente.';

const MENSAGEM_ERRO_CONVITE =
    'Ocorreu um erro ao enviar convite. Verifique sua conexão e tente novamente.';

const ordemPermissoes = Object.freeze([
    ...permissoesGerais.map(({ id }) => id),
    ...gruposPermissoes.flatMap(({ permissoes }) => permissoes.map(({ id }) => id))
]);

const permissoesPermitidas = new Set(ordemPermissoes);

function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
        return false;
    }

    const prototipo = Object.getPrototypeOf(valor);

    return prototipo === Object.prototype || prototipo === null;
}

function criarErroLocal(mensagem, codigo) {
    const erro = new Error(mensagem);

    erro.codigo = codigo;
    erro.mensagemUsuario = mensagem;

    return erro;
}

function normalizarEmail(email) {
    if (typeof email !== 'string') {
        throw criarErroLocal('Informe um e-mail válido.', 'EMAIL_CONTATO_INVALIDO');
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (
        emailNormalizado.length === 0 ||
        emailNormalizado.length > TAMANHO_MAXIMO_EMAIL ||
        !EMAIL_REGEX.test(emailNormalizado)
    ) {
        throw criarErroLocal('Informe um e-mail válido.', 'EMAIL_CONTATO_INVALIDO');
    }

    return emailNormalizado;
}

function normalizarPermissoes(permissoes) {
    if (
        !Array.isArray(permissoes) ||
        permissoes.length === 0 ||
        permissoes.length > ordemPermissoes.length ||
        permissoes.some(
            (permissao) => typeof permissao !== 'string' || !permissoesPermitidas.has(permissao)
        )
    ) {
        throw criarErroLocal(
            'Selecione ao menos um tipo de dado para o contato visualizar.',
            'PERMISSOES_CONTATO_INVALIDAS'
        );
    }

    const recebidas = new Set(permissoes);

    return Object.freeze(ordemPermissoes.filter((permissao) => recebidas.has(permissao)));
}

function validarAparencia({ iconeId, corId }) {
    if (!iconeContatoEhValido(iconeId) || !corContatoEhValida(corId)) {
        throw criarErroLocal(
            'Selecione uma aparência válida para o contato.',
            'APARENCIA_CONTATO_INVALIDA'
        );
    }

    return {
        iconeId,
        corId
    };
}

function prepararConsultaEmail(email) {
    return Object.freeze({
        email: normalizarEmail(email)
    });
}

function prepararConvite(dados) {
    if (!ehObjetoSimples(dados)) {
        throw criarErroLocal('Os dados do convite são inválidos.', 'DADOS_CONVITE_INVALIDOS');
    }

    const camposPermitidos = new Set([
        'email',
        'categoriaId',
        'permissoesIndividuais',
        'iconeId',
        'corId'
    ]);

    if (Object.keys(dados).some((campo) => !camposPermitidos.has(campo))) {
        throw criarErroLocal('Os dados do convite são inválidos.', 'DADOS_CONVITE_INVALIDOS');
    }

    const email = normalizarEmail(dados.email);
    const aparencia = validarAparencia(dados);

    const informouCategoria = Object.hasOwn(dados, 'categoriaId');

    const informouPermissoes = Object.hasOwn(dados, 'permissoesIndividuais');

    if (informouCategoria === informouPermissoes) {
        throw criarErroLocal(
            'Escolha uma categoria ou defina permissões individuais para o contato.',
            'VINCULO_CONTATO_INVALIDO'
        );
    }

    const corpo = {
        email,
        iconeId: aparencia.iconeId,
        corId: aparencia.corId
    };

    if (informouCategoria) {
        if (!Number.isSafeInteger(dados.categoriaId) || dados.categoriaId <= 0) {
            throw criarErroLocal('Selecione uma categoria válida.', 'CATEGORIA_CONTATO_INVALIDA');
        }

        corpo.categoriaId = dados.categoriaId;
    } else {
        corpo.permissoesIndividuais = normalizarPermissoes(dados.permissoesIndividuais);
    }

    return Object.freeze(corpo);
}

function dataIsoEhValida(valor) {
    if (
        typeof valor !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(valor)
    ) {
        return false;
    }

    const data = new Date(valor);

    return !Number.isNaN(data.getTime()) && data.toISOString() === valor;
}

function prepararResultadoConsulta(resposta, emailEsperado) {
    const valido =
        ehObjetoSimples(resposta) &&
        resposta.email === emailEsperado &&
        typeof resposta.contaContatoCadastrada === 'boolean';

    if (!valido) {
        throw criarErroLocal(MENSAGEM_ERRO_CONSULTA, 'RESPOSTA_CONSULTA_CONTATO_INVALIDA');
    }

    return Object.freeze({
        email: resposta.email,
        contaContatoCadastrada: resposta.contaContatoCadastrada
    });
}

function prepararCategoriaConvite(categoria, categoriaIdEsperado) {
    const valida =
        ehObjetoSimples(categoria) &&
        categoria.id === categoriaIdEsperado &&
        typeof categoria.nome === 'string' &&
        categoria.nome.trim().length > 0 &&
        categoria.nome === categoria.nome.trim();

    if (!valida) {
        throw criarErroLocal(MENSAGEM_ERRO_CONVITE, 'RESPOSTA_CONVITE_INVALIDA');
    }

    return Object.freeze({
        id: categoria.id,
        nome: categoria.nome
    });
}

function prepararResultadoConvite(resposta, dadosEnviados) {
    const convite = resposta?.convite;

    const estruturaValida =
        ehObjetoSimples(resposta) &&
        resposta.mensagem === 'Convite enviado com sucesso.' &&
        ehObjetoSimples(convite) &&
        Number.isSafeInteger(convite.id) &&
        convite.id > 0 &&
        convite.email === dadosEnviados.email &&
        convite.status === 'pendente' &&
        convite.iconeId === dadosEnviados.iconeId &&
        convite.corId === dadosEnviados.corId &&
        dataIsoEhValida(convite.dataEnvio) &&
        dataIsoEhValida(convite.dataExpiracao) &&
        Array.isArray(convite.permissoesIndividuais);

    if (!estruturaValida) {
        throw criarErroLocal(MENSAGEM_ERRO_CONVITE, 'RESPOSTA_CONVITE_INVALIDA');
    }

    const usaCategoria = Object.hasOwn(dadosEnviados, 'categoriaId');

    let categoria = null;
    let permissoesIndividuais = Object.freeze([]);

    if (usaCategoria) {
        const respostaCategoriaValida =
            convite.tipoPermissao === 'categoria' && convite.permissoesIndividuais.length === 0;

        if (!respostaCategoriaValida) {
            throw criarErroLocal(MENSAGEM_ERRO_CONVITE, 'RESPOSTA_CONVITE_INVALIDA');
        }

        categoria = prepararCategoriaConvite(convite.categoria, dadosEnviados.categoriaId);
    } else {
        const respostaIndividualValida =
            convite.tipoPermissao === 'individual' && convite.categoria === null;

        if (!respostaIndividualValida) {
            throw criarErroLocal(MENSAGEM_ERRO_CONVITE, 'RESPOSTA_CONVITE_INVALIDA');
        }

        permissoesIndividuais = normalizarPermissoes(convite.permissoesIndividuais);

        if (
            JSON.stringify(permissoesIndividuais) !==
            JSON.stringify(dadosEnviados.permissoesIndividuais)
        ) {
            throw criarErroLocal(MENSAGEM_ERRO_CONVITE, 'RESPOSTA_CONVITE_INVALIDA');
        }
    }

    return Object.freeze({
        mensagem: resposta.mensagem,
        convite: Object.freeze({
            id: convite.id,
            email: convite.email,
            status: convite.status,
            iconeId: convite.iconeId,
            corId: convite.corId,
            tipoPermissao: convite.tipoPermissao,
            categoria,
            permissoesIndividuais,
            dataEnvio: convite.dataEnvio,
            dataExpiracao: convite.dataExpiracao
        })
    });
}

function criarContactInvitationService({ requisicaoAutenticada } = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço de convites.');
    }

    let envioAtual = null;
    let chaveEnvioAtual = null;

    async function consultarEmail(email, { signal } = {}) {
        const corpo = prepararConsultaEmail(email);

        const opcoes = {
            metodo: 'POST',
            caminho: endpoints.consultaEmailContato,
            corpo
        };

        if (signal !== undefined) {
            opcoes.signal = signal;
        }

        const resposta = await requisicaoAutenticada(opcoes);

        return prepararResultadoConsulta(resposta, corpo.email);
    }

    function enviarConvite(dados) {
        let corpo;

        try {
            corpo = prepararConvite(dados);
        } catch (erro) {
            return Promise.reject(erro);
        }
        const chave = JSON.stringify(corpo);

        if (envioAtual) {
            if (chave === chaveEnvioAtual) {
                return envioAtual;
            }

            return Promise.reject(
                criarErroLocal('Aguarde o envio do convite atual.', 'ENVIO_CONVITE_EM_ANDAMENTO')
            );
        }

        chaveEnvioAtual = chave;

        envioAtual = Promise.resolve()
            .then(() =>
                requisicaoAutenticada({
                    metodo: 'POST',
                    caminho: endpoints.convitesContato,
                    corpo
                })
            )
            .then((resposta) => prepararResultadoConvite(resposta, corpo))
            .finally(() => {
                envioAtual = null;
                chaveEnvioAtual = null;
            });

        return envioAtual;
    }

    return Object.freeze({
        consultarEmail,
        enviarConvite
    });
}

export {
    MENSAGEM_ERRO_CONSULTA,
    MENSAGEM_ERRO_CONVITE,
    criarContactInvitationService,
    normalizarEmail,
    prepararConvite
};
