const bcrypt = require('bcrypt'); //Biblioteca especializada em criptografia, pois as senhas nunca devem ser armazenadas em texto simoples!
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { calcularIdade } = require('../utils/date.utils');

async function cadastrarUsuario(dados) {
    //Conversão do e-mail para letras minusculas
    const emailFormatado = dados.email.toLowerCase();

    //verificando se o email já existe no banco
    const usuarioExistente = await prisma.usuario.findUnique({
        where: { email: emailFormatado }
    });

    if (usuarioExistente) {
        throw new Error('Este e-mail já está em uso. Tente fazer login.');
    }

    
}