import { exibirPrevia } from '../../../src/features/notifications/notificationPreview';
import { aviso, criarSdk } from './notificationPreviewFixture';

test('pede permissão no iOS e solicita prévia sem atraso', async () => {
    const sdk = criarSdk();
    sdk.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
    sdk.requestPermissionsAsync.mockResolvedValue({ granted: true });
    expect(await exibirPrevia({ ...aviso, plataforma: 'ios', sdk })).toBe('solicitada');
    expect(sdk.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(sdk.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({ trigger: null })
    );
    expect(sdk.setNotificationChannelAsync).not.toHaveBeenCalled();
});

test('não agenda em plataforma sem suporte, permissão negada ou canal bloqueado', async () => {
    const sdk = criarSdk(false);
    expect(await exibirPrevia({ ...aviso, plataforma: 'web' })).toBe('plataforma');
    expect(await exibirPrevia({ ...aviso, plataforma: 'ios', sdk })).toBe('permissao');
    sdk.getPermissionsAsync.mockResolvedValue({ granted: true });
    sdk.getNotificationChannelAsync.mockResolvedValue({ importance: 0 });
    expect(await exibirPrevia({ ...aviso, plataforma: 'android', sdk })).toBe('canal');
    expect(sdk.scheduleNotificationAsync).not.toHaveBeenCalled();
});

test('não agenda a prévia quando o aviso deixou de estar habilitado', async () => {
    const sdk = criarSdk();
    const autorizar = jest.fn().mockResolvedValue(false);
    expect(await exibirPrevia({ ...aviso, plataforma: 'android', sdk, autorizar }))
        .toBe('desativada');
    expect(autorizar).toHaveBeenCalledWith(aviso.codigo);
    expect(sdk.scheduleNotificationAsync).not.toHaveBeenCalled();
});
