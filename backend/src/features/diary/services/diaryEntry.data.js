import { AppError } from '../../../shared/errors/AppError.js';

function validarCategoriasAtivas(categorias, preferenciasMacro, preferenciasCategoria) {
    const macros = new Map(preferenciasMacro.map((item) => [item.macrocategoriaId, item.ativa]));
    const estados = new Map(preferenciasCategoria.map((item) => [item.categoriaId, item.ativa]));

    for (const item of categorias) {
        const macroAtiva = macros.get(item.categoria.macro.id) ?? true;
        const categoriaAtiva = estados.get(item.categoriaId) ?? true;
        if (!macroAtiva || !categoriaAtiva) {
            throw new AppError(
                'Uma categoria informada está desativada.',
                422,
                'CATEGORIA_DIARIO_INATIVA'
            );
        }
    }
}

function montarCategorias(categorias) {
    return categorias.map((item) => ({
        categoriaId: item.categoriaId,
        macrocategoriaNome: item.categoria.macro.nome,
        categoriaNome: item.categoria.nome,
        valorEscalado: item.valorEscalado,
        casasDecimais: item.casasDecimais,
        valorDuracaoMinutos: item.valorDuracaoMinutos,
        valorTexto: item.valorTexto,
        medicaoTemperatura: item.medicaoTemperatura
            ? { create: item.medicaoTemperatura }
            : undefined,
        opcoes: item.opcoes?.length
            ? {
                  create: item.opcoes.map((opcao) => ({
                      opcaoId: opcao.id,
                      grupo: opcao.grupo,
                      opcaoNome: opcao.nome
                  }))
              }
            : undefined
    }));
}

export { validarCategoriasAtivas, montarCategorias };
