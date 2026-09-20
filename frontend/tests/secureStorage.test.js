import * as SecureStore from 'expo-secure-store';
import { lerSeguro, removerSeguro, salvarSeguro } from '../services/storage/secureStorage';

jest.mock('expo-secure-store', () => ({
    isAvailableAsync: jest.fn(),
    setItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
    deleteItemAsync: jest.fn()
}));

beforeEach(() => {
    jest.clearAllMocks();
    SecureStore.isAvailableAsync.mockResolvedValue(true);
});

test('salva, lê e remove valores pelo armazenamento seguro', async () => {
    SecureStore.getItemAsync.mockResolvedValue('valor-protegido');
    await salvarSeguro('sessao', 'valor-protegido');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('sessao', 'valor-protegido');
    await expect(lerSeguro('sessao')).resolves.toBe('valor-protegido');
    await removerSeguro('sessao');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('sessao');
});

test('não usa armazenamento inseguro quando SecureStore está indisponível', async () => {
    SecureStore.isAvailableAsync.mockResolvedValue(false);
    await expect(salvarSeguro('sessao', 'segredo')).rejects.toThrow('indisponível');
    await expect(lerSeguro('sessao')).rejects.toThrow('indisponível');
    await expect(removerSeguro('sessao')).rejects.toThrow('indisponível');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
});
