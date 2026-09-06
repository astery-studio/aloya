const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const { env } = require('./env');
const { prisma } = require('./prisma');

const dateUtils = require('../utils/date.utils');

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
    criarAuthValidator
    } = require('../validators/auth.validator');

    const {
    criarAuthController
    } = require('../controllers/auth.controller');

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
        baseUrl: env.parentalConsentBaseUrl
        });

    const authService = criarAuthService({
        prisma,
        passwordService,
        tokenService,
        //cycleService, //adicionar isso na sprint do ciclo
        parentalConsentService
    });

    const authValidator = criarAuthValidator({
        dateUtils
    });

    const authController = criarAuthController({
        authService,
        authValidator
    });

    return {
        authController
    };
}

module.exports = {
    criarContainer
};