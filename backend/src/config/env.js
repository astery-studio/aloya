// Puxa as senhas do seu arquivo oculto (.env)
require('dotenv').config();

//se faltar alguma variável crucial no .env, ela trava o servidor na hora e avisa qual faltou. (Evita que o app quebre de surpresa no meio do uso)
function obterVariavelObrigatoria(nome) {
    const valor = process.env[nome];

    if (!valor) {
        throw new Error(`A variável ${nome} não foi configurada.`);
    }

    return valor;
}

// Transforma o texto do .env em número. Se estiver vazio lá, assume 12 como padrão.
const bcryptRounds = Number(process.env.BCRYPT_ROUNDS || 12);

//Impede que a criptografia de senhas fique fraca demais (insegura) ou forte demais (deixa o servidor travando)
if (
    !Number.isInteger(bcryptRounds) ||
    bcryptRounds < 10 ||
    bcryptRounds > 15
    ) {
    throw new Error('BCRYPT_ROUNDS deve ser um inteiro entre 10 e 15.');
}

const env = {
    port: Number(process.env.PORT || 3000), //define a porta onde a api vai rodar

    jwtSecret: obterVariavelObrigatoria('JWT_SECRET'), //a chave para criar a sessão do usuário
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '90d', // O token de login gerado dura 90 dias

    bcryptRounds,

    parentalConsentBaseUrl: obterVariavelObrigatoria(
        'PARENTAL_CONSENT_BASE_URL' // A base do link que será enviado no e-mail do responsável legal
    ),

    // Agrupa as credenciais de e-mail necessárias
    smtp: {
        host: obterVariavelObrigatoria('SMTP_HOST'),
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true', // Transforma o texto 'true' em um booleano real
        user: obterVariavelObrigatoria('SMTP_USER'),
        password: obterVariavelObrigatoria('SMTP_PASSWORD'),
        from: obterVariavelObrigatoria('SMTP_FROM')
    }
};
