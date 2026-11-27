/**
 * Orquestra tokens de recuperação, envio de e-mail e troca segura da senha.
 */
function criarPasswordRecoveryService({
    prisma,
    tokenService,
    passwordService,
    emailService,
    baseUrl,
    publicarSeguranca,
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

        const invalidar = (cliente) => cliente.recuperacaoSenha.updateMany({
                where: { usuarioId: usuario.id, statusLink: 'pendente' },
                data: { statusLink: 'revogado' }
            });
        const criar = (cliente) => cliente.recuperacaoSenha.create({
                data: {
                    usuarioId: usuario.id,
                    tokenRecuperacaoHash: token.tokenHash,
                    validadeToken: token.validadeToken,
                    statusLink: 'pendente'
                }
            });
        if (publicarSeguranca) {
            await prisma.$transaction(async (tx) => {
                await invalidar(tx);
                const registro = await criar(tx);
                await publicarSeguranca(tx, usuario.id, 'senha.recuperacao', registro.id, now());
            });
        } else {
            await prisma.$transaction([invalidar(prisma), criar(prisma)]);
        }

        void emailService.enviarEmailRecuperacaoSenha({
            email: usuario.email,
            linkRedefinicao: `${baseUrl}?token=${encodeURIComponent(token.token)}`
        }).catch((erro) => {
            logger.error({
                evento: 'falha_email_recuperacao',
                tipo: erro.name,
                codigo: erro.code,
                comando: erro.command,
                respostaSmtp: erro.responseCode
            });
        });

        return respostaPublica;
    }

    function erroLinkInvalido() {
        const erro = new Error(
            'Este link de redefinição é inválido ou já expirou. Solicite um novo.'
        );
        erro.status = 400;
        erro.codigo = 'LINK_RECUPERACAO_INVALIDO';
        return erro;
    }

    async function buscarLinkValido(tokenPuro) {
        let payload;
        try {
            payload = tokenService.validarTokenRecuperacao(tokenPuro);
        } catch {
            throw erroLinkInvalido();
        }

        const tokenHash = tokenService.gerarHashToken(tokenPuro);
        const recuperacao = await prisma.recuperacaoSenha.findUnique({
            where: { tokenRecuperacaoHash: tokenHash }
        });

        if (!recuperacao || recuperacao.usuarioId !== payload.usuarioId ||
            recuperacao.statusLink !== 'pendente' || recuperacao.validadeToken < now()) {
            throw erroLinkInvalido();
        }

        return recuperacao;
    }

    async function validarToken(token) {
        await buscarLinkValido(token);
        return { valido: true };
    }

    async function redefinir({ token, senha }) {
        const recuperacao = await buscarLinkValido(token);
        const { senhaHash } = await passwordService.gerarHash(senha);
        const usadoEm = now();

        await prisma.$transaction(async (tx) => {
            const consumo = await tx.recuperacaoSenha.updateMany({
                where: { id: recuperacao.id, statusLink: 'pendente' },
                data: { statusLink: 'usado', usadoEm }
            });

            if (consumo.count !== 1) throw erroLinkInvalido();

            await tx.usuario.update({
                where: { id: recuperacao.usuarioId }, data: { senhaHash }
            });
            await tx.sessao.updateMany({
                where: { usuarioId: recuperacao.usuarioId, revogadaEm: null },
                data: { revogadaEm: usadoEm }
            });
            await publicarSeguranca?.(tx, recuperacao.usuarioId, 'senha.redefinida', recuperacao.id, usadoEm);
        });

        return { mensagem: 'Senha redefinida com sucesso. Faça login com sua nova senha.' };
    }

    return { solicitar, validarToken, redefinir };
}

export { criarPasswordRecoveryService };
