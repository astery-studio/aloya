require('dotenv').config();

const {
    PrismaBetterSqlite3
} = require('@prisma/adapter-better-sqlite3');

const {
    PrismaClient
} = require('../generated/prisma/client');

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

module.exports = {
    criarPrisma,
    prisma
};
