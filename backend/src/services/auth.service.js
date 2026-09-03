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
    
    //criptografando a senha
    const salt = await bcrypt.genSalt(10); //gera um salt aleatório
    const senhaHash = await bcrypt.hash(dados.senha, salt); //mistura a senha com o salt gerado

}