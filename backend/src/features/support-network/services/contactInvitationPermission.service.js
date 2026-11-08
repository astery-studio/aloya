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

    return Object.freeze({ resolverCategoria });
}

export { criarContactInvitationPermissionService };
