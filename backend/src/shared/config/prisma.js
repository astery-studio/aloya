import 'dotenv/config';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import prismaPackage from '@prisma/client';
const {
    PrismaClient
} = prismaPackage;

function criarPrisma() {
    if (!process.env.DATABASE_URL) {
        throw new Error(
            'A variável DATABASE_URL não foi configurada.'
        );
    }

    const adapter = new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL
    });

    return new PrismaClient({
        adapter
    });
}

// Mantém uma única instância compartilhada pela aplicação.
const prisma = criarPrisma();

export {
    criarPrisma,
    prisma
};
