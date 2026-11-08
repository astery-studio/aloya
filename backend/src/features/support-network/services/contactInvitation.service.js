import {
    papelEhTitular,
    usuarioEhContatoCadastrado
} from '../constants/contactInvitation.constants.js';

function criarErro(mensagem, status, codigo) {
    const erro = new Error(mensagem);
    erro.status = status;
    erro.codigo = codigo;
    return erro;
}

function validarTitular(titularId, papel) {
    if (!Number.isSafeInteger(titularId) || titularId <= 0) {
        throw criarErro('Sessão inválida.', 401, 'SESSAO_INVALIDA');
    }

    if (!papelEhTitular(papel)) {
        throw criarErro(
            'Somente a titular pode convidar contatos para a Rede de Apoio.',
            403,
            'ACESSO_NEGADO'
        );
    }
}

function criarContactInvitationService({ prisma } = {}) {
    async function consultarEmail({ titularId, papel, email } = {}) {
        validarTitular(titularId, papel);

        if (typeof prisma?.usuario?.findUnique !== 'function') {
            throw new TypeError('Não foi possível consultar o contato.');
        }

        const usuario = await prisma.usuario.findUnique({
            where: { email },
            select: { id: true, papel: true, statusConta: true }
        });
        const contaContatoCadastrada =
            usuario?.id !== titularId && usuarioEhContatoCadastrado(usuario);

        return Object.freeze({ email, contaContatoCadastrada });
    }

    return Object.freeze({ consultarEmail });
}

export { criarContactInvitationService, criarErro, validarTitular };
