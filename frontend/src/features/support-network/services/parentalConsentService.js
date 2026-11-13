import { endpoints } from '../../../shared/services/api/endpoints';

const MENSAGEM_ERRO_ENVIO =
    'Não foi possível enviar o pedido de autorização no momento. Tente novamente.';

const STATUS_CONSENTIMENTO = new Set([null, 'pendente', 'liberado', 'expirado', 'revogado']);

function criarErroLocal(mensagem, codigo) {
    const erro = new Error(mensagem);
    erro.codigo = codigo;
    erro.mensagemUsuario = mensagem;
    return erro;
}

function normalizarStatusConsentimento(resposta) {
    const respostaValida =
        resposta !== null &&
        typeof resposta === 'object' &&
        !Array.isArray(resposta) &&
        typeof resposta.acessoLiberado === 'boolean' &&
        typeof resposta.consentimentoNecessario === 'boolean' &&
        typeof resposta.emailResponsavelInformado === 'boolean' &&
        typeof resposta.motivo === 'string' &&
        STATUS_CONSENTIMENTO.has(resposta.statusConsentimento) &&
        (resposta.emailResponsavelLegal === null ||
            typeof resposta.emailResponsavelLegal === 'string');

    if (!respostaValida) {
        throw criarErroLocal(
            'Não foi possível verificar a autorização da Rede de Apoio.',
            'RESPOSTA_CONSENTIMENTO_INVALIDA'
        );
    }

    const email = resposta.emailResponsavelLegal?.trim().toLowerCase() || null;

    if (resposta.emailResponsavelInformado !== Boolean(email)) {
        throw criarErroLocal(
            'Não foi possível verificar a autorização da Rede de Apoio.',
            'RESPOSTA_CONSENTIMENTO_INVALIDA'
        );
    }

    return Object.freeze({
        acessoLiberado: resposta.acessoLiberado,
        motivo: resposta.motivo,
        consentimentoNecessario: resposta.consentimentoNecessario,
        emailResponsavelInformado: resposta.emailResponsavelInformado,
        emailResponsavelLegal: email,
        statusConsentimento: resposta.statusConsentimento,
        menorDe16: resposta.motivo !== 'MAIOR_DE_16_ANOS'
    });
}

function validarEmail(emailResponsavelLegal) {
    const email = typeof emailResponsavelLegal === 'string' ? emailResponsavelLegal.trim() : '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        throw criarErroLocal('Informe um e-mail válido.', 'EMAIL_RESPONSAVEL_INVALIDO');
    }

    return email.toLowerCase();
}

function normalizarResultadoEnvio(resposta) {
    if (
        resposta?.emailEnviado !== true ||
        resposta?.acessoRedeApoioLiberado !== false ||
        resposta?.statusConsentimento !== 'pendente' ||
        typeof resposta?.mensagem !== 'string'
    ) {
        throw criarErroLocal(MENSAGEM_ERRO_ENVIO, 'RESPOSTA_ENVIO_CONSENTIMENTO_INVALIDA');
    }

    return Object.freeze({
        emailEnviado: true,
        acessoRedeApoioLiberado: false,
        statusConsentimento: 'pendente',
        mensagem: resposta.mensagem
    });
}

function criarParentalConsentService({ requisicaoAutenticada } = {}) {
    if (typeof requisicaoAutenticada !== 'function') {
        throw new Error('Não foi possível configurar o serviço de consentimento parental.');
    }

    let envioEmAndamento = null;

    async function consultarStatus({ signal } = {}) {
        const resposta = await requisicaoAutenticada({
            caminho: endpoints.statusConsentimentoParental,
            ...(signal ? { signal } : {})
        });

        return normalizarStatusConsentimento(resposta);
    }

    function executarEnvio(caminho, emailResponsavelLegal, emailObrigatorio) {
        if (envioEmAndamento) {
            return envioEmAndamento;
        }

        let email;

        try {
            email =
                emailResponsavelLegal === null && !emailObrigatorio
                    ? null
                    : validarEmail(emailResponsavelLegal);
        } catch (erro) {
            return Promise.reject(erro);
        }

        envioEmAndamento = requisicaoAutenticada({
            metodo: 'POST',
            caminho,
            corpo: email === null ? {} : { emailResponsavelLegal: email }
        })
            .then(normalizarResultadoEnvio)
            .catch((erro) => {
                if (erro && typeof erro === 'object' && !erro.mensagemUsuario) {
                    erro.mensagemUsuario = MENSAGEM_ERRO_ENVIO;
                }

                throw erro;
            })
            .finally(() => {
                envioEmAndamento = null;
            });

        return envioEmAndamento;
    }

    function solicitar(emailResponsavelLegal) {
        return executarEnvio(endpoints.solicitarConsentimentoParental, emailResponsavelLegal, true);
    }

    function reenviar(emailResponsavelLegal = null) {
        return executarEnvio(endpoints.reenviarConsentimentoParental, emailResponsavelLegal, false);
    }

    return Object.freeze({
        consultarStatus,
        solicitar,
        reenviar
    });
}

export {
    MENSAGEM_ERRO_ENVIO,
    criarParentalConsentService,
    normalizarResultadoEnvio,
    normalizarStatusConsentimento,
    validarEmail
};
