import { lerSeguro, removerSeguro, salvarSeguro } from '../../../shared/storage/secureStorage';

function chaveDaConta(contaId) {
    if (!Number.isSafeInteger(contaId) || contaId <= 0) {
        throw new TypeError('Conta inválida para guardar a visualização.');
    }
    return `rede-apoio.visualizacao.${contaId}`;
}

async function lerVinculoVisualizado(contaId) {
    const valor = await lerSeguro(chaveDaConta(contaId));
    if (typeof valor !== 'string' || !/^[1-9]\d*$/u.test(valor)) return null;
    const id = Number(valor);
    return Number.isSafeInteger(id) ? id : null;
}

async function salvarVinculoVisualizado(contaId, vinculoId) {
    const chave = chaveDaConta(contaId);
    if (vinculoId === null) return removerSeguro(chave);
    if (!Number.isSafeInteger(vinculoId) || vinculoId <= 0) {
        throw new TypeError('Vínculo inválido para guardar a visualização.');
    }
    return salvarSeguro(chave, String(vinculoId));
}

export { lerVinculoVisualizado, salvarVinculoVisualizado };
