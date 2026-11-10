//Guarda os caminhos das operações disponíveis na API.

const caminhoConta = '/users/me';
const caminhoConvitesContato = '/support-network/contact-invitations';
const caminhoContatosRedeApoio = '/support-network/contacts';

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
    verificacaoSenhaExclusao: `${caminhoConta}/account-deletion/verify-password`,
    parametrosCiclo: `${caminhoConta}/cycle-parameters`,
    logout: '/auth/logout',
    anticoncepcionais: '/api/anticoncepcionais',
    calendario: '/api/cycles/calendar',
    estadoAtualCiclo: '/api/cycles/current',
    historicoCiclos: '/api/cycles/history',
    ciclos: '/api/cycles',
    categoriasPermissao: '/support-network/permission-categories',
    convitesContato: caminhoConvitesContato,
    consultaEmailContato: `${caminhoConvitesContato}/lookup`,
    contatosRedeApoio: caminhoContatosRedeApoio,
    reenviarConviteContato: (contatoId) =>
        `${caminhoContatosRedeApoio}/${contatoId}/resend-invitation`,
    contatosRecebidos: '/support-network/received-contacts',
    responderContatoRecebido: (conviteId) =>
        `/support-network/received-contacts/${conviteId}/respond`,
    previsaoCiclo: '/cycles/prediction'
});

export { endpoints };
