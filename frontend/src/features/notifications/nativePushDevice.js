import { canaisNativos, prepararCanalNativo } from './nativeNotificationPresentation';

const chaveInstalacao = 'aloya.push.instalacao';
const chaveDispositivo = 'aloya.push.dispositivo';
const intervaloRenovacao = 15 * 60_000;

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
    { solicitar, tokenNativo, anterior }
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
        return undefined;
    }

    const instalacao = await obterInstalacao(AsyncStorage);
    // Obter o token nativo novamente dentro do listener pode dispará-lo em sequência.
    const { data: token } = await push.getExpoPushTokenAsync({
        projectId,
        ...(tokenNativo ? { devicePushToken: tokenNativo } : {})
    });

    if (controller.signal.aborted) return;

    const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dados = { instalacao, token, plataforma, fuso };
    if (
        anterior &&
        Date.now() - anterior.registradoEm < intervaloRenovacao &&
        Object.entries(dados).every(([chave, valor]) => anterior.dados[chave] === valor)
    ) return anterior;

    const id = await service.registrar(dados, controller.signal);
    if (!controller.signal.aborted) await AsyncStorage.setItem(chaveDispositivo, id);
    return { dados, registradoEm: Date.now() };
}
