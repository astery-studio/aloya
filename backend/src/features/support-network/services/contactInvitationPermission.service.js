function criarErro(mensagem, status, codigo) {
    const erro = new Error(mensagem);
    erro.status = status;
    erro.codigo = codigo;
    return erro;
}

function criarContactInvitationPermissionService({ prisma } = {}) {
    async function resolverCategoria({ titularId, categoriaId } = {}) {
        if (typeof prisma?.categoriaPermissao?.findFirst !== 'function') {
            throw new TypeError('Não foi possível consultar a categoria de permissão.');
        }

        const categoria = await prisma.categoriaPermissao.findFirst({
            where: { id: categoriaId, titularId },
            select: { id: true, nome: true }
        });

        if (!categoria) {
            throw criarErro(
                'A categoria selecionada não foi encontrada.',
                404,
                'CATEGORIA_NAO_ENCONTRADA'
            );
        }

        return Object.freeze({
            tipo: 'categoria',
            categoriaId: categoria.id,
            categoriaNome: categoria.nome,
            permissoesIndividuais: []
        });
    }

    function resolverPermissoesIndividuais(permissoesRecebidas) {
        if (
            !Array.isArray(permissoesRecebidas) ||
            permissoesRecebidas.length === 0 ||
            permissoesRecebidas.length > permissoesDaCategoria.length ||
            permissoesRecebidas.some((permissao) => !permissaoCategoriaEhValida(permissao))
        ) {
            throw criarErro(
                'Selecione ao menos um tipo de dado para o contato visualizar.',
                422,
                'PERMISSOES_INDIVIDUAIS_INVALIDAS'
            );
        }

        return Object.freeze({
            tipo: 'individual',
            categoriaId: null,
            categoriaNome: null,
            permissoesIndividuais: ordenarPermissoesCategoria(permissoesRecebidas)
        });
    }

    return Object.freeze({ resolverCategoria, resolverPermissoesIndividuais });
}

export { criarContactInvitationPermissionService };
import {
    ordenarPermissoesCategoria,
    permissaoCategoriaEhValida,
    permissoesDaCategoria
} from '../constants/contactInvitation.constants.js';
