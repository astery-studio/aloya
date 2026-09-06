const { PrismaClient } = require('@prisma/client');

// Abre a conexão com o banco.
const prisma = new PrismaClient();

module.exports = { prisma };