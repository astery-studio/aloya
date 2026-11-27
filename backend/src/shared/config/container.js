import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';

import { env } from './env.js';
import { prisma } from './prisma.js';
import { criarNotificationPreferencesService } from '../../features/notifications/notificationPreferences.service.js';
import { publicarSeguranca } from '../../features/notifications/securityPushEvents.js';
import { criarCycleRegistrationModule } from '../../features/cycles/cycleRegistration.module.js';

import * as dateUtils from '../utils/date.utils.js';

import {
    criarCadastroRateLimit,
    criarContaLoginRateLimit,
    criarConfiguracoesContaRateLimit,
    criarAlteracaoSenhaRateLimit,
    criarExclusaoContaRateLimit,
    criarEmailRateLimit
} from '../middleware/rateLimit.middleware.js';

import { criarPasswordService } from '../../features/auth/services/password.service.js';

import { criarTokenService } from '../../features/auth/services/token.service.js';

import { criarEmailService } from '../../features/auth/services/email.service.js';

import { criarParentalConsentService } from '../../features/auth/services/parentalConsent.service.js';

import { criarAuthService } from '../../features/auth/services/auth.service.js';

import { criarAuthValidator } from '../../features/auth/validators/auth.validator.js';

import { criarParentalConsentValidator } from '../../features/auth/validators/parentalConsent.validator.js';

import { criarAuthController } from '../../features/auth/controllers/auth.controller.js';

import { criarPasswordRecoveryService } from '../../features/auth/services/passwordRecovery.service.js';

import { criarPasswordRecoveryValidator } from '../../features/auth/validators/passwordRecovery.validator.js';

import { criarPasswordRecoveryController } from '../../features/auth/controllers/passwordRecovery.controller.js';

import { criarContraceptiveService } from '../../features/contraceptives/services/contraceptive.service.js';

import { criarContraceptiveController } from '../../features/contraceptives/controllers/contraceptive.controller.js';
import {
    criarContraceptiveUsageService,
    criarAvaliadorJanelaEficacia,
    lerJanelasDeUso
} from '../../features/contraceptives/services/contraceptiveUsage.service.js';
import { criarContraceptiveUsageController } from '../../features/contraceptives/controllers/contraceptiveUsage.controller.js';

import { criarPredictionService } from '../../features/cycles/services/prediction.service.js';

import { criarPredictionController } from '../../features/cycles/controllers/prediction.controller.js';

import {
    criarEdicaoAnticoncepcionalRateLimit,
    criarRemocaoAnticoncepcionalRateLimit,
    criarUsoAnticoncepcionalRateLimit
} from '../../features/contraceptives/middleware/contraceptiveRateLimit.middleware.js';

import { criarCalendarModule } from '../../features/calendar/calendar.module.js';

import { criarCycleHistoryRepository } from '../../features/cycles/repositories/cycleHistory.repository.js';

import { criarCycleHistoryService } from '../../features/cycles/services/cycleHistory.service.js';

import { criarCycleHistoryController } from '../../features/cycles/controllers/cycleHistory.controller.js';

import { criarCycleRemovalModule } from '../../features/cycles/cycleRemoval.module.js';
import { criarCycleEditValidator } from '../../features/cycles/validators/cycleEdit.validator.js';
import { criarCycleEditService } from '../../features/cycles/services/cycleEdit.service.js';
import { criarCycleEditController } from '../../features/cycles/controllers/cycleEdit.controller.js';

import { criarPermissionCategoryService } from '../../features/support-network/services/permissionCategory.service.js';

import { criarPermissionCategoryValidator } from '../../features/support-network/validators/permissionCategory.validator.js';

import { criarPermissionCategoryController } from '../../features/support-network/controllers/permissionCategory.controller.js';

import { criarPermissionCategoryRateLimit } from '../../features/support-network/middleware/permissionCategoryRateLimit.middleware.js';

import { criarPermissionCategoryUpdateRateLimit } from '../../features/support-network/middleware/permissionCategoryUpdateRateLimit.middleware.js';
import { criarPermissionCategoryDeletionService } from '../../features/support-network/services/permissionCategoryDeletion.service.js';
import { criarPermissionCategoryDeletionValidator } from '../../features/support-network/validators/permissionCategoryDeletion.validator.js';
import { criarPermissionCategoryDeletionController } from '../../features/support-network/controllers/permissionCategoryDeletion.controller.js';
import { criarPermissionCategoryDeletionRateLimit } from '../../features/support-network/middleware/permissionCategoryDeletionRateLimit.middleware.js';
import { criarContactInvitationPermissionService } from '../../features/support-network/services/contactInvitationPermission.service.js';
import { criarContactInvitationTokenService } from '../../features/support-network/services/contactInvitationToken.service.js';
import { criarContactInvitationService } from '../../features/support-network/services/contactInvitation.service.js';
import { criarContactInvitationValidator } from '../../features/support-network/validators/contactInvitation.validator.js';
import { criarContactInvitationController } from '../../features/support-network/controllers/contactInvitation.controller.js';
import { criarContactInvitationRateLimit } from '../../features/support-network/middleware/contactInvitationRateLimit.middleware.js';
import { criarContactRegistrationValidator } from '../../features/support-network/validators/contactRegistration.validator.js';
import { criarContactInvitationResponseService } from '../../features/support-network/services/contactInvitationResponse.service.js';
import { criarContactInvitationResponseController } from '../../features/support-network/controllers/contactInvitationResponse.controller.js';
import { criarContactInvitationResponseRateLimit } from '../../features/support-network/middleware/contactInvitationResponseRateLimit.middleware.js';
import { criarSupportContactService } from '../../features/support-network/services/supportContact.service.js';
import { criarSupportContactController } from '../../features/support-network/controllers/supportContact.controller.js';
import { criarSupportContactValidator } from '../../features/support-network/validators/supportContact.validator.js';
import { criarContactInvitationResendService } from '../../features/support-network/services/contactInvitationResend.service.js';
import { criarContactLinkService } from '../../features/support-network/services/contactLink.service.js';
import { criarContactLinkValidator } from '../../features/support-network/validators/contactLink.validator.js';
import { criarContactLinkController } from '../../features/support-network/controllers/contactLink.controller.js';
import { criarContactLinkRateLimit } from '../../features/support-network/middleware/contactLinkRateLimit.middleware.js';
import { criarSupportContactRemovalService } from '../../features/support-network/services/supportContactRemoval.service.js';
import { criarSupportContactRemovalValidator } from '../../features/support-network/validators/supportContactRemoval.validator.js';
import { criarSupportContactRemovalController } from '../../features/support-network/controllers/supportContactRemoval.controller.js';
import { criarSupportContactRemovalRateLimit } from '../../features/support-network/middleware/supportContactRemovalRateLimit.middleware.js';

import { criarAccountService } from '../../features/settings/services/account.service.js';

import { criarAccountDeletionService } from '../../features/settings/services/accountDeletion.service.js';

import { criarLogoutService } from '../../features/auth/services/logout.service.js';

import { criarAccountValidator } from '../../features/settings/validators/account.validator.js';

import { criarAccountDeletionValidator } from '../../features/settings/validators/accountDeletion.validator.js';

import { criarCycleParametersService } from '../../features/settings/services/cycleParameters.service.js';
import { criarCycleParametersValidator } from '../../features/settings/validators/cycleParameters.validator.js';
import { criarCycleParametersController } from '../../features/settings/controllers/cycleParameters.controller.js';

import { criarAccountController } from '../../features/settings/controllers/account.controller.js';

import { criarAccountDeletionController } from '../../features/settings/controllers/accountDeletion.controller.js';

import { criarLogoutController } from '../../features/auth/controllers/logout.controller.js';
import { criarDiaryCatalogBootstrap } from '../../features/diary/services/diaryCatalogBootstrap.service.js';
import { criarDiaryCatalogService } from '../../features/diary/services/diaryCatalog.service.js';
import { criarDiaryPreferencesService } from '../../features/diary/services/diaryPreferences.service.js';
import { criarDiaryCatalogController } from '../../features/diary/controllers/diaryCatalog.controller.js';
import { validarAtualizacaoPreferencia } from '../../features/diary/validators/diaryPreferences.validator.js';
import { criarDiaryPhaseService } from '../../features/diary/services/diaryPhase.service.js';
import { criarDiaryEntryService } from '../../features/diary/services/diaryEntry.service.js';
import { criarDiaryEntryController } from '../../features/diary/controllers/diaryEntry.controller.js';
import { validarCriacaoRegistro } from '../../features/diary/validators/diaryEntry.validator.js';
import { criarDiaryHistoryService } from '../../features/diary/services/diaryHistory.service.js';
import { criarDiaryDetailService } from '../../features/diary/services/diaryDetail.service.js';
import { criarDiaryHistoryController } from '../../features/diary/controllers/diaryHistory.controller.js';
import { criarDiaryOverviewService } from '../../features/diary/services/diaryOverview.service.js';
import { criarDiaryOverviewController } from '../../features/diary/controllers/diaryOverview.controller.js';
import { validarResumoDiario } from '../../features/diary/validators/diaryOverview.validator.js';
import { validarHistorico } from '../../features/diary/validators/diaryHistory.validator.js';
import { validarLotePreferencias } from '../../features/diary/validators/diaryPreferencesBatch.validator.js';
import { criarDiaryEditService } from '../../features/diary/services/diaryEdit.service.js';
import { criarDiaryDeletionService } from '../../features/diary/services/diaryDeletion.service.js';
import { criarDiaryMutationController } from '../../features/diary/controllers/diaryMutation.controller.js';
import { criarThermalRecalculationService } from '../../features/diary/thermal/thermalRecalculation.service.js';
import { criarDiaryPreferencesRateLimit } from '../../features/diary/middleware/diaryPreferencesRateLimit.middleware.js';

import { criarAuthMiddleware } from '../middleware/auth.middleware.js';

import { criarParentalConsentMiddleware } from '../middleware/parentalConsent.middleware.js';

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

    const parentalConsentService = criarParentalConsentService({
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
        baseUrl: env.passwordResetBaseUrl,
        publicarSeguranca
    });

    const passwordRecoveryValidator = criarPasswordRecoveryValidator();

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
        dateUtils,
        publicarSeguranca
    });

    const accountDeletionService = criarAccountDeletionService({
        prisma,
        passwordService
    });

    const logoutService = criarLogoutService({
        prisma
    });

    const contraceptiveService = criarContraceptiveService(prisma);
    const notificationPreferencesService = criarNotificationPreferencesService(prisma);
    const contraceptiveUsageService = criarContraceptiveUsageService(prisma, {
        avaliarJanelaEficacia: criarAvaliadorJanelaEficacia(lerJanelasDeUso())
    });
    const contraceptiveUsageController =
        criarContraceptiveUsageController(contraceptiveUsageService);

    const calendarModule = criarCalendarModule({
        prisma
    });

    const diaryCatalogBootstrap = criarDiaryCatalogBootstrap({ prisma });
    const diaryCatalogService = criarDiaryCatalogService({ prisma });
    const diaryPreferencesService = criarDiaryPreferencesService({
        prisma,
        bootstrap: diaryCatalogBootstrap
    });
    const diaryCatalogController = criarDiaryCatalogController({
        catalogService: diaryCatalogService,
        preferencesService: diaryPreferencesService,
        validarLote: validarLotePreferencias
    });
    const diaryPhaseService = criarDiaryPhaseService({ prisma });
    const thermalRecalculation = criarThermalRecalculationService();
    const diaryEntryService = criarDiaryEntryService({
        prisma,
        bootstrap: diaryCatalogBootstrap,
        phaseService: diaryPhaseService,
        thermalRecalculation
    });
    const diaryEntryController = criarDiaryEntryController({
        service: diaryEntryService,
        validarCriacao: validarCriacaoRegistro
    });
    const diaryHistoryService = criarDiaryHistoryService({ prisma });
    const diaryDetailService = criarDiaryDetailService({ prisma });
    const diaryHistoryController = criarDiaryHistoryController({
        historyService: diaryHistoryService,
        detailService: diaryDetailService,
        validarHistorico
    });
    const diaryOverviewService = criarDiaryOverviewService({ prisma });
    const diaryOverviewController = criarDiaryOverviewController({
        service: diaryOverviewService,
        validarResumo: validarResumoDiario
    });
    const diaryEditService = criarDiaryEditService({
        prisma,
        bootstrap: diaryCatalogBootstrap,
        phaseService: diaryPhaseService,
        thermalRecalculation
    });
    const diaryDeletionService = criarDiaryDeletionService({ prisma, thermalRecalculation });
    const diaryMutationController = criarDiaryMutationController({
        editService: diaryEditService,
        deletionService: diaryDeletionService,
        validarEdicao: validarCriacaoRegistro
    });

    const cycleHistoryRepository = criarCycleHistoryRepository({
        prisma
    });

    const cycleHistoryService = criarCycleHistoryService({
        repository: cycleHistoryRepository
    });

    const cycleRemovalModule = criarCycleRemovalModule({ prisma, thermalRecalculation });
    const cycleEditValidator = criarCycleEditValidator();
    const cycleEditService = criarCycleEditService({ prisma, thermalRecalculation });

    const predictionService = criarPredictionService({ prisma });

    const cycleParametersService = criarCycleParametersService({
        prisma,
        recalcularPrevisoes: predictionService.buscar
    });

    const cycleParametersValidator = criarCycleParametersValidator();

    const permissionCategoryService = criarPermissionCategoryService({
        prisma
    });

    const permissionCategoryDeletionService = criarPermissionCategoryDeletionService({
        prisma
    });
    const contactInvitationPermissionService = criarContactInvitationPermissionService({ prisma });
    const contactInvitationTokenService = criarContactInvitationTokenService({
        crypto,
        baseUrl: env.supportInvitationBaseUrl
    });
    const contactInvitationService = criarContactInvitationService({
        prisma,
        permissionService: contactInvitationPermissionService,
        tokenService: contactInvitationTokenService,
        emailService
    });
    const contactInvitationResponseService = criarContactInvitationResponseService({
        prisma,
        tokenService: contactInvitationTokenService,
        passwordService
    });
    const supportContactService = criarSupportContactService({ prisma });
    const contactInvitationResendService = criarContactInvitationResendService({
        prisma,
        tokenService: contactInvitationTokenService,
        emailService
    });
    const contactLinkService = criarContactLinkService({ prisma });
    const supportContactRemovalService = criarSupportContactRemovalService({ prisma });

    const authValidator = criarAuthValidator({
        dateUtils
    });

    const parentalConsentValidator = criarParentalConsentValidator();

    const accountValidator = criarAccountValidator({
        dateUtils
    });

    const accountDeletionValidator = criarAccountDeletionValidator();

    const permissionCategoryValidator = criarPermissionCategoryValidator();
    const permissionCategoryDeletionValidator = criarPermissionCategoryDeletionValidator();
    const contactInvitationValidator = criarContactInvitationValidator();
    const contactRegistrationValidator = criarContactRegistrationValidator();
    const supportContactValidator = criarSupportContactValidator();
    const contactLinkValidator = criarContactLinkValidator();
    const supportContactRemovalValidator = criarSupportContactRemovalValidator();

    const authMiddleware = criarAuthMiddleware({
        tokenService,
        prisma
    });

    const parentalConsentMiddleware = criarParentalConsentMiddleware({
        parentalConsentService
    });

    const cadastroRateLimit = criarCadastroRateLimit({
        rateLimit,
        janelaMs: env.cadastroRateLimitJanelaMs,
        limite: env.cadastroRateLimitMaximo
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

    const diaryPreferencesRateLimit = criarDiaryPreferencesRateLimit({
        rateLimit,
        janelaMs: env.diarioPreferenciasRateLimitJanelaMs,
        limite: env.diarioPreferenciasRateLimitMaximo
    });

    const permissionCategoryRateLimit = criarPermissionCategoryRateLimit({
        rateLimit,
        janelaMs: env.configuracoesContaRateLimitJanelaMs,
        limite: env.configuracoesContaRateLimitMaximo
    });

    const permissionCategoryUpdateRateLimit = criarPermissionCategoryUpdateRateLimit({
        rateLimit,
        janelaMs: env.configuracoesContaRateLimitJanelaMs,
        limite: env.configuracoesContaRateLimitMaximo
    });

    const permissionCategoryDeletionRateLimit = criarPermissionCategoryDeletionRateLimit({
        rateLimit,
        janelaMs: env.exclusaoContaRateLimitJanelaMs,
        limite: env.exclusaoContaRateLimitMaximo
    });
    const contactInvitationLookupRateLimit = criarContactInvitationRateLimit({
        rateLimit,
        janelaMs: env.configuracoesContaRateLimitJanelaMs,
        limite: env.configuracoesContaRateLimitMaximo,
        codigo: 'LIMITE_CONSULTAS_CONTATO',
        mensagem: 'Muitas consultas de contato. Aguarde alguns minutos e tente novamente.',
        evento: 'limite_consulta_contato_rede_apoio'
    });
    const contactInvitationRateLimit = criarContactInvitationRateLimit({
        rateLimit,
        janelaMs: env.supportInvitationRateLimitJanelaMs,
        limite: env.supportInvitationRateLimitMaximo
    });
    const contactInvitationResponseRateLimit = criarContactInvitationResponseRateLimit({
        rateLimit,
        janelaMs: env.emailRateLimitJanelaMs,
        limite: env.emailRateLimitMaximo
    });
    const contactLinkRateLimit = criarContactLinkRateLimit({
        rateLimit,
        janelaMs: env.configuracoesContaRateLimitJanelaMs,
        limite: env.configuracoesContaRateLimitMaximo
    });
    const supportContactRemovalRateLimit = criarSupportContactRemovalRateLimit({
        rateLimit,
        janelaMs: env.exclusaoContaRateLimitJanelaMs,
        limite: env.exclusaoContaRateLimitMaximo
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

    const edicaoAnticoncepcionalRateLimit = criarEdicaoAnticoncepcionalRateLimit({
        rateLimit,
        janelaMs: env.edicaoAnticoncepcionalRateLimitJanelaMs,
        limite: env.edicaoAnticoncepcionalRateLimitMaximo
    });

    const usoAnticoncepcionalRateLimit = criarUsoAnticoncepcionalRateLimit({ rateLimit });

    const remocaoAnticoncepcionalRateLimit = criarRemocaoAnticoncepcionalRateLimit({
        rateLimit,
        janelaMs: env.remocaoAnticoncepcionalRateLimitJanelaMs,
        limite: env.remocaoAnticoncepcionalRateLimitMaximo
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

    const contraceptiveController = criarContraceptiveController(contraceptiveService);

    const cycleHistoryController = criarCycleHistoryController({
        cycleHistoryService
    });

    const cycleEditController = criarCycleEditController({
        service: cycleEditService,
        validator: cycleEditValidator
    });

    const predictionController = criarPredictionController({ predictionService });

    const cycleParametersController = criarCycleParametersController({
        service: cycleParametersService,
        validator: cycleParametersValidator
    });

    const permissionCategoryController = criarPermissionCategoryController({
        permissionCategoryService,
        permissionCategoryValidator
    });

    const permissionCategoryDeletionController = criarPermissionCategoryDeletionController({
        permissionCategoryDeletionService,
        permissionCategoryDeletionValidator,
        permissionCategoryValidator
    });
    const contactInvitationController = criarContactInvitationController({
        service: contactInvitationService,
        validator: contactInvitationValidator
    });
    const contactInvitationResponseController = criarContactInvitationResponseController({
        service: contactInvitationResponseService,
        invitationValidator: contactInvitationValidator,
        registrationValidator: contactRegistrationValidator
    });
    const supportContactController = criarSupportContactController({
        service: supportContactService,
        resendService: contactInvitationResendService,
        responseService: contactInvitationResponseService,
        validator: supportContactValidator
    });
    const contactLinkController = criarContactLinkController({
        service: contactLinkService,
        contactValidator: supportContactValidator,
        linkValidator: contactLinkValidator
    });
    const supportContactRemovalController = criarSupportContactRemovalController({
        service: supportContactRemovalService,
        contactValidator: supportContactValidator,
        removalValidator: supportContactRemovalValidator
    });

    return {
        authController,
        cycleRegistrationController: criarCycleRegistrationModule({
            prisma,
            thermalRecalculation
        }).controller,
        accountController,
        cycleParametersController,
        accountDeletionController,
        logoutController,
        contraceptiveController,
        notificationPreferencesService,
        contraceptiveUsageController,
        calendarController: calendarModule.calendarController,
        cycleHistoryController,
        cycleRemovalController: cycleRemovalModule.controller,
        cycleEditController,

        predictionController,
        permissionCategoryController,
        permissionCategoryDeletionController,
        contactInvitationController,
        contactInvitationResponseController,
        supportContactController,
        contactLinkController,
        supportContactRemovalController,
        authMiddleware,
        parentalConsentMiddleware,
        cadastroRateLimit,
        emailRateLimit,
        contaLoginRateLimit,
        configuracoesContaRateLimit,
        diaryPreferencesRateLimit,
        permissionCategoryRateLimit,
        permissionCategoryUpdateRateLimit,
        permissionCategoryDeletionRateLimit,
        contactInvitationLookupRateLimit,
        contactInvitationRateLimit,
        contactInvitationResponseRateLimit,
        contactLinkRateLimit,
        supportContactRemovalRateLimit,
        alteracaoSenhaRateLimit,
        exclusaoContaRateLimit,
        passwordRecoveryController,
        edicaoAnticoncepcionalRateLimit,
        usoAnticoncepcionalRateLimit,
        remocaoAnticoncepcionalRateLimit,
        diaryCatalogController,
        diaryEntryController,
        diaryHistoryController,
        diaryOverviewController,
        diaryMutationController,
        validarAtualizacaoPreferencia
    };
}

export { criarContainer };
