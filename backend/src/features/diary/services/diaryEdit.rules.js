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

function validarEdicaoCategorias(novas, _atuais, preferenciasMacro, preferenciasCategoria) {
    const ativas = obterCategoriasAtivas(preferenciasMacro, preferenciasCategoria);

    for (const categoria of novas) {
        if (ativas.has(categoria.categoriaId)) continue;
        throw new AppError(
            'Uma categoria desativada não pode ser alterada.',
            422,
            'CATEGORIA_DIARIO_INATIVA'
        );
    }

    return ativas;
}

export { assinaturaNova, assinaturaAtual, assinaturaCategorias, validarEdicaoCategorias };
