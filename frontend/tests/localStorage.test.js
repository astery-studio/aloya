//Testa o armazenamento de informações locais não sensíveis.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obterDadoLocal, removerDadoLocal, salvarDadoLocal } from '../services/storage/localStorage';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

describe('localStorage', () => {
    beforeEach(async () => {
        await AsyncStorage.clear();
        jest.clearAllMocks();
    });

    test('salva e recupera um valor não sensível', async () => {
        const preferencia = { lembretesAtivos: true, visualizacao: 'compacta' };

        await salvarDadoLocal('preferencias', preferencia);

        await expect(obterDadoLocal('preferencias')).resolves.toEqual(preferencia);
    });

    test('retorna null quando a informação não existe', async () => {
        await expect(obterDadoLocal('informacao-inexistente')).resolves.toBeNull();
    });

    test('remove somente a informação solicitada', async () => {
        await salvarDadoLocal('preferencia-a', 'A');
        await salvarDadoLocal('preferencia-b', 'B');

        await removerDadoLocal('preferencia-a');

        await expect(obterDadoLocal('preferencia-a')).resolves.toBeNull();
        await expect(obterDadoLocal('preferencia-b')).resolves.toBe('B');
    });

    test.each(['token', 'refresh-token', 'senha', 'jwt-da-sessao', 'credencial'])('rejeita a chave sensível %s', async (chave) => {
        await expect(salvarDadoLocal(chave, 'segredo')).rejects.toThrow('Dados sensíveis não podem ser salvos');
    });

    test('rejeita chave vazia', async () => {
        await expect(salvarDadoLocal('', 'valor')).rejects.toThrow('A chave do armazenamento local é inválida.');
    });

    test('rejeita valor indefinido', async () => {
        await expect(salvarDadoLocal('preferencia', undefined)).rejects.toThrow('O valor informado não pode ser salvo');
    });

    test('rejeita objeto circular', async () => {
        const valorCircular = {};
        valorCircular.proprioValor = valorCircular;

        await expect(salvarDadoLocal('preferencia', valorCircular)).rejects.toThrow('O valor informado não pode ser salvo');
    });

    test('não expõe o erro técnico do armazenamento', async () => {
        AsyncStorage.setItem.mockRejectedValueOnce(new Error('Erro interno sensível'));

        await expect(salvarDadoLocal('preferencia', true)).rejects.toThrow('Não foi possível salvar a informação neste aparelho.');
    });
});