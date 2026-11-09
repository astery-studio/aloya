import { formatarData } from '../../cycles/utils/calendar.js';
import { CATEGORIAS_POR_ID, OPCOES_POR_ID } from '../catalog/diaryCatalog.lookup.js';

function apresentarDecimal(valor, casas) {
    if (!Number.isSafeInteger(valor) || !Number.isSafeInteger(casas)) return null;
    const sinal = valor < 0 ? '-' : '';
    const absoluto = Math.abs(valor);
    const escala = 10 ** casas;
    const inteiro = Math.floor(absoluto / escala);
    const fracao = String(absoluto % escala).padStart(casas, '0');
    return casas === 0 ? `${sinal}${inteiro}` : `${sinal}${inteiro}.${fracao}`;
}

function apresentarCategoria(categoria) {
    const resultado = {
        id: categoria.categoriaId,
        macrocategoria: categoria.macrocategoriaNome,
        nome: categoria.categoriaNome
    };

    if (categoria.valorEscalado !== null) {
        resultado.valor = apresentarDecimal(categoria.valorEscalado, categoria.casasDecimais);
    }
    if (categoria.categoriaId === 'temperatura_basal') {
        resultado.perturbada = categoria.medicaoTemperatura?.perturbada ?? false;
        if (categoria.medicaoTemperatura?.motivoPerturbacao) {
            resultado.motivoPerturbacao = categoria.medicaoTemperatura.motivoPerturbacao;
        }
    }
    if (categoria.valorDuracaoMinutos !== null) {
        resultado.duracaoMinutos = categoria.valorDuracaoMinutos;
    }
    if (categoria.valorTexto !== null) {
        resultado.texto = categoria.valorTexto;
        resultado.quantidadeCaracteres = [...categoria.valorTexto].length;
    }
    if (categoria.opcoes?.length) {
        resultado.opcoes = categoria.opcoes.map((opcao) => ({
            id: opcao.opcaoId,
            grupo: opcao.grupo,
            nome: opcao.opcaoNome
        }));
    }

    return resultado;
}

function apresentarDetalheRegistro(registro) {
    const categorias = [...registro.categorias].sort((a, b) => {
        const primeira = CATEGORIAS_POR_ID.get(a.categoriaId);
        const segunda = CATEGORIAS_POR_ID.get(b.categoriaId);
        return (
            (primeira?.macro.ordem ?? 99) - (segunda?.macro.ordem ?? 99) ||
            (primeira?.ordem ?? 99) - (segunda?.ordem ?? 99)
        );
    });
    for (const categoria of categorias) {
        categoria.opcoes?.sort(
            (a, b) =>
                (OPCOES_POR_ID.get(a.opcaoId)?.ordem ?? 99) -
                (OPCOES_POR_ID.get(b.opcaoId)?.ordem ?? 99)
        );
    }

    return {
        id: registro.id,
        data: formatarData(registro.dataRegistro),
        fase: registro.faseCicloAssociada,
        versao: registro.versao,
        categorias: categorias.map(apresentarCategoria),
        criadoEm: registro.criadoEm.toISOString(),
        atualizadoEm: registro.atualizadoEm.toISOString()
    };
}

export { apresentarDecimal, apresentarDetalheRegistro };
