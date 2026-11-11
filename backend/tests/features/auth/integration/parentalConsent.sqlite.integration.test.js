import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { once } from 'node:events';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { DatabaseSync as Database } from 'node:sqlite';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import express from 'express';

import { criarAuthController } from '../../../../src/features/auth/controllers/auth.controller.js';
import { criarAuthRoutes } from '../../../../src/features/auth/routes/auth.routes.js';
import { criarParentalConsentService } from '../../../../src/features/auth/services/parentalConsent.service.js';
import { criarParentalConsentValidator } from '../../../../src/features/auth/validators/parentalConsent.validator.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';
import * as dateUtils from '../../../../src/shared/utils/date.utils.js';

const { PrismaClient } = prismaPackage;
const AGORA = new Date('2026-11-09T12:00:00.000Z');
const MIGRACAO_INICIAL = fileURLToPath(
    new URL(
        '../../../../prisma/migrations/20260913221156_estrutura_inicial/migration.sql',
        import.meta.url
    )
);

function criarBanco() {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-consentimento-parental-'));
    const caminho = join(diretorio, 'teste.db');
    const banco = new Database(caminho);
    banco.exec('PRAGMA foreign_keys = ON');
    banco.exec(readFileSync(MIGRACAO_INICIAL, 'utf8'));
    banco.exec(`
        INSERT INTO usuarios (id, nome, data_nascimento, email, senha_hash, papel, status_conta, criado_em, atualizado_em)
        VALUES (1, 'Titular Menor', '2014-05-01T00:00:00.000Z', 'titular@email.com', 'hash', 'principal', 'ativa', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `);
    banco.close();
    return { diretorio, caminho };
}

function criarApp(prisma, emails) {
    const parentalConsentService = criarParentalConsentService({
        prisma,
        emailService: {
            async enviarEmailConsentimentoParental(dados) {
                emails.push(dados);
            }
        },
        crypto,
        baseUrl: 'https://aloya.test/auth/parental-consent',
        dateUtils,
        now: () => AGORA
    });
    const controller = criarAuthController({
        authService: {},
        authValidator: {},
        parentalConsentService,
        parentalConsentValidator: criarParentalConsentValidator()
    });
    const ignorar = (_req, res) => res.status(501).end();
    const passar = (_req, _res, next) => next();
    const app = express();
    app.use(express.json());
    app.use(
        '/auth',
        criarAuthRoutes({
            authController: {
                ...controller,
                cadastrar: ignorar,
                realizarLogin: ignorar,
                verificarEmail: ignorar
            },
            passwordRecoveryController: {
                solicitar: ignorar,
                abrirNoAplicativo: ignorar,
                validarToken: ignorar,
                redefinir: ignorar
            },
            authMiddleware: {
                autenticar(req, _res, next) {
                    req.usuario = { id: 1, papel: 'principal' };
                    next();
                }
            },
            cadastroRateLimit: passar,
            emailRateLimit: passar,
            loginRateLimit: passar,
            contaLoginRateLimit: passar
        })
    );
    app.use(tratarErros);
    return app;
}

async function executarComBanco(callback) {
    const { diretorio, caminho } = criarBanco();
    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` })
    });
    const emails = [];
    const servidor = criarApp(prisma, emails).listen(0, '127.0.0.1');
    try {
        await once(servidor, 'listening');
        const baseUrl = `http://127.0.0.1:${servidor.address().port}/auth`;
        await callback({ baseUrl, prisma, emails });
    } finally {
        servidor.close();
        await once(servidor, 'close');
        await prisma.$disconnect();
        rmSync(diretorio, { recursive: true, force: true });
    }
}

function extrairToken(link) {
    return link.slice(link.lastIndexOf('/') + 1);
}

test('solicita, altera e confirma o consentimento parental pelo fluxo HTTP real', async () => {
    await executarComBanco(async ({ baseUrl, prisma, emails }) => {
        const statusInicial = await fetch(`${baseUrl}/parental-consent/status`);
        const estadoInicial = await statusInicial.json();
        assert.equal(statusInicial.headers.get('cache-control'), 'no-store');
        assert.equal(estadoInicial.acessoLiberado, false);
        assert.equal(estadoInicial.emailResponsavelInformado, false);

        const solicitacao = await fetch(`${baseUrl}/parental-consent/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailResponsavelLegal: 'primeiro@email.com' })
        });
        const corpoSolicitacao = await solicitacao.json();
        assert.equal(solicitacao.status, 200, JSON.stringify(corpoSolicitacao));
        assert.equal(
            corpoSolicitacao.mensagem,
            'Enviamos um pedido de autorização para o e-mail informado. Assim que o responsável confirmar, a Rede de Apoio será liberada.'
        );
        const tokenAntigo = extrairToken(emails[0].linkConfirmacao);

        const reenvio = await fetch(`${baseUrl}/parental-consent/resend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailResponsavelLegal: 'novo@email.com' })
        });
        assert.equal(reenvio.status, 200);
        const tokenNovo = extrairToken(emails[1].linkConfirmacao);
        assert.notEqual(tokenNovo, tokenAntigo);

        const linkAntigo = await fetch(`${baseUrl}/parental-consent/${tokenAntigo}`);
        assert.equal(linkAntigo.status, 400);

        const confirmacao = await fetch(`${baseUrl}/parental-consent/${tokenNovo}`);
        const pagina = await confirmacao.text();
        assert.equal(confirmacao.status, 200);
        assert.match(pagina, /Autorização concluída/u);
        assert.match(pagina, /Sua participação como Responsável Legal/u);

        const consentimento = await prisma.consentimentoParental.findUnique({
            where: { titularMenorId: 1 }
        });
        const notificacoes = await prisma.notificacao.findMany({ where: { usuarioId: 1 } });
        assert.equal(consentimento.emailResponsavelLegal, 'novo@email.com');
        assert.equal(consentimento.statusConsentimento, 'liberado');
        assert.equal(notificacoes.length, 1);
        assert.equal(notificacoes[0].tipoOrigem, 'rede_apoio');

        const statusFinal = await fetch(`${baseUrl}/parental-consent/status`);
        const estadoFinal = await statusFinal.json();
        assert.equal(estadoFinal.acessoLiberado, true);
        assert.equal(estadoFinal.consentimentoNecessario, false);
    });
});

test('rejeita e-mail inválido e o próprio e-mail sem criar solicitação', async () => {
    await executarComBanco(async ({ baseUrl, prisma, emails }) => {
        const invalido = await fetch(`${baseUrl}/parental-consent/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailResponsavelLegal: 'email-invalido' })
        });
        const corpoInvalido = await invalido.json();
        assert.equal(invalido.status, 422);
        assert.equal(corpoInvalido.erro.mensagem, 'Informe um e-mail válido.');

        const proprio = await fetch(`${baseUrl}/parental-consent/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailResponsavelLegal: 'titular@email.com' })
        });
        const corpoProprio = await proprio.json();
        assert.equal(proprio.status, 422);
        assert.equal(
            corpoProprio.erro.mensagem,
            'O e-mail do responsável deve ser diferente do seu e-mail de cadastro.'
        );
        assert.equal(await prisma.consentimentoParental.count(), 0);
        assert.equal(emails.length, 0);
    });
});

test('mantém o consentimento pendente quando a notificação da titular falha', async () => {
    await executarComBanco(async ({ baseUrl, prisma, emails }) => {
        await fetch(`${baseUrl}/parental-consent/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailResponsavelLegal: 'responsavel@email.com' })
        });
        const token = extrairToken(emails[0].linkConfirmacao);
        await prisma.$executeRawUnsafe(`
            CREATE TRIGGER impedir_notificacao_consentimento
            BEFORE INSERT ON notificacoes
            BEGIN
                SELECT RAISE(ABORT, 'falha simulada');
            END;
        `);

        const confirmacao = await fetch(`${baseUrl}/parental-consent/${token}`);
        const corpo = await confirmacao.json();
        const consentimento = await prisma.consentimentoParental.findUnique({
            where: { titularMenorId: 1 }
        });

        assert.equal(confirmacao.status, 500);
        assert.equal(
            corpo.erro.mensagem,
            'Não foi possível concluir a autorização no momento. Tente novamente.'
        );
        assert.equal(consentimento.statusConsentimento, 'pendente');
        assert.equal(consentimento.respondidoEm, null);
        assert.equal(await prisma.notificacao.count(), 0);
    });
});
