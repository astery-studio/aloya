import { AppError } from '../../../shared/errors/AppError.js';
import { CATEGORIAS_POR_ID, OPCOES_POR_ID } from '../catalog/diaryCatalog.lookup.js';
import { normalizarDecimal } from './diaryDecimal.validator.js';
import { validarTemperatura } from './diaryTemperature.validator.js';
const CAMPOS_POR_TIPO = {
    opcoes: new Set(['categoriaId', 'opcoes']),
    decimal_escalado: new Set(['categoriaId', 'valor']),
    duracao_minutos: new Set(['categoriaId', 'duracaoMinutos']),
    texto: new Set(['categoriaId', 'texto'])
};
const CAMPOS_TEMPERATURA = new Set(['categoriaId', 'valor', 'perturbada', 'motivoPerturbacao']);
function validarObjeto(valor) {
    return (
        valor &&
        typeof valor === 'object' &&
        !Array.isArray(valor) &&
        [Object.prototype, null].includes(Object.getPrototypeOf(valor))
    );
}
function validarOpcoes(entrada, categoria) {
    if (
        !Array.isArray(entrada.opcoes) ||
        entrada.opcoes.length === 0 ||
        entrada.opcoes.length > categoria.opcoes.length
    ) {
        throw new AppError('Selecione ao menos uma opção válida.', 422, 'OPCOES_DIARIO_INVALIDAS');
    }
    const ids = new Set(entrada.opcoes);
    if (
        ids.size !== entrada.opcoes.length ||
        [...ids].some((id) => {
            const opcao = OPCOES_POR_ID.get(id);
            return !opcao || opcao.categoriaId !== categoria.id;
        })
    ) {
        throw new AppError(
            'Uma opção informada não pertence à categoria.',
            422,
            'OPCOES_DIARIO_INVALIDAS'
        );
    }
    return [...ids].map((id) => OPCOES_POR_ID.get(id));
}

function validarValor(entrada, categoria) {
    if (categoria.tipoValor === 'opcoes') return { opcoes: validarOpcoes(entrada, categoria) };
    if (categoria.tipoValor === 'decimal_escalado') {
        const decimal = normalizarDecimal(entrada.valor, categoria.casasDecimais);
        if (categoria.id !== 'temperatura_basal') return decimal;
        return validarTemperatura(entrada, decimal);
    }
    if (categoria.tipoValor === 'duracao_minutos') {
        if (!Number.isSafeInteger(entrada.duracaoMinutos) || entrada.duracaoMinutos < 0) {
            throw new AppError(
                'Informe uma duração válida em minutos.',
                422,
                'DURACAO_DIARIO_INVALIDA'
            );
        }
        return { valorDuracaoMinutos: entrada.duracaoMinutos };
    }
    const quantidade = typeof entrada.texto === 'string' ? [...entrada.texto].length : -1;
    if (quantidade <= 0 || quantidade > categoria.limiteCaracteres) {
        throw new AppError(
            'A anotação deve ter entre 1 e 5.000 caracteres.',
            422,
            'ANOTACAO_INVALIDA'
        );
    }
    return { valorTexto: entrada.texto };
}

function validarCategoriaPreenchida(entrada) {
    if (!validarObjeto(entrada) || typeof entrada.categoriaId !== 'string') {
        throw new AppError(
            'Uma categoria preenchida é inválida.',
            422,
            'CATEGORIA_DIARIO_INVALIDA'
        );
    }
    const categoria = CATEGORIAS_POR_ID.get(entrada.categoriaId);
    if (!categoria) {
        throw new AppError('Categoria do Diário não encontrada.', 422, 'CATEGORIA_DIARIO_INVALIDA');
    }
    const camposPermitidos =
        categoria.id === 'temperatura_basal'
            ? CAMPOS_TEMPERATURA
            : CAMPOS_POR_TIPO[categoria.tipoValor];
    if (Object.keys(entrada).some((campo) => !camposPermitidos.has(campo))) {
        throw new AppError('Informe somente os campos da categoria.', 422, 'CAMPO_DESCONHECIDO');
    }
    return {
        categoriaId: categoria.id,
        categoria,
        ...validarValor(entrada, categoria)
    };
}

export { validarCategoriaPreenchida };
