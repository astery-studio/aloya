function criarParentalConsentService({
    prisma,
    emailService,
    crypto,
    baseUrl,
    now = () => new Date()
}) {
    // Função auxiliar para gerar um token seguro e o seu hash
    function gerarTokenSeguro() {
        // Gera 32 bytes de alta entropia e converte para uma string segura para URLs
        const tokenPuro = crypto
        .randomBytes(32)
        .toString('base64url');

        // Cria o hash SHA-256 do token puro. (obs: O token puro será enviado por e-mail, mas no banco é guardado apenas o hash, por segurança)
        const tokenHash = crypto
        .createHash('sha256')
        .update(tokenPuro)
        .digest('hex');

        //retorna o token puro (pro link) e o hash (pro banco)
        return {
        tokenPuro,
        tokenHash
        };
    }

    // Função auxiliar que monta a URL completa de confirmação.
    function criarLink(tokenPuro) {
        return `${baseUrl}/${encodeURIComponent(tokenPuro)}`;
    }

    // Função que cria um registro de consentimento parental pendente no banco 
    async function criarPendente(tx, {
        titularMenorId,
        emailResponsavelLegal
    }) {
        // Gera o par de token puro e hash seguro utilizando a função auxiliar.
        const { tokenPuro, tokenHash } = gerarTokenSeguro();

        // Insere o registro de consentimento parental na tabela utilizando o cliente de transação do Prisma.
        await tx.consentimentoParental.create({
        data: {
            titularMenorId,
            emailResponsavelLegal,

            // Armazenar hash; nunca o token puro.
            linkConfirmacao: tokenHash,

            statusConsentimento: 'pendente',

            // Define a validade do link para 60 minutos a partir do momento atual.
            validadeLink: new Date(
            now().getTime() + 60 * 60 * 1000
            )
        }
        });

        return {
        emailResponsavelLegal,
        linkConfirmacao: criarLink(tokenPuro)
        };
    }

    async function enviarEmail(dados) {
        return emailService.enviarEmailConsentimentoParental(dados);
    }

    //futura funcionalidade de reenviar o email (obs: Todo reenvio substitui o hash anterior e atualiza a validade, invalidando automaticamente o link antigo)
    async function reenviar(titularMenorId) {
        // Busca no banco o registro de consentimento vinculado ao ID do menor.
        const consentimento =
        await prisma.consentimentoParental.findUnique({
            where: { titularMenorId }
        });

        // Se o registro não for localizado, interrompe a execução lançando um erro HTTP 404.
        if (!consentimento) {
        const erro = new Error(
            'Consentimento parental não encontrado.'
        );

        erro.status = 404;
        erro.codigo = 'CONSENTIMENTO_NAO_ENCONTRADO';

        throw erro;
        }

        // Gera um novo par de tokens seguros para substituir o antigo.
        const { tokenPuro, tokenHash } = gerarTokenSeguro();

        // Atualiza o registro existente no banco de dados com o novo hash, nova validade e status pendente.
        await prisma.consentimentoParental.update({
        where: { titularMenorId },

        data: {
            linkConfirmacao: tokenHash,

            validadeLink: new Date(
            now().getTime() + 60 * 60 * 1000
            ),

            statusConsentimento: 'pendente'
        }
        });

        // Dispara novamente o e-mail para o responsável legal utilizando o novo link gerado.
        return enviarEmail({
        emailResponsavelLegal:
            consentimento.emailResponsavelLegal,

        linkConfirmacao: criarLink(tokenPuro)
        });
    }

    return {
        criarPendente,
        enviarEmail,
        reenviar
    };
}

module.exports = {
    criarParentalConsentService
};