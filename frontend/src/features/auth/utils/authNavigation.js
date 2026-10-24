const destinosDeRetorno = Object.freeze({
    login: 'boasVindas',
    recuperarSenha: 'login',
    redefinirSenha: 'login'
});

function obterDestinoDeRetorno(tela) {
    return destinosDeRetorno[tela] || null;
}

export { obterDestinoDeRetorno };
