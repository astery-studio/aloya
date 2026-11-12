import { PAPEIS_CONTATO, papelEhTitular } from '../constants/contactInvitation.constants.js';
import { STATUS_CONTATOS_LISTAVEIS } from '../constants/supportContact.constants.js';
import {
    formatarContato,
    formatarContatoRecebido,
    ordenarContatos
} from '../presenters/supportContact.presenter.js';

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
            'Somente a titular pode visualizar sua Rede de Apoio.',
            403,
            'ACESSO_NEGADO'
        );
    }
}

function criarResumo(contatos, incluirHistorico = false) {
    const resumo = {
        total: contatos.length,
        pendentes: contatos.filter(({ status }) => status === 'pendente').length,
        ativos: contatos.filter(({ status }) => status === 'ativo').length
    };

    if (incluirHistorico) {
        resumo.inativos = contatos.filter(({ status }) => status === 'inativo').length;
        resumo.recusados = contatos.filter(({ status }) => status === 'recusado').length;
    }

    return Object.freeze(resumo);
}

function validarContatoAutenticado(usuarioId, papel) {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw criarErro('Sessão inválida.', 401, 'SESSAO_INVALIDA');
    }

    if (!PAPEIS_CONTATO.includes(papel) && papel !== 'principal') {
        throw criarErro(
            'Somente contatos convidados podem visualizar convites recebidos.',
            403,
            'ACESSO_NEGADO'
        );
    }
}

function criarSupportContactService({ prisma, now = () => new Date() } = {}) {
    async function listar({ titularId, papel } = {}) {
        validarTitular(titularId, papel);

        if (typeof prisma?.vinculoRedeApoio?.findMany !== 'function' || typeof now !== 'function') {
            throw new TypeError('Não foi possível consultar os contatos da Rede de Apoio.');
        }

        const vinculos = await prisma.vinculoRedeApoio.findMany({
            where: {
                titularId,
                status: { in: STATUS_CONTATOS_LISTAVEIS }
            },
            select: {
                id: true,
                emailConvidado: true,
                iconeId: true,
                corId: true,
                status: true,
                permissoesIndividuais: true,
                dataEnvio: true,
                dataResposta: true,
                contato: {
                    select: {
                        nome: true,
                        email: true
                    }
                },
                categoria: {
                    select: {
                        id: true,
                        nome: true,
                        conjuntoDadosVisiveis: true
                    }
                }
            }
        });

        if (!Array.isArray(vinculos)) {
            throw new TypeError('A listagem de contatos da Rede de Apoio é inválida.');
        }

        const instante = now();
        const contatos = ordenarContatos(
            vinculos.map((vinculo) => formatarContato(vinculo, instante))
        );

        return Object.freeze({
            contatos: Object.freeze(contatos),
            resumo: criarResumo(contatos, true)
        });
    }

    async function listarRecebidos({ usuarioId, papel } = {}) {
        validarContatoAutenticado(usuarioId, papel);

        if (typeof prisma?.vinculoRedeApoio?.findMany !== 'function' || typeof now !== 'function') {
            throw new TypeError('Não foi possível consultar os convites recebidos.');
        }

        const instante = now();
        const vinculos = await prisma.vinculoRedeApoio.findMany({
            where: {
                contatoId: usuarioId,
                OR: [
                    { status: 'ativo' },
                    {
                        status: 'pendente',
                        dataExpiracao: { gt: instante }
                    }
                ]
            },
            select: {
                id: true,
                status: true,
                iconeId: true,
                corId: true,
                permissoesIndividuais: true,
                dataEnvio: true,
                dataResposta: true,
                titular: {
                    select: {
                        nome: true,
                        email: true
                    }
                },
                categoria: {
                    select: {
                        id: true,
                        nome: true,
                        conjuntoDadosVisiveis: true
                    }
                }
            }
        });

        if (!Array.isArray(vinculos)) {
            throw new TypeError('A listagem de convites recebidos é inválida.');
        }

        const contatos = ordenarContatos(
            vinculos.map((vinculo) => formatarContatoRecebido(vinculo, instante))
        );

        return Object.freeze({
            contatos: Object.freeze(contatos),
            resumo: criarResumo(contatos)
        });
    }

    return Object.freeze({ listar, listarRecebidos });
}

export {
    criarErro,
    criarResumo,
    criarSupportContactService,
    validarContatoAutenticado,
    validarTitular
};
