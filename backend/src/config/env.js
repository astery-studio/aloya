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