const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const { env } = require('./env');
const { prisma } = require('./prisma');

const dateUtils = require('../utils/date.utils');

const {
    criarCadastroRateLimit,
    criarEmailRateLimit,
    criarLoginRateLimit,
    criarConfiguracoesContaRateLimit,
    criarAlteracaoSenhaRateLimit
} = require('../middlewares/rateLimit.middleware');

const {
    criarPasswordService
} = require('../services/password.service');

const {
    criarTokenService
} = require('../services/token.service');

const {
    criarEmailService
} = require('../services/email.service');

const {
    criarParentalConsentService
} = require('../services/parentalConsent.service');

const {
    criarAuthService
} = require('../services/auth.service');

const {
    criarAccountService
} = require('../services/account.service');

const {
    criarAuthValidator
} = require('../validators/auth.validator');

const {
    criarParentalConsentValidator
} = require('../validators/parentalConsent.validator');

const {
    criarAccountValidator
} = require('../validators/account.validator');

const {
    criarAuthController
} = require('../controllers/auth.controller');

const {
    criarAccountController
} = require('../controllers/account.controller');

const {
    criarAuthMiddleware
} = require('../middlewares/auth.middleware');

const {
    criarParentalConsentMiddleware
} = require('../middlewares/parentalConsent.middleware');

function criarContainer() {
    const transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,

        auth: {
            user: env.smtp.user,
            pass: env.smtp.password
        }
    });

    const passwordService = criarPasswordService({
        bcrypt,
        rounds: env.bcryptRounds
    });

    const tokenService = criarTokenService({
        jwt,
        crypto,
        secret: env.jwtSecret,
        expiresIn: env.jwtExpiresIn
    });

    const emailService = criarEmailService({
        transporter,
        remetente: env.smtp.from
    });

    const parentalConsentService =
        criarParentalConsentService({
            prisma,
            emailService,
            crypto,
            baseUrl: env.parentalConsentBaseUrl,
            dateUtils
        });

    const authService = criarAuthService({
        prisma,
        passwordService,
        tokenService,
        parentalConsentService,
        dateUtils
    });

    const accountService = criarAccountService({
        prisma,
        passwordService,
        parentalConsentService,
        dateUtils
    });

    const authValidator = criarAuthValidator({
        dateUtils
    });

    const accountValidator = criarAccountValidator({
        dateUtils
    });

    const parentalConsentValidator =
        criarParentalConsentValidator();

    const authMiddleware = criarAuthMiddleware({
        tokenService,
        prisma
    });

    const parentalConsentMiddleware =
        criarParentalConsentMiddleware({
            parentalConsentService
        });

    const cadastroRateLimit = criarCadastroRateLimit({
        rateLimit,
        janelaMs: env.cadastroRateLimitJanelaMs,
        limite: env.cadastroRateLimitMaximo
    });

    const loginRateLimit = criarLoginRateLimit({
        rateLimit,
        janelaMs: env.loginRateLimitJanelaMs,
        limite: env.loginRateLimitMaximo
    });

    const emailRateLimit = criarEmailRateLimit({
        rateLimit,
        janelaMs: env.emailRateLimitJanelaMs,
        limite: env.emailRateLimitMaximo
    });

    const configuracoesContaRateLimit =
    criarConfiguracoesContaRateLimit({
        rateLimit,

        janelaMs:
            env.configuracoesContaRateLimitJanelaMs,

        limite:
            env.configuracoesContaRateLimitMaximo
    });

    const alteracaoSenhaRateLimit =
        criarAlteracaoSenhaRateLimit({
            rateLimit,

            janelaMs:
                env.alteracaoSenhaRateLimitJanelaMs,

            limite:
                env.alteracaoSenhaRateLimitMaximo
        });

    const authController = criarAuthController({
        authService,
        authValidator,
        parentalConsentService,
        parentalConsentValidator
    });

    const accountController =
    criarAccountController({
        accountService,
        accountValidator
    });

    return {
        authController,
        authMiddleware,
        parentalConsentMiddleware,
        cadastroRateLimit,
        emailRateLimit,
        loginRateLimit,

        accountController,
        configuracoesContaRateLimit,
        alteracaoSenhaRateLimit
    };
}

module.exports = {
    criarContainer
};