export const canaisNativos = {
    ciclo: 'Ciclo e Previsões',
    anticoncepcional: 'Anticoncepcional',
    'rede-apoio': 'Rede de Apoio',
    seguranca: 'Segurança e Conta'
};

export function prepararCanalNativo(sdk, canal) {
    return sdk.setNotificationChannelAsync(canal, {
        name: canaisNativos[canal],
        importance: sdk.AndroidImportance.HIGH,
        lockscreenVisibility: sdk.AndroidNotificationVisibility.PRIVATE
    });
}

export function configurarApresentacaoNativa(sdk, plataforma) {
    sdk.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: plataforma === 'android',
            shouldSetBadge: false
        })
    });
}
