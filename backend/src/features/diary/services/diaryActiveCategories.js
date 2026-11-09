import { AppError } from '../../../shared/errors/AppError.js';
import { CATALOGO_DIARIO } from '../catalog/diary.catalog.js';

function obterCategoriasAtivas(preferenciasMacro, preferenciasCategoria) {
    const macros = new Map(preferenciasMacro.map((item) => [item.macrocategoriaId, item.ativa]));
    const categorias = new Map(preferenciasCategoria.map((item) => [item.categoriaId, item.ativa]));
    const ativas = new Set();

    for (const macro of CATALOGO_DIARIO) {
        if ((macros.get(macro.id) ?? true) === false) continue;
        for (const categoria of macro.categorias) {
            if (categorias.get(categoria.id) ?? true) ativas.add(categoria.id);
        }
    }
    return ativas;
}

function validarCategoriasDoFiltro(filtros, categoriasAtivas) {
    if (filtros.categorias.some((id) => !categoriasAtivas.has(id))) {
        throw new AppError(
            'Uma categoria do filtro está desativada.',
            422,
            'CATEGORIA_FILTRO_INATIVA'
        );
    }
}

export { obterCategoriasAtivas, validarCategoriasDoFiltro };
