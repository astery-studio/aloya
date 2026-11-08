import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import Database from 'better-sqlite3';

import { criarContactInvitationResponseService } from '../../../../src/features/support-network/services/contactInvitationResponse.service.js';
import { criarContactInvitationTokenService } from '../../../../src/features/support-network/services/contactInvitationToken.service.js';

const { PrismaClient } = prismaPackage;
const pastaMigrations = fileURLToPath(
    new URL('../../../../prisma/migrations/', import.meta.url)
);

function criarBanco() {
    const diretorio = mkdtempSync(join(tmpdir(), 'aloya-resposta-convite-'));
    const caminho = join(diretorio, 'teste.db');
    const banco = new Database(caminho);
    banco.pragma('foreign_keys = ON');
    for (const entrada of readdirSync(pastaMigrations, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .sort((a, b) => a.name.localeCompare(b.name))) {
        banco.exec(readFileSync(join(pastaMigrations, entrada.name, 'migration.sql'), 'utf8'));
    }
    banco.close();
    return { diretorio, caminho };
}

test('aceita e recusa convites reais preservando atomicidade e notificações', async () => {
    const { diretorio, caminho } = criarBanco();
    const prisma = new PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: `file:${caminho.replaceAll('\\', '/')}` })
    });
    const agora = new Date('2026-11-08T12:00:00.000Z');
    const tokenService = criarContactInvitationTokenService({
        crypto,
        baseUrl: 'aloya://support-network/invitation',
        now: () => agora
    });
    const tokenAceite = 'a'.repeat(43);
    const tokenRecusa = 'b'.repeat(43);

    try {
        await prisma.usuario.createMany({
            data: [
                {
                    id: 1,
                    nome: 'Julia',
                    dataNascimento: new Date('2000-01-01'),
                    email: 'julia@email.com',
                    senhaHash: 'hash',
                    papel: 'principal',
                    statusConta: 'ativa'
                },
                {
                    id: 2,
                    nome: 'Maria',
                    dataNascimento: new Date('1995-01-01'),
                    email: 'maria@email.com',
                    senhaHash: 'hash',
                    papel: 'contato_apoio',
                    statusConta: 'ativa'
                },
                {
                    id: 3,
                    nome: 'Bia',
                    dataNascimento: new Date('1995-01-01'),
                    email: 'bia@email.com',
                    senhaHash: 'hash',
                    papel: 'contato_apoio',
                    statusConta: 'ativa'
                }
            ]
        });
        await prisma.vinculoRedeApoio.createMany({
            data: [
                {
                    titularId: 1,
                    contatoId: 2,
                    emailConvidado: 'maria@email.com',
                    permissoesIndividuais: ['saude.consultas'],
                    status: 'pendente',
                    tokenConviteHash: tokenService.calcularHash(tokenAceite),
                    dataExpiracao: new Date('2026-11-09T12:00:00.000Z')
                },
                {
                    titularId: 1,
                    contatoId: 3,
                    emailConvidado: 'bia@email.com',
                    permissoesIndividuais: ['geral.fase_atual'],
                    status: 'pendente',
                    tokenConviteHash: tokenService.calcularHash(tokenRecusa),
                    dataExpiracao: new Date('2026-11-09T12:00:00.000Z')
                }
            ]
        });
        const service = criarContactInvitationResponseService({
            prisma,
            tokenService,
            now: () => agora
        });

        await service.aceitar({ token: tokenAceite, usuarioId: 2 });
        await service.recusar({ token: tokenRecusa, usuarioId: 3 });

        await assert.rejects(
            () => service.aceitar({ token: tokenAceite, usuarioId: 2 }),
            { status: 410, codigo: 'CONVITE_INDISPONIVEL' }
        );
        await assert.rejects(
            () => service.aceitar({ token: tokenRecusa, usuarioId: 3 }),
            { status: 410, codigo: 'CONVITE_INDISPONIVEL' }
        );

        const vinculos = await prisma.vinculoRedeApoio.findMany({
            orderBy: { id: 'asc' }
        });
        assert.equal(vinculos[0].status, 'ativo');
        assert.equal(vinculos[1].status, 'recusado');
        assert.equal(vinculos.every((item) => item.tokenConviteHash === null), true);
        assert.equal(vinculos.every((item) => item.dataResposta?.getTime() === agora.getTime()), true);

        const notificacoes = await prisma.notificacao.findMany({
            orderBy: { id: 'asc' }
        });
        assert.equal(notificacoes.length, 2);
        assert.equal(notificacoes.every((item) => item.usuarioId === 1), true);
        assert.deepEqual(
            notificacoes.map((item) => item.origemId),
            vinculos.map((item) => item.id)
        );
    } finally {
        await prisma.$disconnect();
        rmSync(diretorio, { recursive: true, force: true });
    }
});
