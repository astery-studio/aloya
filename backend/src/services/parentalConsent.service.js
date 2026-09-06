function criarParentalConsentService({
    prisma,
    emailService,
    crypto,
    dateUtils,
    baseUrl,
    logger = console,
    now = () => new Date()
}) {
    // Função auxiliar para criar erros padronizados da aplicação
    function criarErro(codigo, mensagem, status) {
        const erro = new Error(mensagem);

        erro.codigo = codigo;
        erro.status = status;

        return erro;
    }

    // Função auxiliar para gerar um token seguro e seu hash
    function gerarTokenSeguro() {
        // Gera 32 bytes aleatórios e seguros para uso no link
        const tokenPuro = crypto
            .randomBytes(32)
            .toString('base64url');

        // Gera o hash que será salvo no banco, nunca o token puro
        const tokenHash = crypto
            .createHash('sha256')
            .update(tokenPuro)
            .digest('hex');

        return {
            tokenPuro,
            tokenHash
        };
    }

    // Função auxiliar que monta a URL enviada no e-mail
    function criarLink(tokenPuro) {
        return `${baseUrl}/${encodeURIComponent(tokenPuro)}`;
    }

    // Cria ou renova o consentimento pendente dentro de uma transação
    async function criarOuRenovarPendente(
        tx,
        titularMenorId,
        emailResponsavelLegal
    ) {
        const consentimentoExistente =
            await tx.consentimentoParental.findUnique({
                where: { titularMenorId }
            });

        // Não gera outro link quando o consentimento já foi liberado
        if (
            consentimentoExistente &&
            consentimentoExistente.statusConsentimento === 'liberado'
        ) {
            return {
                jaLiberado: true
            };
        }

        // Gera um novo token, invalidando automaticamente o antigo
        const { tokenPuro, tokenHash } = gerarTokenSeguro();

        const dadosConsentimento = {
            emailResponsavelLegal,
            linkConfirmacao: tokenHash,
            statusConsentimento: 'pendente',

            // O link expira em 60 minutos
            validadeLink: new Date(
                now().getTime() + 60 * 60 * 1000
            )
        };

        if (consentimentoExistente) {
            await tx.consentimentoParental.update({
                where: { titularMenorId },
                data: dadosConsentimento
            });
        } else {
            await tx.consentimentoParental.create({
                data: {
                    titularMenorId,
                    ...dadosConsentimento
                }
            });
        }

        return {
            jaLiberado: false,
            emailResponsavelLegal,
            linkConfirmacao: criarLink(tokenPuro)
        };
    }

    // Cria o consentimento pendente no momento do cadastro
    async function criarPendente(tx, {
        titularMenorId,
        emailResponsavelLegal
    }) {
        return criarOuRenovarPendente(
            tx,
            titularMenorId,
            emailResponsavelLegal
        );
    }

    // Envia o e-mail por meio do serviço genérico de e-mail
    async function enviarEmail(dadosEmail) {
        return emailService.enviarEmailConsentimentoParental(
            dadosEmail
        );
    }

    // Solicita consentimento quando o titular adiciona o e-mail posteriormente
    async function solicitar(
        titularMenorId,
        emailResponsavelLegal
    ) {
        const solicitacao = await prisma.$transaction(
            async (tx) => {
                const usuario = await tx.usuario.findUnique({
                    where: { id: titularMenorId },
                    select: {
                        id: true,
                        papel: true,
                        dataNascimento: true
                    }
                });

                if (!usuario || usuario.papel !== 'principal') {
                    throw criarErro(
                        'USUARIO_NAO_ENCONTRADO',
                        'Usuário não encontrado.',
                        404
                    );
                }

                // Quando a pessoa completa 16 anos, não precisa de consentimento
                if (
                    dateUtils.calcularIdade(
                        usuario.dataNascimento
                    ) >= 16
                ) {
                    throw criarErro(
                        'CONSENTIMENTO_NAO_NECESSARIO',
                        'O consentimento parental não é necessário para esta conta.',
                        409
                    );
                }

                return criarOuRenovarPendente(
                    tx,
                    usuario.id,
                    emailResponsavelLegal
                );
            }
        );

        if (solicitacao.jaLiberado) {
            return {
                status: 'liberado',
                emailEnviado: false
            };
        }

        try {
            await enviarEmail(solicitacao);

            return {
                status: 'pendente',
                emailEnviado: true
            };
        } catch (erroEmail) {
            // Não interrompe o uso do app; o titular poderá reenviar depois
            logger.error({
                evento: 'falha_envio_consentimento_parental',
                tipoErro: erroEmail.name
            });

            return {
                status: 'pendente',
                emailEnviado: false
            };
        }
    }

    // Reenvia o e-mail usando o endereço já salvo no consentimento
    async function reenviar(titularMenorId) {
        const solicitacao = await prisma.$transaction(
            async (tx) => {
                const usuario = await tx.usuario.findUnique({
                    where: { id: titularMenorId },
                    select: {
                        id: true,
                        dataNascimento: true
                    }
                });

                if (!usuario) {
                    throw criarErro(
                        'USUARIO_NAO_ENCONTRADO',
                        'Usuário não encontrado.',
                        404
                    );
                }

                if (
                    dateUtils.calcularIdade(
                        usuario.dataNascimento
                    ) >= 16
                ) {
                    throw criarErro(
                        'CONSENTIMENTO_NAO_NECESSARIO',
                        'O consentimento parental não é necessário para esta conta.',
                        409
                    );
                }

                const consentimento =
                    await tx.consentimentoParental.findUnique({
                        where: { titularMenorId }
                    });

                if (!consentimento) {
                    throw criarErro(
                        'CONSENTIMENTO_NAO_SOLICITADO',
                        'Informe primeiro o e-mail de um responsável legal.',
                        409
                    );
                }

                return criarOuRenovarPendente(
                    tx,
                    titularMenorId,
                    consentimento.emailResponsavelLegal
                );
            }
        );

        if (solicitacao.jaLiberado) {
            return {
                status: 'liberado',
                emailEnviado: false
            };
        }

        try {
            await enviarEmail(solicitacao);

            return {
                status: 'pendente',
                emailEnviado: true
            };
        } catch (erroEmail) {
            logger.error({
                evento: 'falha_reenvio_consentimento_parental',
                tipoErro: erroEmail.name
            });

            return {
                status: 'pendente',
                emailEnviado: false
            };
        }
    }

    // Confirma o consentimento quando o responsável acessa o link público
    async function confirmar(tokenPuro) {
        const tokenHash = crypto
            .createHash('sha256')
            .update(tokenPuro)
            .digest('hex');

        const consentimento =
            await prisma.consentimentoParental.findUnique({
                where: {
                    linkConfirmacao: tokenHash
                }
            });

        if (!consentimento) {
            throw criarErro(
                'LINK_CONSENTIMENTO_INVALIDO',
                'Link de consentimento inválido.',
                404
            );
        }

        // Mantém a confirmação idempotente caso o responsável clique duas vezes
        if (consentimento.statusConsentimento === 'liberado') {
            return {
                status: 'liberado',
                mensagem: 'O consentimento já havia sido confirmado.'
            };
        }

        if (consentimento.validadeLink < now()) {
            await prisma.consentimentoParental.update({
                where: { id: consentimento.id },
                data: {
                    statusConsentimento: 'expirado'
                }
            });

            throw criarErro(
                'LINK_CONSENTIMENTO_EXPIRADO',
                'Este link expirou. Solicite um novo envio.',
                410
            );
        }

        await prisma.consentimentoParental.update({
            where: { id: consentimento.id },
            data: {
                statusConsentimento: 'liberado'
            }
        });

        return {
            status: 'liberado',
            mensagem: 'Consentimento confirmado com sucesso.'
        };
    }

    return {
        criarPendente,
        solicitar,
        reenviar,
        confirmar
    };
}

module.exports = {
    criarParentalConsentService
};