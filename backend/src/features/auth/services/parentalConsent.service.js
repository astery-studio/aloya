/**
 * Gerencia emissão, reenvio, consulta e confirmação do consentimento parental.
 */
import {
    MENSAGEM_CONSENTIMENTO_CONFIRMADO,
    MENSAGEM_EMAIL_RESPONSAVEL_IGUAL_TITULAR,
    MENSAGEM_ERRO_ENVIO_CONSENTIMENTO,
    MENSAGEM_SOLICITACAO_CONSENTIMENTO_ENVIADA
} from '../constants/parentalConsent.constants.js';

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
        const tokenPuro = crypto.randomBytes(32).toString('base64url');

        // Cria o hash SHA-256 do token puro.
        // No banco é guardado apenas o hash, nunca o token recebido por e-mail.
        const tokenHash = crypto.createHash('sha256').update(tokenPuro).digest('hex');

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
        return new Date(now().getTime() + 60 * 60 * 1000);
    }

    // Busca somente os dados necessários da titular para aplicar as regras de consentimento.
    async function buscarTitular(titularMenorId, db = prisma) {
        const titular = await db.usuario.findUnique({
            where: {
                id: titularMenorId
            },

            select: {
                id: true,
                nome: true,
                email: true,
                dataNascimento: true,
                papel: true
            }
        });

        if (!titular) {
            const erro = new Error('Usuário não encontrado.');

            erro.status = 404;
            erro.codigo = 'USUARIO_NAO_ENCONTRADO';

            throw erro;
        }

        return titular;
    }

    function validarTitular(titular) {
        if (!['principal', 'principal_e_contato_apoio'].includes(titular.papel)) {
            const erro = new Error('Somente a titular pode gerenciar o consentimento parental.');
            erro.status = 403;
            erro.codigo = 'CONSENTIMENTO_NAO_AUTORIZADO';
            throw erro;
        }
    }

    // Impede que a pessoa titular use o próprio e-mail como e-mail de responsável legal.
    function validarEmailResponsavel(emailTitular, emailResponsavelLegal) {
        if (emailTitular === emailResponsavelLegal) {
            const erro = new Error(MENSAGEM_EMAIL_RESPONSAVEL_IGUAL_TITULAR);

            erro.status = 422;
            erro.codigo = 'EMAIL_RESPONSAVEL_IGUAL_TITULAR';

            throw erro;
        }
    }

    // Encerra links pendentes quando a titular já possui 16 anos completos.
    async function encerrarPendenciaSeMaiorDe16(titular, db = prisma) {
        const idade = dateUtils.calcularIdade(titular.dataNascimento, now());

        if (idade === null || idade < 16) {
            return false;
        }

        await db.consentimentoParental.updateMany({
            where: {
                titularMenorId: titular.id,
                statusConsentimento: 'pendente'
            },

            data: {
                statusConsentimento: 'revogado'
            }
        });

        return true;
    }

    // Volta a exigir autorização quando uma correção da data de nascimento torna a titular menor.
    async function reativarAposCorrecaoNascimento(tx, titularMenorId) {
        await tx.consentimentoParental.updateMany({
            where: {
                titularMenorId,
                statusConsentimento: {
                    in: ['pendente', 'liberado', 'expirado']
                }
            },
            data: {
                statusConsentimento: 'revogado',
                respondidoEm: null
            }
        });
    }

    // Envia o email sem expor detalhes técnicos do provedor SMTP.
    async function enviarEmail(dados) {
        try {
            await emailService.enviarEmailConsentimentoParental(dados);
        } catch (_erro) {
            const erro = new Error(MENSAGEM_ERRO_ENVIO_CONSENTIMENTO);

            erro.status = 502;
            erro.codigo = 'FALHA_ENVIO_EMAIL';

            throw erro;
        }
    }

    // Função utilizada no cadastro inicial quando a menor informou um e-mail de responsável.
    async function criarPendente(
        tx,
        { titularMenorId, nomeTitular, emailTitular, emailResponsavelLegal }
    ) {
        validarEmailResponsavel(emailTitular, emailResponsavelLegal);

        const { tokenPuro, tokenHash } = gerarTokenSeguro();

        await tx.consentimentoParental.create({
            data: {
                titularMenorId,
                emailResponsavelLegal,

                // Armazena o hash; nunca o token puro.
                tokenConfirmacaoHash: tokenHash,

                statusConsentimento: 'pendente',

                validadeLink: criarValidadeLink()
            }
        });

        return {
            nomeTitular,
            emailResponsavelLegal,
            linkConfirmacao: criarLink(tokenPuro)
        };
    }

    // Verifica a situação atual de acesso à Rede de Apoio de forma dinâmica.
    async function verificarAcessoRedeApoio(titularMenorId) {
        const titular = await buscarTitular(titularMenorId);
        validarTitular(titular);

        // Ao completar 16 anos, o acesso é liberado e links pendentes são revogados.
        if (await encerrarPendenciaSeMaiorDe16(titular)) {
            return {
                acessoLiberado: true,
                motivo: 'MAIOR_DE_16_ANOS',
                consentimentoNecessario: false,
                emailResponsavelInformado: false,
                emailResponsavelLegal: null,
                statusConsentimento: 'revogado'
            };
        }

        const consentimento = await prisma.consentimentoParental.findUnique({
            where: {
                titularMenorId
            },

            select: {
                emailResponsavelLegal: true,
                statusConsentimento: true
            }
        });

        const acessoLiberado = consentimento?.statusConsentimento === 'liberado';

        return {
            acessoLiberado,

            motivo: acessoLiberado ? 'CONSENTIMENTO_LIBERADO' : 'CONSENTIMENTO_NECESSARIO',

            consentimentoNecessario: !acessoLiberado,

            emailResponsavelInformado: Boolean(consentimento?.emailResponsavelLegal),

            // Permite que a interface exiba o e-mail já informado pela própria titular.
            emailResponsavelLegal: consentimento?.emailResponsavelLegal || null,

            statusConsentimento: consentimento?.statusConsentimento || null
        };
    }

    // Permite que a menor informe ou altere o e-mail do responsável posteriormente.
    async function solicitar(titularMenorId, emailResponsavelLegal) {
        const titular = await buscarTitular(titularMenorId);
        validarTitular(titular);

        if (await encerrarPendenciaSeMaiorDe16(titular)) {
            return {
                emailEnviado: false,
                acessoRedeApoioLiberado: true,
                mensagem: 'O acesso à Rede de Apoio já está liberado.'
            };
        }

        validarEmailResponsavel(titular.email, emailResponsavelLegal);

        const { tokenPuro, tokenHash } = gerarTokenSeguro();

        // Um novo envio ou troca de e-mail invalida automaticamente o link anterior.
        await prisma.consentimentoParental.upsert({
            where: {
                titularMenorId
            },

            create: {
                titularMenorId,
                emailResponsavelLegal,
                tokenConfirmacaoHash: tokenHash,
                statusConsentimento: 'pendente',
                validadeLink: criarValidadeLink()
            },

            update: {
                emailResponsavelLegal,
                tokenConfirmacaoHash: tokenHash,
                statusConsentimento: 'pendente',
                validadeLink: criarValidadeLink(),
                respondidoEm: null
            }
        });

        await enviarEmail({
            nomeTitular: titular.nome,
            emailResponsavelLegal,
            linkConfirmacao: criarLink(tokenPuro)
        });

        return {
            emailEnviado: true,
            acessoRedeApoioLiberado: false,
            statusConsentimento: 'pendente',
            mensagem: MENSAGEM_SOLICITACAO_CONSENTIMENTO_ENVIADA
        };
    }

    // Reenvia o link para o último e-mail informado ou para um novo e-mail de responsável legal.
    async function reenviar(titularMenorId, novoEmailResponsavelLegal = null) {
        const titular = await buscarTitular(titularMenorId);
        validarTitular(titular);

        if (await encerrarPendenciaSeMaiorDe16(titular)) {
            const erro = new Error('O acesso à Rede de Apoio já está liberado.');

            erro.status = 409;
            erro.codigo = 'CONSENTIMENTO_NAO_NECESSARIO';

            throw erro;
        }

        const consentimento = await prisma.consentimentoParental.findUnique({
            where: {
                titularMenorId
            },

            select: {
                emailResponsavelLegal: true,
                statusConsentimento: true
            }
        });

        if (!consentimento) {
            const erro = new Error('Informe o e-mail de um responsável legal para continuar.');

            erro.status = 422;
            erro.codigo = 'EMAIL_RESPONSAVEL_NECESSARIO';

            throw erro;
        }

        // O reenvio só é permitido enquanto a solicitação aguarda confirmação.
        if (consentimento.statusConsentimento !== 'pendente') {
            const erro = new Error(
                'Esta solicitação de consentimento não está mais aguardando confirmação.'
            );

            erro.status = 409;
            erro.codigo = 'CONSENTIMENTO_NAO_PENDENTE';

            throw erro;
        }

        const emailResponsavelLegal =
            novoEmailResponsavelLegal || consentimento.emailResponsavelLegal;

        validarEmailResponsavel(titular.email, emailResponsavelLegal);

        const { tokenPuro, tokenHash } = gerarTokenSeguro();

        // Atualiza o e-mail quando necessário e invalida o token anterior.
        await prisma.consentimentoParental.update({
            where: {
                titularMenorId
            },

            data: {
                emailResponsavelLegal,
                tokenConfirmacaoHash: tokenHash,
                statusConsentimento: 'pendente',
                validadeLink: criarValidadeLink(),
                respondidoEm: null
            }
        });

        await enviarEmail({
            nomeTitular: titular.nome,
            emailResponsavelLegal,
            linkConfirmacao: criarLink(tokenPuro)
        });

        return {
            emailEnviado: true,
            acessoRedeApoioLiberado: false,
            statusConsentimento: 'pendente',
            mensagem: MENSAGEM_SOLICITACAO_CONSENTIMENTO_ENVIADA
        };
    }

    // Confirma o consentimento quando o responsável legal clica no link recebido.
    async function confirmar(tokenPuro) {
        const tokenHash = crypto.createHash('sha256').update(tokenPuro).digest('hex');

        const resultado = await prisma.$transaction(async (tx) => {
            const instante = now();
            const consentimento = await tx.consentimentoParental.findFirst({
                where: { tokenConfirmacaoHash: tokenHash },
                select: {
                    id: true,
                    titularMenorId: true,
                    statusConsentimento: true,
                    validadeLink: true
                }
            });

            if (!consentimento) {
                const erro = new Error('O link de consentimento é inválido.');
                erro.status = 400;
                erro.codigo = 'LINK_CONSENTIMENTO_INVALIDO';
                throw erro;
            }

            const titular = await buscarTitular(consentimento.titularMenorId, tx);
            validarTitular(titular);

            if (await encerrarPendenciaSeMaiorDe16(titular, tx)) {
                return {
                    acessoRedeApoioLiberado: true,
                    mensagem: 'A Rede de Apoio já está liberada para esta titular.'
                };
            }

            if (consentimento.statusConsentimento === 'liberado') {
                return {
                    acessoRedeApoioLiberado: true,
                    mensagem: 'A autorização já havia sido confirmada.'
                };
            }

            if (consentimento.statusConsentimento !== 'pendente') {
                const erro = new Error('Este link de consentimento não está mais disponível.');
                erro.status = 410;
                erro.codigo = 'LINK_CONSENTIMENTO_INDISPONIVEL';
                throw erro;
            }

            if (consentimento.validadeLink < instante) {
                await tx.consentimentoParental.updateMany({
                    where: {
                        id: consentimento.id,
                        tokenConfirmacaoHash: tokenHash,
                        statusConsentimento: 'pendente'
                    },
                    data: { statusConsentimento: 'expirado' }
                });
                return { linkExpirado: true };
            }

            const atualizacao = await tx.consentimentoParental.updateMany({
                where: {
                    id: consentimento.id,
                    tokenConfirmacaoHash: tokenHash,
                    statusConsentimento: 'pendente',
                    validadeLink: { gte: instante }
                },
                data: {
                    statusConsentimento: 'liberado',
                    respondidoEm: instante
                }
            });
            if (atualizacao.count !== 1) {
                const erro = new Error('Este link de consentimento não está mais disponível.');
                erro.status = 409;
                erro.codigo = 'CONSENTIMENTO_JA_PROCESSADO';
                throw erro;
            }

            await tx.notificacao.create({
                data: {
                    usuarioId: titular.id,
                    tipoOrigem: 'rede_apoio',
                    origemId: consentimento.id,
                    dataHoraProgramada: instante,
                    statusEnvio: 'agendada'
                }
            });

            return {
                acessoRedeApoioLiberado: true,
                nomeTitular: titular.nome,
                mensagem: MENSAGEM_CONSENTIMENTO_CONFIRMADO
            };
        });

        if (resultado.linkExpirado) {
            const erro = new Error('Este link de consentimento expirou. Solicite um novo envio.');
            erro.status = 410;
            erro.codigo = 'LINK_CONSENTIMENTO_EXPIRADO';
            throw erro;
        }

        return resultado;
    }

    return {
        criarPendente,
        enviarEmail,
        solicitar,
        reenviar,
        confirmar,
        verificarAcessoRedeApoio,
        reativarAposCorrecaoNascimento
    };
}

export { criarParentalConsentService };
