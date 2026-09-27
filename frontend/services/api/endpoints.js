//Guarda os caminhos das operações de conta na API

const caminhoConta = '/users/me'

const endpoints = Object.freeze({
    configuracoesConta: caminhoConta,
    alteracaoSenha: `${caminhoConta}/password`,
    exclusaoConta: caminhoConta,
    logout: '/auth/logout'
})

export { endpoints }