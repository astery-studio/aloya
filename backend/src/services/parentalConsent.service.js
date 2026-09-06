function criarParentalConsentService({
    prisma,
    emailService,
    crypto,
    baseUrl,
    dateUtils,
    now = () => new Date()
}) {
    // Função auxiliar para gerar um token seguro e o seu hash.
    function gerarTokenSeguro() {
        // Gera 32 bytes de alta entropia e converte para uma string segura para URLs.
        const tokenPuro = crypto
            .randomBytes(32)
            .toString('base64url');

        // Cria o hash SHA-256 do token puro.
        // No banco é guardado apenas o hash, nunca o token recebido por e-mail.
        const tokenHash = crypto
            .createHash('sha256')
            .update(tokenPuro)
            .digest('hex');

        return {
            tokenPuro,
            tokenHash
        };
    }

    // Função auxiliar que monta a URL completa de confirmação.
    function criarLink(tokenPuro) {
        return `${baseUrl}/${encodeURIComponent(tokenPuro)}`;
    }

    // Cria uma nova data de expiração de 60 minutos para o link.
    function criarValidadeLink() {
        return new Date(
            now().getTime() + 60 * 60 * 1000
        );
    }

    // Envia o email sem expor detalhes técnicos do provedor SMTP.
    async function enviarEmail(dados) {
        try {
            await emailService.enviarEmailConsentimentoParental(dados);
        } catch (_erro) {
            const erro = new Error(
                'Não foi possível enviar o e-mail de consentimento agora. Tente novamente mais tarde.'
            );

            erro.status = 502;
            erro.codigo = 'FALHA_ENVIO_EMAIL';

            throw erro;
        }
    }

    // Função utilizada no cadastro inicial quando a menor informou um e-mail de responsável.
    async function criarPendente(tx, {
        titularMenorId,
        emailResponsavelLegal
    }) {
        const { tokenPuro, tokenHash } = gerarTokenSeguro();

        await tx.consentimentoParental.create({
            data: {
                titularMenorId,
                emailResponsavelLegal,

                // Armazena o hash; nunca o token puro.
                linkConfirmacao: tokenHash,

                statusConsentimento: 'pendente',

                validadeLink: criarValidadeLink()
            }
        });

        return {
            emailResponsavelLegal,
            linkConfirmacao: criarLink(tokenPuro)
        };
    }

    // Verifica a situação atual de acesso à Rede de Apoio de forma dinâmica.
    async function verificarAcessoRedeApoio(titularMenorId) {
        const usuario = await prisma.usuario.findUnique({
            where: {
                id: titularMenorId
            },

            select: {
                dataNascimento: true
            }
        });

        if (!usuario) {
            const erro = new Error('Usuário não encontrado.');

            erro.status = 404;
            erro.codigo = 'USUARIO_NAO_ENCONTRADO';

            throw erro;
        }

        const idade = dateUtils.calcularIdade(
            usuario.dataNascimento,
            now()
        );

        // Ao completar 16 anos, o acesso é liberado automaticamente.
        if (idade !== null && idade >= 16) {
            return {
                acessoLiberado: true,
                motivo: 'MAIOR_DE_16_ANOS',
                consentimentoNecessario: false,
                emailResponsavelInformado: false
            };
        }

        const consentimento =
            await prisma.consentimentoParental.findUnique({
                where: {
                    titularMenorId
                },

                select: {
                    emailResponsavelLegal: true,
                    statusConsentimento: true
                }
            });

        const acessoLiberado =
            consentimento?.statusConsentimento === 'aceito';

        return {
            acessoLiberado,
            motivo: acessoLiberado
                ? 'CONSENTIMENTO_ACEITO'
                : 'CONSENTIMENTO_NECESSARIO',

            consentimentoNecessario: true,

            emailResponsavelInformado: Boolean(
                consentimento?.emailResponsavelLegal
            ),

            statusConsentimento:
                consentimento?.statusConsentimento || null
        };
    }

    // Permite que a menor informe ou altere o e-mail do responsável posteriormente.
    async function solicitar(titularMenorId, emailResponsavelLegal) {
        const acesso =
            await verificarAcessoRedeApoio(titularMenorId);

        if (acesso.acessoLiberado) {
            return {
                emailEnviado: false,
                acessoRedeApoioLiberado: true,
                mensagem: 'O acesso à Rede de Apoio já está liberado.'
            };
        }

        const { tokenPuro, tokenHash } = gerarTokenSeguro();

        await prisma.consentimentoParental.upsert({
            where: {
                titularMenorId
            },

            create: {
                titularMenorId,
                emailResponsavelLegal,
                linkConfirmacao: tokenHash,
                statusConsentimento: 'pendente',
                validadeLink: criarValidadeLink()
            },

            update: {
                emailResponsavelLegal,
                linkConfirmacao: tokenHash,
                statusConsentimento: 'pendente',
                validadeLink: criarValidadeLink()
            }
        });

        await enviarEmail({
            emailResponsavelLegal,
            linkConfirmacao: criarLink(tokenPuro)
        });

        return {
            emailEnviado: true,
            acessoRedeApoioLiberado: false,
            mensagem: 'Enviamos o link de autorização ao responsável legal.'
        };
    }

    // Reenvia o link para o último e-mail informado ou para um novo e-mail de responsável legal.
    async function reenviar(
        titularMenorId,
        novoEmailResponsavelLegal = null
    ) {
        const acesso =
            await verificarAcessoRedeApoio(titularMenorId);

        if (acesso.acessoLiberado) {
            const erro = new Error(
                'O acesso à Rede de Apoio já está liberado.'
            );

            erro.status = 409;
            erro.codigo = 'CONSENTIMENTO_NAO_NECESSARIO';

            throw erro;
        }

        const consentimento =
            await prisma.consentimentoParental.findUnique({
                where: {
                    titularMenorId
                },

                select: {
                    emailResponsavelLegal: true
                }
            });

        // Se não existir e-mail anterior, a interface deve obrigatoriamente enviar um novo.
        if (
            !consentimento &&
            !novoEmailResponsavelLegal
        ) {
            const erro = new Error(
                'Informe o e-mail de um responsável legal para continuar.'
            );

            erro.status = 422;
            erro.codigo = 'EMAIL_RESPONSAVEL_NECESSARIO';

            throw erro;
        }

        const emailResponsavelLegal =
            novoEmailResponsavelLegal ||
            consentimento.emailResponsavelLegal;

        const { tokenPuro, tokenHash } = gerarTokenSeguro();

        // Cria o consentimento se ele ainda não existir; caso exista, invalida o link anterior.
        await prisma.consentimentoParental.upsert({
            where: {
                titularMenorId
            },

            create: {
                titularMenorId,
                emailResponsavelLegal,
                linkConfirmacao: tokenHash,
                statusConsentimento: 'pendente',
                validadeLink: criarValidadeLink()
            },

            update: {
                emailResponsavelLegal,
                linkConfirmacao: tokenHash,
                statusConsentimento: 'pendente',
                validadeLink: criarValidadeLink()
            }
        });

        await enviarEmail({
            emailResponsavelLegal,
            linkConfirmacao: criarLink(tokenPuro)
        });

        return {
            emailEnviado: true,
            acessoRedeApoioLiberado: false,
            mensagem: 'Enviamos um novo link de autorização.'
        };
    }

    // Confirma o consentimento quando o responsável legal clica no link recebido.
    async function confirmar(tokenPuro) {
        const tokenHash = crypto
            .createHash('sha256')
            .update(tokenPuro)
            .digest('hex');

        const consentimento =
            await prisma.consentimentoParental.findFirst({
                where: {
                    linkConfirmacao: tokenHash
                },

                select: {
                    id: true,
                    statusConsentimento: true,
                    validadeLink: true
                }
            });

        if (!consentimento) {
            const erro = new Error(
                'O link de consentimento é inválido.'
            );

            erro.status = 400;
            erro.codigo = 'LINK_CONSENTIMENTO_INVALIDO';

            throw erro;
        }

        // Evita erro caso o responsável abra o mesmo link após já ter consentido.
        if (consentimento.statusConsentimento === 'aceito') {
            return {
                acessoRedeApoioLiberado: true,
                mensagem: 'O consentimento parental já havia sido confirmado.'
            };
        }

        if (consentimento.validadeLink < now()) {
            const erro = new Error(
                'Este link de consentimento expirou. Solicite um novo envio.'
            );

            erro.status = 410;
            erro.codigo = 'LINK_CONSENTIMENTO_EXPIRADO';

            throw erro;
        }

        await prisma.consentimentoParental.update({
            where: {
                id: consentimento.id
            },

            data: {
                statusConsentimento: 'aceito'
            }
        });

        return {
            acessoRedeApoioLiberado: true,
            mensagem: 'Consentimento confirmado com sucesso.'
        };
    }

    return {
        criarPendente,
        enviarEmail,
        solicitar,
        reenviar,
        confirmar,
        verificarAcessoRedeApoio
    };
}

module.exports = {
    criarParentalConsentService
};