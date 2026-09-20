function criarAuthService({
    prisma,
    passwordService,
    tokenService,
    parentalConsentService,
    dateUtils,
    logger = console
}) {
    async function criarRegistroInicial(
        tx,
        usuarioId,
        dados
    ) {
        const dataInicio =
            dados.dataInicioUltimaMenstruacao;

        const dataFim =
            dados.dataFimUltimaMenstruacao ||
            null;

        const diasMenstruacao = dataFim
            ? dateUtils.gerarDiasMenstruacao(
                dataInicio,
                dataFim
            )
            : [dataInicio];

        const duracaoMenstruacao = dataFim
            ? dateUtils.calcularDiasInclusivos(
                dataInicio,
                dataFim
            )
            : null;

        return tx.registroCiclo.create({
            data: {
                usuarioId,
                dataInicio,
                dataFim,
                duracaoMenstruacao,
                duracaoCiclo: null,
                ehCicloInicial: true,

                diasMenstruacao: {
                    create:
                        diasMenstruacao.map(
                            (data) => ({
                                data
                            })
                        )
                }
            },

            select: {
                id: true,
                dataInicio: true,
                dataFim: true
            }
        });
    }
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

        // Gera o hash seguro da senha. O bcrypt já incorpora o salt dentro do próprio hash.
        const { senhaHash } =
            await passwordService.gerarHash(dados.senha);

        let emailConsentimentoPendente = null;

        try {
            const resultado = await prisma.$transaction(
                async (tx) => {
                    // Cria o registro principal da pessoa usuária
                    const usuario = await tx.usuario.create({
                        data: {
                            nome: dados.nome,
                            dataNascimento: dados.dataNascimento,
                            email: dados.email,

                            senhaHash,

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

                    // Gera o token JWT de sessão e seus dados seguros para persistência.
                    const sessao =
                        tokenService.gerarTokenSessao(usuario);
                    const cicloInicial =
                        await criarRegistroInicial(
                            tx,
                            usuario.id,
                            dados
                        );

                    if (
                        dados.menorDe16 &&
                        dados.emailResponsavelLegal
                    ) {
                        emailConsentimentoPendente =
                            await parentalConsentService.criarPendente(tx, {
                                titularMenorId: usuario.id,
                                nomeTitular: usuario.nome,
                                emailTitular: usuario.email,

                                emailResponsavelLegal:
                                    dados.emailResponsavelLegal
                            });
                    }

                    // Cria o registro de sessão sem armazenar o token JWT puro.
                    await tx.sessao.create({
                        data: {
                            usuarioId: usuario.id,
                            tokenSessaoHash: sessao.tokenHash,
                            validadeSessao: sessao.validadeSessao,
                            dispositivo: dispositivo || null
                        }
                    });

                    return {
                        usuario,
                        cicloInicial,
                        tokenSessao: sessao.token
                    };
                }
            );

            let emailEnviado = false;

            if (emailConsentimentoPendente) {
                try {
                    await parentalConsentService.enviarEmail(
                        emailConsentimentoPendente
                    );

                    emailEnviado = true;
                } catch (erroEmail) {
                    // Registra a falha de envio no logger sem interromper o fluxo de resposta.
                    logger.error({
                        evento: 'falha_envio_consentimento_parental',
                        tipoErro: erroEmail.name
                    });
                }
            }

            const solicitouConsentimento =
                Boolean(emailConsentimentoPendente);

            return {
                usuario: resultado.usuario,

                autenticacao: {
                    token: resultado.tokenSessao,
                    tipo: 'Bearer'
                },

                cicloInicial: {
                    id: resultado.cicloInicial.id,

                    dataInicio:
                        resultado.cicloInicial.dataInicio,

                    dataFim:
                        resultado.cicloInicial.dataFim
                },

                consentimentoParental: dados.menorDe16
                    ? {
                        exigidoParaRedeApoio: true,
                        solicitado: solicitouConsentimento,
                        redeApoioBloqueada: true,
                        emailEnviado,

                        mensagemEnvio:
                            emailConsentimentoPendente &&
                            !emailEnviado
                                ? 'Não foi possível enviar o pedido de autorização no momento. Tente novamente.'
                                : null
                    }
                    : {
                        exigidoParaRedeApoio: false,
                        solicitado: false,
                        redeApoioBloqueada: false,
                        emailEnviado: false,
                        mensagemEnvio: null
                    },

                mensagem: `Boas-vindas ao ALOYA, ${resultado.usuario.nome}.`
            };
        } catch (erro) {
            // Captura o erro nativo do Prisma de violação de chave única (P2002).
            if (erro.code === 'P2002') {
                const erroEmail = new Error(
                    'Este e-mail já está em uso. Tente fazer login.'
                );

                erroEmail.status = 409;
                erroEmail.codigo = 'EMAIL_JA_CADASTRADO';

                throw erroEmail;
            }

            throw erro;
        }
    }

    // Autentica a pessoa usuária e cria uma nova sessão persistida.
    async function realizarLogin(dados, dispositivo) {
        const usuario = await prisma.usuario.findUnique({
            where: {
                email: dados.email
            },

            select: {
                id: true,
                nome: true,
                email: true,
                senhaHash: true,
                papel: true,
                statusConta: true
            }
        });

        // A comparação ocorre mesmo sem usuário encontrado para reduzir enumeração por tempo de resposta.
        const senhaCorresponde =
            await passwordService.compararSenha(
                dados.senha,
                usuario ? usuario.senhaHash : null
            );

        // A resposta é idêntica para e-mail inexistente, senha inválida ou conta indisponível.
        if (
            !usuario ||
            !senhaCorresponde ||
            usuario.statusConta !== 'ativa'
        ) {
            const erro = new Error(
                'E-mail ou senha incorretos.'
            );

            erro.status = 401;
            erro.codigo = 'CREDENCIAIS_INVALIDAS';

            throw erro;
        }

        // Gera uma nova sessão segura para a pessoa usuária autenticada.
        const sessao =
            tokenService.gerarTokenSessao(usuario);

        // Persiste somente o hash do token, nunca o token JWT puro.
        await prisma.sessao.create({
            data: {
                usuarioId: usuario.id,
                tokenSessaoHash: sessao.tokenHash,
                validadeSessao: sessao.validadeSessao,
                dispositivo: dispositivo || null
            }
        });

        return {
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                papel: usuario.papel
            },

            autenticacao: {
                token: sessao.token,
                tipo: 'Bearer'
            }
        };
    }

    return {
        cadastrar,
        realizarLogin
    };
}

export {
    criarAuthService
};