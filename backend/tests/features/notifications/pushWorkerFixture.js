import { randomUUID } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';

export async function criarBanco(t) {
    const dir = mkdtempSync(join(tmpdir(), 'aloya-push-'));
    const caminho = join(dir, 'teste.db');
    const migrations = new URL('../../../prisma/migrations/', import.meta.url);
    const sqlite = new DatabaseSync(caminho);
    for (const nome of readdirSync(migrations, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => item.name)
        .sort()) {
        sqlite.exec(readFileSync(new URL(`${nome}/migration.sql`, migrations), 'utf8'));
    }
    sqlite.close();
    const prisma = new prismaPackage.PrismaClient({
        adapter: new PrismaBetterSqlite3({ url: `file:${caminho}` })
    });
    t.after(async () => {
        await prisma.$disconnect();
        rmSync(dir, { recursive: true, force: true });
    });
    for (const id of [1, 2]) {
        await prisma.usuario.create({
            data: {
                id,
                nome: 'Teste',
                email: `conta-${id}@example.com`,
                dataNascimento: new Date('2000-01-01'),
                senhaHash: 'teste',
                statusConta: 'ativa',
                papel: 'principal'
            }
        });
        await prisma.sessao.create({
            data: {
                id,
                usuarioId: id,
                tokenSessaoHash: `hash-${id}`,
                validadeSessao: new Date('2099-01-01')
            }
        });
    }
    return prisma;
}

export function aparelho(plataforma = 'android') {
    const instalacao = randomUUID();
    return {
        instalacao,
        token: `ExpoPushToken[${instalacao}]`,
        plataforma,
        fuso: 'America/Sao_Paulo'
    };
}
