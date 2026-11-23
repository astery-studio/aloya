import { CATALOGO_DIARIO } from './diary.catalog.js';

const MACROS_POR_ID = new Map(CATALOGO_DIARIO.map((macro) => [macro.id, macro]));
const CATEGORIAS_POR_ID = new Map();
const OPCOES_POR_ID = new Map();

for (const macro of CATALOGO_DIARIO) {
    for (const categoria of macro.categorias) {
        CATEGORIAS_POR_ID.set(categoria.id, { ...categoria, macro });
        for (const opcao of categoria.opcoes) {
            OPCOES_POR_ID.set(opcao.id, { ...opcao, categoriaId: categoria.id });
        }
    }
}

export { MACROS_POR_ID, CATEGORIAS_POR_ID, OPCOES_POR_ID };
