//Guarda os caminhos das operações de conta na API

const caminhoConta = '/users/me'

const endpoints = Object.freeze({
    cadastro: '/auth/register',
    disponibilidadeEmail: '/auth/email-availability',
    login: '/auth/login',
    configuracoesConta: caminhoConta,
    alteracaoSenha: `${caminhoConta}/password`,
    exclusaoConta: caminhoConta,
    logout: '/auth/logout'
})

export { endpoints }
