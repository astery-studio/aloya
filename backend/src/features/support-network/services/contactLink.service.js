import { criarErro, validarTitular } from './supportContact.service.js';
import {
    TIPO_VINCULO_CATEGORIA,
    TIPO_VINCULO_INDIVIDUAL
} from '../constants/contactLink.constants.js';

const comparadorNomes = new Intl.Collator('pt-BR', {
    numeric: true,
    sensitivity: 'base'
});

function compararCategorias(primeira, segunda) {
    const porNome = comparadorNomes.compare(primeira.nome, segunda.nome);
    return porNome !== 0 ? porNome : primeira.id - segunda.id;
}

function criarErroContatoIndisponivel() {
    return criarErro(
        'Este contato ativo não está disponível para alteração.',
        404,
        'CONTATO_ATIVO_NAO_ENCONTRADO'
    );
}

function copiarPermissoes(permissoes) {
    return Array.isArray(permissoes) ? [...permissoes] : [];
}

function apresentarCategoria(categoria) {
    return Object.freeze({
        id: categoria.id,
        nome: categoria.nome,
        permissoes: Object.freeze(copiarPermissoes(categoria.conjuntoDadosVisiveis))
    });
}

function apresentarConfiguracao(vinculo, categorias) {
    const porCategoria = vinculo.categoria !== null;
    const permissoesAtuais = porCategoria
        ? vinculo.categoria.conjuntoDadosVisiveis
        : vinculo.permissoesIndividuais;

    return Object.freeze({
        contato: Object.freeze({
            id: vinculo.id,
            nome: vinculo.contato.nome,
            email: vinculo.emailConvidado
        }),
        vinculoAtual: Object.freeze({
            tipo: porCategoria ? TIPO_VINCULO_CATEGORIA : TIPO_VINCULO_INDIVIDUAL,
            categoria: porCategoria ? apresentarCategoria(vinculo.categoria) : null,
            permissoes: Object.freeze(copiarPermissoes(permissoesAtuais))
        }),
        proximoVinculo: Object.freeze(
            porCategoria
                ? {
                      tipo: TIPO_VINCULO_INDIVIDUAL,
                      permissoesPreenchidas: Object.freeze(copiarPermissoes(permissoesAtuais)),
                      categorias: Object.freeze([])
                  }
                : {
                      tipo: TIPO_VINCULO_CATEGORIA,
                      permissoesPreenchidas: Object.freeze([]),
                      categorias: Object.freeze(categorias.map(apresentarCategoria))
                  }
        ),
        versao: vinculo.atualizadoEm.toISOString()
    });
}

function criarContactLinkService({ prisma } = {}) {
    async function consultar({ titularId, papel, contatoId } = {}) {
        validarTitular(titularId, papel);
        if (
            !Number.isSafeInteger(contatoId) ||
            contatoId <= 0 ||
            typeof prisma?.vinculoRedeApoio?.findFirst !== 'function' ||
            typeof prisma?.categoriaPermissao?.findMany !== 'function'
        ) {
            throw new TypeError('Não foi possível consultar o vínculo deste contato.');
        }

        const vinculo = await prisma.vinculoRedeApoio.findFirst({
            where: { id: contatoId, titularId, status: 'ativo' },
            select: {
                id: true,
                emailConvidado: true,
                permissoesIndividuais: true,
                atualizadoEm: true,
                contato: { select: { nome: true } },
                categoria: {
                    select: {
                        id: true,
                        nome: true,
                        conjuntoDadosVisiveis: true
                    }
                }
            }
        });
        if (!vinculo?.contato) throw criarErroContatoIndisponivel();

        const categorias = vinculo.categoria
            ? []
            : await prisma.categoriaPermissao.findMany({
                  where: { titularId },
                  select: {
                      id: true,
                      nome: true,
                      conjuntoDadosVisiveis: true
                  },
                  orderBy: [{ nomeNormalizado: 'asc' }, { id: 'asc' }]
              });

        if (!Array.isArray(categorias)) {
            throw new TypeError('A listagem de categorias disponíveis é inválida.');
        }

        return apresentarConfiguracao(vinculo, [...categorias].sort(compararCategorias));
    }

    return Object.freeze({ consultar });
}

export {
    apresentarConfiguracao,
    criarContactLinkService,
    criarErroContatoIndisponivel
};
