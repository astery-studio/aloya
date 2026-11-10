import { decomporData } from './diaryDate';
import { montarCategoriaPayload, validarValorCategoria } from './diaryFormValue';

const ERRO_DATA = 'A data do registro não pode ser no futuro.';
const ERRO_CONTEUDO = 'Preencha ao menos uma categoria para salvar o registro.';

function listarMacrocategoriasAtivas(catalogo) {
    if (!Array.isArray(catalogo?.macrocategorias)) return [];
    return catalogo.macrocategorias
        .filter((macro) => macro.ativa)
        .map((macro) => ({
            ...macro,
            categorias: macro.categorias.filter((categoria) => categoria.ativaEfetiva)
        }))
        .filter((macro) => macro.categorias.length > 0);
}

function validarDataRegistro(data, hoje) {
    return decomporData(data) && decomporData(hoje) && data <= hoje ? null : ERRO_DATA;
}

function prepararFormularioDiario({ catalogo, valores = {}, data, hoje }) {
    const erros = {};
    const categorias = [];

    for (const macro of listarMacrocategoriasAtivas(catalogo)) {
        for (const categoria of macro.categorias) {
            const valor = valores[categoria.id];
            const erro = validarValorCategoria(categoria, valor);
            const payload = montarCategoriaPayload(categoria, valor);
            if (erro) erros[categoria.id] = erro;
            if (payload) categorias.push(payload);
        }
    }

    const erroData = validarDataRegistro(data, hoje);
    if (erroData) erros.data = erroData;
    if (categorias.length === 0) erros.conteudo = ERRO_CONTEUDO;

    return {
        valido: Object.keys(erros).length === 0,
        erros,
        dados: {
            data,
            fusoHorario: Intl.DateTimeFormat().resolvedOptions().timeZone,
            categorias
        }
    };
}

export {
    ERRO_CONTEUDO,
    ERRO_DATA,
    listarMacrocategoriasAtivas,
    prepararFormularioDiario,
    validarDataRegistro
};
