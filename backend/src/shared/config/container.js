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
} from '../middleware/rateLimit.middleware.js';

import {
    criarPasswordService
} from '../../features/auth/services/password.service.js';

import {
    criarTokenService
} from '../../features/auth/services/token.service.js';

import {
    criarEmailService
} from '../../features/auth/services/email.service.js';

import {
    criarParentalConsentService
} from '../../features/auth/services/parentalConsent.service.js';

import {
    criarAuthService
} from '../../features/auth/services/auth.service.js';

import {
    criarAuthValidator
} from '../../features/auth/validators/auth.validator.js';

import {
    criarParentalConsentValidator
} from '../../features/auth/validators/parentalConsent.validator.js';

import {
    criarAuthController
} from '../../features/auth/controllers/auth.controller.js';

import {
    criarPasswordRecoveryService
} from '../../features/auth/services/passwordRecovery.service.js';

import {
    criarPasswordRecoveryValidator
} from '../../features/auth/validators/passwordRecovery.validator.js';

import {
    criarPasswordRecoveryController
} from '../../features/auth/controllers/passwordRecovery.controller.js';

import {
    criarContraceptiveService
} from '../../features/contraceptives/contraceptive.service.js';

import {
    criarContraceptiveController
} from '../../features/contraceptives/contraceptive.controller.js';

import {
    criarPredictionService
} from '../../features/cycles/prediction.service.js';

import {
    criarPredictionController
} from '../../features/cycles/prediction.controller.js';

import {
    criarEdicaoAnticoncepcionalRateLimit,
    criarRemocaoAnticoncepcionalRateLimit
} from '../../features/contraceptives/contraceptiveRateLimit.middleware.js';

import {
    criarCycleHistoryRepository
} from '../../features/cycles/cycleHistory.repository.js';

import {
    criarCycleHistoryService
} from '../../features/cycles/cycleHistory.service.js';

import {
    criarCycleHistoryController
} from '../../features/cycles/cycleHistory.controller.js';

import {
    criarPermissionCategoryService
} from '../../features/support-network/services/permissionCategory.service.js';

import {
    criarPermissionCategoryValidator
} from '../../features/support-network/validators/permissionCategory.validator.js';

import {
    criarPermissionCategoryController
} from '../../features/support-network/controllers/permissionCategory.controller.js';

import {
    criarPermissionCategoryRateLimit
} from '../../features/support-network/middleware/permissionCategoryRateLimit.middleware.js';

import {
    criarAccountService
} from '../../services/account.service.js';

import {
    criarAccountDeletionService
} from '../../services/accountDeletion.service.js';

import {
    criarLogoutService
} from '../../services/logout.service.js';

import {
    criarAccountValidator
} from '../../validators/account.validator.js';

import {
    criarAccountDeletionValidator
} from '../../validators/accountDeletion.validator.js';

import {
    criarAccountController
} from '../../controllers/account.controller.js';

import {
    criarAccountDeletionController
} from '../../controllers/accountDeletion.controller.js';

import {
    criarLogoutController
} from '../../controllers/logout.controller.js';

import {
    criarAuthMiddleware
} from '../middleware/auth.middleware.js';

import {
    criarParentalConsentMiddleware
} from '../middleware/parentalConsent.middleware.js';

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

    const passwordRecoveryService =
        criarPasswordRecoveryService({
            prisma,
            tokenService,
            passwordService,
            emailService,
            baseUrl: env.passwordResetBaseUrl
        });

    const passwordRecoveryValidator =
        criarPasswordRecoveryValidator();

    const passwordRecoveryController =
        criarPasswordRecoveryController({
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

    const accountDeletionService =
        criarAccountDeletionService({
            prisma,
            passwordService
        });

    const logoutService = criarLogoutService({
        prisma
    });

    const contraceptiveService =
        criarContraceptiveService(prisma);

    const cycleHistoryRepository =
        criarCycleHistoryRepository({
            prisma
        });

    const cycleHistoryService =
        criarCycleHistoryService({
            repository: cycleHistoryRepository
        });

    const predictionService =
        criarPredictionService({ prisma });

    const permissionCategoryService =
        criarPermissionCategoryService({
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

    const accountDeletionValidator =
        criarAccountDeletionValidator();

    const permissionCategoryValidator =
        criarPermissionCategoryValidator();

    const authMiddleware = criarAuthMiddleware({
        tokenService,
        prisma
    });

    const parentalConsentMiddleware =
        criarParentalConsentMiddleware({
            parentalConsentService
        });

    const cadastroRateLimit =
        criarCadastroRateLimit({
            rateLimit,
            janelaMs:
                env.cadastroRateLimitJanelaMs,
            limite:
                env.cadastroRateLimitMaximo
        });

    const loginRateLimit =
        criarLoginRateLimit({
            rateLimit,
            janelaMs:
                env.loginRateLimitJanelaMs,
            limite:
                env.loginRateLimitMaximo
        });

    const contaLoginRateLimit =
        criarContaLoginRateLimit({
            rateLimit,
            janelaMs:
                env.loginRateLimitJanelaMs,
            limite:
                env.loginRateLimitMaximo
        });

    const emailRateLimit =
        criarEmailRateLimit({
            rateLimit,
            janelaMs:
                env.emailRateLimitJanelaMs,
            limite:
                env.emailRateLimitMaximo
        });

    const configuracoesContaRateLimit =
        criarConfiguracoesContaRateLimit({
            rateLimit,
            janelaMs:
                env.configuracoesContaRateLimitJanelaMs,
            limite:
                env.configuracoesContaRateLimitMaximo
        });

    const permissionCategoryRateLimit =
        criarPermissionCategoryRateLimit({
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

    const exclusaoContaRateLimit =
        criarExclusaoContaRateLimit({
            rateLimit,
            janelaMs:
                env.exclusaoContaRateLimitJanelaMs,
            limite:
                env.exclusaoContaRateLimitMaximo
        });

    const edicaoAnticoncepcionalRateLimit =
        criarEdicaoAnticoncepcionalRateLimit({
            rateLimit,
            janelaMs:
                env.edicaoAnticoncepcionalRateLimitJanelaMs,
            limite:
                env.edicaoAnticoncepcionalRateLimitMaximo
        });

    const remocaoAnticoncepcionalRateLimit =
        criarRemocaoAnticoncepcionalRateLimit({
            rateLimit,
            janelaMs:
                env.remocaoAnticoncepcionalRateLimitJanelaMs,
            limite:
                env.remocaoAnticoncepcionalRateLimitMaximo
        });

    const authController =
        criarAuthController({
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

    const accountDeletionController =
        criarAccountDeletionController({
            accountDeletionService,
            accountDeletionValidator
        });

    const logoutController =
        criarLogoutController({
            logoutService
        });

    const contraceptiveController =
        criarContraceptiveController(
            contraceptiveService
        );

    const cycleHistoryController =
        criarCycleHistoryController({
            cycleHistoryService
        });

    const predictionController =
        criarPredictionController({ predictionService });

    const permissionCategoryController =
        criarPermissionCategoryController({
            permissionCategoryService,
            permissionCategoryValidator
        });

    return {
        authController,
        accountController,
        accountDeletionController,
        logoutController,
        contraceptiveController,
        cycleHistoryController,

        predictionController,
        permissionCategoryController,
        authMiddleware,
        parentalConsentMiddleware,
        cadastroRateLimit,
        emailRateLimit,
        loginRateLimit,
        contaLoginRateLimit,
        configuracoesContaRateLimit,
        permissionCategoryRateLimit,
        alteracaoSenhaRateLimit,
        exclusaoContaRateLimit,
        passwordRecoveryController,
        edicaoAnticoncepcionalRateLimit,
        remocaoAnticoncepcionalRateLimit
    };
}

export {
    criarContainer
};