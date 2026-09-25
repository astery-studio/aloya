//Guarda os caminhos das operações de conta na API

const caminhoConta = '/users/me'

const endpoints = Object.freeze({
    cadastro: '/auth/register',
    disponibilidadeEmail: '/auth/email-availability',
    login: '/auth/login',
    solicitarRecuperacao: '/auth/password-recovery/request',
    validarRecuperacao: '/auth/password-recovery',
    redefinirSenha: '/auth/password-recovery/reset',
    configuracoesConta: caminhoConta,
    alteracaoSenha: `${caminhoConta}/password`,
    exclusaoConta: caminhoConta,
    logout: '/auth/logout'
})

export { endpoints }
