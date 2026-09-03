const bcrypt = require('bcrypt'); //Biblioteca especializada em criptografia, pois as senhas nunca devem ser armazenadas em texto simoples!
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

