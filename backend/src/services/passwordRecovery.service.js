function criarPasswordRecoveryService({
    prisma,
    tokenService,
    passwordService,
    emailService,
    baseUrl,
    now = () => new Date(),
    logger = console
}) {
    const respostaPublica = {
        mensagem: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.'
    };

    async function solicitar(email) {
        const usuario = await prisma.usuario.findUnique({
            where: { email },
            select: { id: true, email: true }
        });

        if (!usuario) return respostaPublica;

        const token = tokenService.gerarTokenRecuperacao(usuario);

        await prisma.$transaction([
            prisma.recuperacaoSenha.updateMany({
                where: { usuarioId: usuario.id, statusLink: 'pendente' },
                data: { statusLink: 'revogado' }
            }),
            prisma.recuperacaoSenha.create({
                data: {
                    usuarioId: usuario.id,
                    tokenRecuperacaoHash: token.tokenHash,
                    validadeToken: token.validadeToken,
                    statusLink: 'pendente'
                }
            })
        ]);

        try {
            await emailService.enviarEmailRecuperacaoSenha({
                email: usuario.email,
                linkRedefinicao: `${baseUrl}?token=${encodeURIComponent(token.token)}`
            });
        } catch (erro) {
            logger.error({ evento: 'falha_email_recuperacao', tipo: erro.name });
        }

        return respostaPublica;
    }

    return { solicitar };
}

export { criarPasswordRecoveryService };
