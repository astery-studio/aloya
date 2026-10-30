import { validarExclusaoCiclo, validarRemocaoDia } from '../validators/cycleRemoval.validator.js';

const MENSAGEM_SUCESSO = 'Registro de menstruação excluído com sucesso.';

function validarRepository(repository) {
    if (
        typeof repository?.removerDia !== 'function' ||
        typeof repository?.excluirCiclo !== 'function'
    ) {
        throw new TypeError('O repositório de remoção de ciclos é inválido.');
    }
}

function criarResultado(resultado) {
    if (
        !resultado ||
        typeof resultado !== 'object' ||
        !Number.isSafeInteger(resultado.quantidadeCiclos) ||
        resultado.quantidadeCiclos < 0 ||
        typeof resultado.cicloRemovido !== 'boolean'
    ) {
        throw new TypeError('O resultado da remoção de ciclo é inválido.');
    }

    return Object.freeze({
        mensagem: MENSAGEM_SUCESSO,
        cicloRemovido: resultado.cicloRemovido,
        quantidadeCiclos: resultado.quantidadeCiclos,
        possuiCiclos: resultado.quantidadeCiclos > 0
    });
}

function criarCycleRemovalService({ repository } = {}) {
    validarRepository(repository);

    async function removerDia(argumentos = {}) {
        const dados = validarRemocaoDia(argumentos);
        return criarResultado(await repository.removerDia(dados));
    }

    async function excluirCiclo(argumentos = {}) {
        const dados = validarExclusaoCiclo(argumentos);
        return criarResultado(await repository.excluirCiclo(dados));
    }

    return Object.freeze({ removerDia, excluirCiclo });
}

export { MENSAGEM_SUCESSO, criarCycleRemovalService };
