import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import { configurarApresentacaoNativa } from './nativeNotificationPresentation';
import { criarSincronizacaoPush } from './nativePushRegistration';
import { criarAberturaPush } from './nativePushNavigation';

export function useNativePush({ ativo, service, navegar }) {
    useEffect(() => {
        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

        if (
            !ativo ||
            !service ||
            !projectId ||
            Constants.executionEnvironment === 'storeClient' ||
            !['android', 'ios'].includes(Platform.OS)
        )
            return undefined;

        const controller = new AbortController();
        const assinaturas = [];

        async function iniciar() {
            const [push, { default: AsyncStorage }] = await Promise.all([
                import('expo-notifications'),
                import('@react-native-async-storage/async-storage')
            ]);

            if (controller.signal.aborted) return;

            configurarApresentacaoNativa(push, Platform.OS);

            const sincronizar = criarSincronizacaoPush({
                push,
                AsyncStorage,
                service,
                controller,
                projectId,
                plataforma: Platform.OS
            });
            const abrir = criarAberturaPush({ push, service, controller, navegar });

            assinaturas.push(
                push.addPushTokenListener(() => {
                    void sincronizar();
                }),
                push.addNotificationResponseReceivedListener((resposta) => {
                    void abrir(resposta).catch(() => {});
                }),
                AppState.addEventListener('change', (estado) => {
                    if (estado === 'active') {
                        void sincronizar();
                        void push
                            .getLastNotificationResponseAsync()
                            .then(abrir)
                            .catch(() => {});
                    }
                })
            );

            void sincronizar(true);
            await abrir(await push.getLastNotificationResponseAsync());
        }

        void iniciar().catch(() => {});

        return () => {
            controller.abort();
            assinaturas.forEach((assinatura) => assinatura.remove());
        };
    }, [ativo, service, navegar]);
}
