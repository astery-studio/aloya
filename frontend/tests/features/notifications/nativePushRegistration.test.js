import { waitFor } from '@testing-library/react-native';
import { criarSincronizacaoPush } from '../../../src/features/notifications/nativePushRegistration';

function criarContexto() {
    const registro = new Map([['aloya.push.instalacao', 'instalacao']]);
    return {
        controller: new AbortController(),
        projectId: 'projeto',
        plataforma: 'ios',
        service: {
            registrar: jest.fn().mockResolvedValue('dispositivo')
        },
        AsyncStorage: {
            getItem: async (chave) => registro.get(chave),
            setItem: async (chave, valor) => registro.set(chave, valor)
        },
        push: {
            IosAuthorizationStatus: { PROVISIONAL: 3 },
            getPermissionsAsync: async () => ({ granted: true }),
            getExpoPushTokenAsync: jest.fn()
        }
    };
}

test('reaproveita o token recebido pelo listener e registra uma vez por estado', async () => {
    const contexto = criarContexto();
    const sincronizar = criarSincronizacaoPush(contexto);
    const tokenInicial = { type: 'ios', data: 'nativo-1' };
    contexto.push.getExpoPushTokenAsync.mockImplementation(async ({ devicePushToken }) => {
        if (!devicePushToken) void sincronizar({ tokenNativo: tokenInicial });
        return { data: `expo-${(devicePushToken ?? tokenInicial).data}` };
    });

    await sincronizar();
    await waitFor(() => expect(contexto.push.getExpoPushTokenAsync).toHaveBeenCalledTimes(2));
    expect(contexto.push.getExpoPushTokenAsync).toHaveBeenLastCalledWith({
        projectId: 'projeto',
        devicePushToken: tokenInicial
    });

    await sincronizar({ tokenNativo: tokenInicial });
    expect(contexto.service.registrar).toHaveBeenCalledTimes(1);
    await sincronizar({ tokenNativo: { type: 'ios', data: 'nativo-2' } });
    await waitFor(() => expect(contexto.service.registrar).toHaveBeenCalledTimes(2));
    expect(contexto.service.registrar).toHaveBeenLastCalledWith(
        expect.objectContaining({ token: 'expo-nativo-2' }),
        contexto.controller.signal
    );
});

test('respeita a espera indicada pelo servidor depois de um 429', async () => {
    const contexto = criarContexto();
    const sincronizar = criarSincronizacaoPush(contexto);
    contexto.push.getExpoPushTokenAsync.mockResolvedValue({ data: 'expo' });
    contexto.service.registrar.mockRejectedValueOnce({ status: 429, tentarAposMs: 30_000 });
    const relogio = jest.spyOn(Date, 'now').mockReturnValue(1000);
    try {
        await sincronizar();
        await sincronizar();
        expect(contexto.service.registrar).toHaveBeenCalledTimes(1);
        relogio.mockReturnValue(31_000);
        await sincronizar();
        expect(contexto.service.registrar).toHaveBeenCalledTimes(2);
    } finally {
        relogio.mockRestore();
    }
});
