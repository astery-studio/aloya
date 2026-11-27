import { canaisNativos, prepararCanalNativo } from './nativeNotificationPresentation';

const chaveInstalacao = 'aloya.push.instalacao';
const chaveDispositivo = 'aloya.push.dispositivo';

async function obterInstalacao(AsyncStorage) {
    const anterior = await AsyncStorage.getItem(chaveInstalacao);
    if (anterior) return anterior;

    const { randomUUID } = await import('expo-crypto');
    const instalacao = randomUUID();
    await AsyncStorage.setItem(chaveInstalacao, instalacao);
    return instalacao;
}

export async function atualizarRegistro(
    { push, AsyncStorage, service, controller, projectId, plataforma },
    solicitar
) {
    if (plataforma === 'android')
        await Promise.all(Object.keys(canaisNativos).map((id) => prepararCanalNativo(push, id)));

    let permissao = await push.getPermissionsAsync();
    if (solicitar && permissao.canAskAgain && permissao.status === 'undetermined') {
        permissao = await push.requestPermissionsAsync();
    }

    if (controller.signal.aborted) return;

    if (!permissao.granted && permissao.ios?.status !== push.IosAuthorizationStatus.PROVISIONAL) {
        const dispositivo = await AsyncStorage.getItem(chaveDispositivo);
        if (dispositivo) {
            await service.remover(dispositivo, controller.signal);
            await AsyncStorage.removeItem(chaveDispositivo);
        }
        return;
    }

    const instalacao = await obterInstalacao(AsyncStorage);
    const { data: token } = await push.getExpoPushTokenAsync({ projectId });

    if (controller.signal.aborted) return;

    const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const id = await service.registrar(
        { instalacao, token, plataforma: plataforma, fuso },
        controller.signal
    );

    if (!controller.signal.aborted) await AsyncStorage.setItem(chaveDispositivo, id);
}
