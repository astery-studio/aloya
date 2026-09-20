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

import {
    criarAuthValidator
} from '../validators/auth.validator.js';

import {
    criarParentalConsentValidator
} from '../validators/parentalConsent.validator.js';

import {
    criarAuthController
} from '../controllers/auth.controller.js';

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

    const authValidator = criarAuthValidator({
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

    const authController = criarAuthController({
        authService,
        authValidator,
        parentalConsentService,
        parentalConsentValidator
    });

    return {
        authController,
        authMiddleware,
        parentalConsentMiddleware,
        cadastroRateLimit,
        emailRateLimit,
        loginRateLimit
    };
}

module.exports = {
    criarContainer
};