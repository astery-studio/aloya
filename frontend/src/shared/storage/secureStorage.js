/**
 * Adapta o Expo SecureStore para persistir, ler e remover dados sensíveis.
 */
import * as SecureStore from 'expo-secure-store';

async function exigirArmazenamentoSeguro() {
    if (!await SecureStore.isAvailableAsync()) {
        throw new Error('Armazenamento seguro indisponível neste dispositivo.');
    }
}

async function salvarSeguro(chave, valor) {
    await exigirArmazenamentoSeguro();
    await SecureStore.setItemAsync(chave, valor);
}

async function lerSeguro(chave) {
    await exigirArmazenamentoSeguro();
    return SecureStore.getItemAsync(chave);
}

async function removerSeguro(chave) {
    await exigirArmazenamentoSeguro();
    await SecureStore.deleteItemAsync(chave);
}

export { salvarSeguro, lerSeguro, removerSeguro };
