function criarAuthService({
    prisma,
    passwordService,
    tokenService,
    cycleService,
    parentalConsentService,
    logger = console
    }) {
    async function cadastrar(dados, dispositivo) {
        const usuarioExistente = await prisma.usuario.findUnique({
        where: {
            email: dados.email
        },

        select: {
            id: true
        }
        });

        // Se o e-mail já estiver em uso, interrompe o fluxo e lança um erro
        if (usuarioExistente) {
        const erro = new Error(
            'Este e-mail já está em uso. Tente fazer login.'
        );

        erro.status = 409;
        erro.codigo = 'EMAIL_JA_CADASTRADO';

        throw erro;
        }

        // Gera o salt individual e o hash seguro da senha através do serviço de senha
        const { salt, senhaHash } =
        await passwordService.gerarHash(dados.senha);

        let emailConsentimentoPendente = null;

        try {
        const resultado = await prisma.$transaction(
            async (tx) => {
            // Cria o registro principal do usuário
            const usuario = await tx.usuario.create({
                data: {
                nome: dados.nome,
                dataNascimento: dados.dataNascimento,
                email: dados.email,

                senhaHash,
                salt,

                papel: 'principal',
                statusConta: 'ativa',

                duracaoCicloInformada:
                    dados.duracaoCicloInformada,

                duracaoMenstruacaoInformada:
                    dados.duracaoMenstruacaoInformada,

                duracaoLuteaInformada:
                    dados.duracaoLuteaInformada || 14,

                temaVisual: 'automatico'
                },

                select: {
                id: true,
                nome: true,
                email: true,
                papel: true,
                statusConta: true
                }
            });
        }
            // Gera o token JWT de sessão de longa duração 
            const tokenSessao =
                tokenService.gerarTokenSessao(usuario);

            const cicloInicial =
                await cycleService.criarCicloInicial(tx, {
                usuarioId: usuario.id,

                dataInicio:
                    dados.dataInicioUltimaMenstruacao,

                dataFim:
                    dados.dataFimUltimaMenstruacao,

                duracaoCicloInformada:
                    dados.duracaoCicloInformada,

                duracaoMenstruacaoInformada:
                    dados.duracaoMenstruacaoInformada,

                duracaoLuteaInformada:
                    dados.duracaoLuteaInformada
                });

            // Se o usuário for menor de 16 anos, cria um registro de consentimento parental pendente
            if (dados.menorDe16) {
                emailConsentimentoPendente =
                await parentalConsentService.criarPendente(tx, {
                    titularMenorId: usuario.id,

                    emailResponsavelLegal:
                    dados.emailResponsavelLegal
                });
            }

            // Cria o registro de sessão ativa vinculando o token JWT gerado e o dispositivo opcional.
            await tx.sessao.create({
                data: {
                usuarioId: usuario.id,
                tokenSessao,
                dispositivo: dispositivo || null
                }
            });

            return {
                usuario,
                tokenSessao,
                cicloInicial
            };
            
        );

        let emailEnviado = true;

        if (emailConsentimentoPendente) {
            try {
            await parentalConsentService.enviarEmail(
                emailConsentimentoPendente
            );
            } catch (erroEmail) {
            emailEnviado = false;

            // Registra a falha de envio no logger sem interromper o fluxo de resposta.
            logger.error({
                evento: 'falha_envio_consentimento_parental',
                tipoErro: erroEmail.name
            });
            }
        }
        throw erro;
        }

    return {
        cadastrar
    };
}

module.exports = {
    criarAuthService
};