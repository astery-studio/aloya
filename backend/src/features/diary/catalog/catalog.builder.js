function criarIdentificador(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

function normalizarCategoria(categoria, indice) {
    const opcoes = (categoria.grupos ?? [])
        .flatMap((grupo) =>
            grupo.opcoes.map((nome) => ({
                id: `${categoria.id}_${grupo.id}_${criarIdentificador(nome)}`,
                grupo: grupo.id,
                nome
            }))
        )
        .map((opcao, ordem) => ({ ...opcao, ordem: ordem + 1 }));

    return {
        tipoValor: 'opcoes',
        sensivel: false,
        ...categoria,
        ordem: indice + 1,
        opcoes,
        grupos: undefined
    };
}

function normalizarMacrocategoria(macrocategoria, indice) {
    return {
        sensivel: false,
        ...macrocategoria,
        ordem: indice + 1,
        categorias: macrocategoria.categorias.map(normalizarCategoria)
    };
}

export { normalizarMacrocategoria };
