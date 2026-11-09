import { AppError } from '../../../shared/errors/AppError.js';
import { obterCategoriasAtivas } from './diaryActiveCategories.js';

function assinaturaNova(item) {
    return JSON.stringify({
        categoriaId: item.categoriaId,
        opcoes: item.opcoes?.map(({ id }) => id).toSorted() ?? [],
        valorEscalado: item.valorEscalado ?? null,
        casasDecimais: item.casasDecimais ?? null,
        valorDuracaoMinutos: item.valorDuracaoMinutos ?? null,
        valorTexto: item.valorTexto ?? null,
        perturbada: item.medicaoTemperatura?.perturbada ?? false,
        motivoPerturbacao: item.medicaoTemperatura?.motivoPerturbacao ?? null
    });
}

function assinaturaAtual(item) {
    return JSON.stringify({
        categoriaId: item.categoriaId,
        opcoes: item.opcoes.map(({ opcaoId }) => opcaoId).toSorted(),
        valorEscalado: item.valorEscalado,
        casasDecimais: item.casasDecimais,
        valorDuracaoMinutos: item.valorDuracaoMinutos,
        valorTexto: item.valorTexto,
        perturbada: item.medicaoTemperatura?.perturbada ?? false,
        motivoPerturbacao: item.medicaoTemperatura?.motivoPerturbacao ?? null
    });
}

function assinaturaCategorias(itens, assinatura) {
    return itens.map(assinatura).toSorted().join('|');
}

function validarEdicaoCategorias(novas, atuais, preferenciasMacro, preferenciasCategoria) {
    const ativas = obterCategoriasAtivas(preferenciasMacro, preferenciasCategoria);
    const novasPorId = new Map(novas.map((item) => [item.categoriaId, item]));
    const atuaisPorId = new Map(atuais.map((item) => [item.categoriaId, item]));

    for (const categoria of novas) {
        if (ativas.has(categoria.categoriaId)) continue;
        const atual = atuaisPorId.get(categoria.categoriaId);
        if (!atual || assinaturaNova(categoria) !== assinaturaAtual(atual)) {
            throw new AppError(
                'Uma categoria desativada não pode ser alterada.',
                422,
                'CATEGORIA_DIARIO_INATIVA'
            );
        }
    }
    for (const categoria of atuais) {
        if (!ativas.has(categoria.categoriaId) && !novasPorId.has(categoria.categoriaId)) {
            throw new AppError(
                'Preserve os dados de categorias desativadas.',
                422,
                'CATEGORIA_INATIVA_OMITIDA'
            );
        }
    }
}

export { assinaturaNova, assinaturaAtual, assinaturaCategorias, validarEdicaoCategorias };
