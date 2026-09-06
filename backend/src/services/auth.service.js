function criarAuthService({
    prisma,
    passwordService,
    tokenService,
    //cycleService, //adicionar isso somente na sprint do ciclo
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
            
            // Gera o token JWT de sessão de longa duração 
            const tokenSessao =
                tokenService.gerarTokenSessao(usuario);

            /* Bloco deve ser descomentado na sprint do ciclo
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
            */
        
            if (
                dados.menorDe16 &&
                dados.emailResponsavelLegal
            ) {
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
                //cicloInicial // deve ser descomentado na sprint do ciclo
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

            /* Deve ser descomentado na sprint do ciclo
            cicloInicial: { 
            id: resultado.cicloInicial.registroCiclo.id, 

            dataInicio:
                resultado.cicloInicial.registroCiclo.dataInicio
            }, 

            previsao: resultado.cicloInicial.previsao,
            */
        
            consentimentoParental: dados.menorDe16
            ? {
                exigidoParaRedeApoio: true,
                solicitado: solicitouConsentimento,
                redeApoioBloqueada: true,
                emailEnviado
                }
            : {
                exigidoParaRedeApoio: false,
                solicitado: false,
                redeApoioBloqueada: false,
                emailEnviado: false
                },

            mensagem: `Boas-vindas ao ALOYA, ${resultado.usuario.nome}.`
        };
        } catch (erro) {
        // Captura o erro nativo do Prisma de violação de chave única (P2002) caso haja tentativa de cadastro simultâneo com o mesmo email.
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

    return {
        cadastrar
    };
}

module.exports = {
    criarAuthService
};