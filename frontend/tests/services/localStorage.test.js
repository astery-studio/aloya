//Testa o armazenamento de informações locais não sensíveis.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { obterDadoLocal, removerDadoLocal, salvarDadoLocal } from '../../services/storage/localStorage';

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

    test.each([null, 123, {}])('rejeita chave que não é texto', async (chave) => {
        await expect(salvarDadoLocal(chave, true)).rejects.toThrow(
            'A chave do armazenamento local precisa ser um texto.'
        );
    });

    test.each([
        () => 'valor',
        Symbol('valor')
    ])('rejeita tipos que não podem ser serializados', async (valor) => {
        await expect(salvarDadoLocal('preferencia', valor)).rejects.toThrow(
            'O valor informado não pode ser salvo'
        );
    });

    test('rejeita valor acima do limite permitido', async () => {
        await expect(salvarDadoLocal('preferencia', 'a'.repeat(100001)))
            .rejects.toThrow('maior que o limite');
    });

    test('não expõe falha ao ler JSON corrompido', async () => {
        AsyncStorage.getItem.mockResolvedValueOnce('{invalido');
        await expect(obterDadoLocal('preferencia')).rejects.toThrow(
            'Não foi possível ler a informação salva neste aparelho.'
        );
    });

    test('não expõe falha técnica ao remover', async () => {
        AsyncStorage.removeItem.mockRejectedValueOnce(new Error('interno'));
        await expect(removerDadoLocal('preferencia')).rejects.toThrow(
            'Não foi possível remover a informação deste aparelho.'
        );
    });
});
