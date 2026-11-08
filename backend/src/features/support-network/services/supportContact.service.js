import { papelEhTitular } from '../constants/contactInvitation.constants.js';
import { STATUS_CONTATOS_VISIVEIS } from '../constants/supportContact.constants.js';
import {
    formatarContato,
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

function criarResumo(contatos) {
    const pendentes = contatos.filter(({ status }) => status === 'pendente').length;
    return Object.freeze({
        total: contatos.length,
        pendentes,
        ativos: contatos.length - pendentes
    });
}

function criarSupportContactService({ prisma, now = () => new Date() } = {}) {
    async function listar({ titularId, papel } = {}) {
        validarTitular(titularId, papel);

        if (
            typeof prisma?.vinculoRedeApoio?.findMany !== 'function' ||
            typeof now !== 'function'
        ) {
            throw new TypeError('Não foi possível consultar os contatos da Rede de Apoio.');
        }

        const vinculos = await prisma.vinculoRedeApoio.findMany({
            where: {
                titularId,
                status: { in: STATUS_CONTATOS_VISIVEIS }
            },
            select: {
                id: true,
                emailConvidado: true,
                status: true,
                permissoesIndividuais: true,
                dataEnvio: true,
                dataResposta: true,
                contato: {
                    select: {
                        nome: true
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
            resumo: criarResumo(contatos)
        });
    }

    return Object.freeze({ listar });
}

export { criarErro, criarResumo, criarSupportContactService, validarTitular };
