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