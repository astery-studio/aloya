//Puxa e valida as configurações privadas usadas pelo backend.
import 'dotenv/config'

function obterVariavelObrigatoria(nome) {
    const valor = process.env[nome]

    if (!valor) {
        throw new Error(`A variável ${nome} não foi configurada.`)
    }

    return valor
}

function obterInteiroPositivo(nome, valorPadrao) {
    const valor = Number(process.env[nome] || valorPadrao)

    if (!Number.isInteger(valor) || valor <= 0) {
        throw new Error(`${nome} deve ser um inteiro positivo.`)
    }

    return valor
}

const bcryptRounds = Number(process.env.BCRYPT_ROUNDS || 12)

if (!Number.isInteger(bcryptRounds) || bcryptRounds < 10 || bcryptRounds > 15) {
    throw new Error('BCRYPT_ROUNDS deve ser um inteiro entre 10 e 15.')
}

const env = {
    port: obterInteiroPositivo('PORT', 3000),

    cadastroRateLimitJanelaMs: obterInteiroPositivo('CADASTRO_RATE_LIMIT_JANELA_MS', 900000),
    cadastroRateLimitMaximo: obterInteiroPositivo('CADASTRO_RATE_LIMIT_MAXIMO', 5),

    emailRateLimitJanelaMs: obterInteiroPositivo('EMAIL_RATE_LIMIT_JANELA_MS', 900000),
    emailRateLimitMaximo: obterInteiroPositivo('EMAIL_RATE_LIMIT_MAXIMO', 3),

    loginRateLimitJanelaMs: obterInteiroPositivo('LOGIN_RATE_LIMIT_JANELA_MS', 900000),
    loginRateLimitMaximo: obterInteiroPositivo('LOGIN_RATE_LIMIT_MAXIMO', 5),

    configuracoesContaRateLimitJanelaMs: obterInteiroPositivo('CONFIGURACOES_CONTA_RATE_LIMIT_JANELA_MS', 900000),
    configuracoesContaRateLimitMaximo: obterInteiroPositivo('CONFIGURACOES_CONTA_RATE_LIMIT_MAXIMO', 20),

    alteracaoSenhaRateLimitJanelaMs: obterInteiroPositivo('ALTERACAO_SENHA_RATE_LIMIT_JANELA_MS', 900000),
    alteracaoSenhaRateLimitMaximo: obterInteiroPositivo('ALTERACAO_SENHA_RATE_LIMIT_MAXIMO', 5),

    categoriaPermissaoRateLimitJanelaMs: obterInteiroPositivo('CATEGORIA_PERMISSAO_RATE_LIMIT_JANELA_MS', 900000),
    categoriaPermissaoRateLimitMaximo: obterInteiroPositivo('CATEGORIA_PERMISSAO_RATE_LIMIT_MAXIMO', 20),

    jwtSecret: obterVariavelObrigatoria('JWT_SECRET'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '90d',
    bcryptRounds,

    parentalConsentBaseUrl: obterVariavelObrigatoria('PARENTAL_CONSENT_BASE_URL'),
    passwordResetBaseUrl: process.env.PASSWORD_RESET_BASE_URL || 'aloya://reset-password',

    smtp: {
        host: obterVariavelObrigatoria('SMTP_HOST'),
        port: obterInteiroPositivo('SMTP_PORT', 587),
        secure: process.env.SMTP_SECURE === 'true',
        user: obterVariavelObrigatoria('SMTP_USER'),
        password: obterVariavelObrigatoria('SMTP_PASSWORD'),
        from: obterVariavelObrigatoria('SMTP_FROM')
    }
}

if (Buffer.byteLength(env.jwtSecret, 'utf8') < 32) {
    throw new Error('JWT_SECRET deve possuir pelo menos 32 caracteres.')
}

export { env }