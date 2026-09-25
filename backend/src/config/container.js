import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';

import { env } from './env.js';
import { prisma } from './prisma.js';

import * as dateUtils from '../utils/date.utils.js';

import {
    criarCadastroRateLimit,
    criarContaLoginRateLimit,
    criarConfiguracoesContaRateLimit,
    criarAlteracaoSenhaRateLimit,
    criarExclusaoContaRateLimit,
    criarEmailRateLimit,
    criarLoginRateLimit
} from '../middlewares/rateLimit.middleware.js';

import {
    criarPasswordService
} from '../services/password.service.js';

import {
    criarTokenService
} from '../services/token.service.js';

import {
    criarEmailService
} from '../services/email.service.js';

import {
    criarParentalConsentService
} from '../services/parentalConsent.service.js';

import {
    criarAuthService
} from '../services/auth.service.js';
import { criarAccountService } from '../services/account.service.js';
import { criarAccountDeletionService } from '../services/accountDeletion.service.js';
import { criarLogoutService } from '../services/logout.service.js';

import {
    criarAuthValidator
} from '../validators/auth.validator.js';
import { criarAccountValidator } from '../validators/account.validator.js';
import { criarAccountDeletionValidator } from '../validators/accountDeletion.validator.js';

import {
    criarParentalConsentValidator
} from '../validators/parentalConsent.validator.js';

import {
    criarAuthController
} from '../controllers/auth.controller.js';
import { criarAccountController } from '../controllers/account.controller.js';
import { criarAccountDeletionController } from '../controllers/accountDeletion.controller.js';
import { criarLogoutController } from '../controllers/logout.controller.js';
import { criarPasswordRecoveryService } from '../services/passwordRecovery.service.js';
import { criarPasswordRecoveryValidator } from '../validators/passwordRecovery.validator.js';
import { criarPasswordRecoveryController } from '../controllers/passwordRecovery.controller.js';

import {
    criarAuthMiddleware
} from '../middlewares/auth.middleware.js';

import {
    criarParentalConsentMiddleware
} from '../middlewares/parentalConsent.middleware.js';

function criarContainer() {
    const transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,

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

    const passwordRecoveryService = criarPasswordRecoveryService({
        prisma,
        tokenService,
        passwordService,
        emailService,
        baseUrl: env.passwordResetBaseUrl
    });

    const passwordRecoveryValidator =
        criarPasswordRecoveryValidator();

    const passwordRecoveryController = criarPasswordRecoveryController({
        passwordRecoveryService,
        passwordRecoveryValidator
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

    const accountDeletionService = criarAccountDeletionService({
        prisma,
        passwordService
    });

    const logoutService = criarLogoutService({
        prisma
    });

    const authValidator = criarAuthValidator({
        dateUtils
    });

    const parentalConsentValidator =
        criarParentalConsentValidator();

    const accountValidator = criarAccountValidator({
        dateUtils
    });

    const accountDeletionValidator = criarAccountDeletionValidator();

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

    const contaLoginRateLimit = criarContaLoginRateLimit({
        rateLimit,
        janelaMs: env.loginRateLimitJanelaMs,
        limite: env.loginRateLimitMaximo
    });

    const emailRateLimit = criarEmailRateLimit({
        rateLimit,
        janelaMs: env.emailRateLimitJanelaMs,
        limite: env.emailRateLimitMaximo
    });

    const configuracoesContaRateLimit = criarConfiguracoesContaRateLimit({
        rateLimit,
        janelaMs: env.configuracoesContaRateLimitJanelaMs,
        limite: env.configuracoesContaRateLimitMaximo
    });

    const alteracaoSenhaRateLimit = criarAlteracaoSenhaRateLimit({
        rateLimit,
        janelaMs: env.alteracaoSenhaRateLimitJanelaMs,
        limite: env.alteracaoSenhaRateLimitMaximo
    });

    const exclusaoContaRateLimit = criarExclusaoContaRateLimit({
        rateLimit,
        janelaMs: env.exclusaoContaRateLimitJanelaMs,
        limite: env.exclusaoContaRateLimitMaximo
    });

    const authController = criarAuthController({
        authService,
        authValidator,
        parentalConsentService,
        parentalConsentValidator
    });

    const accountController = criarAccountController({
        accountService,
        accountValidator
    });

    const accountDeletionController = criarAccountDeletionController({
        accountDeletionService,
        accountDeletionValidator
    });

    const logoutController = criarLogoutController({
        logoutService
    });

    return {
        authController,
        accountController,
        accountDeletionController,
        logoutController,
        authMiddleware,
        parentalConsentMiddleware,
        cadastroRateLimit,
        emailRateLimit,
        loginRateLimit,
        contaLoginRateLimit,
        configuracoesContaRateLimit,
        alteracaoSenhaRateLimit,
        exclusaoContaRateLimit,
        passwordRecoveryController
    };
}

export {
    criarContainer
};
