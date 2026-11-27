import {
    configurarApresentacaoNativa,
    prepararCanalNativo
} from './nativeNotificationPresentation';
import { conteudoDaPrevia } from './notificationPreviewContent';

export { conteudoDaPrevia } from './notificationPreviewContent';
export { listarPreviews } from './notificationPreviewCatalog';

export async function exibirPrevia({ codigo, rotulo, canal, plataforma, sdk }) {
    if (!['android', 'ios'].includes(plataforma)) return 'plataforma';
    if (plataforma === 'android') {
        await prepararCanalNativo(sdk, canal);
    }

    let permissao = await sdk.getPermissionsAsync();
    if (!permissao.granted && permissao.canAskAgain)
        permissao = await sdk.requestPermissionsAsync();
    if (
        !permissao.granted &&
        !(plataforma === 'ios' && permissao.ios?.status === sdk.IosAuthorizationStatus.PROVISIONAL)
    )
        return 'permissao';

    if (plataforma === 'android') {
        const canalNativo = await sdk.getNotificationChannelAsync(canal);
        if (canalNativo?.importance === sdk.AndroidImportance.NONE) return 'canal';
    }

    configurarApresentacaoNativa(sdk, plataforma);
    await sdk.scheduleNotificationAsync({
        content: conteudoDaPrevia(codigo, rotulo),
        trigger: plataforma === 'android' ? { channelId: canal } : null
    });
    return 'solicitada';
}
