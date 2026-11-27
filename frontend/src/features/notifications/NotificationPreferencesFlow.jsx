import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import {
    NotificationPreferencesLoading,
    NotificationSaveError
} from './components/NotificationPreferencesFeedback';
import { catalogoNotificacoes } from './notificationCatalog';
import { NotificationGroupSettingsScreen } from './screens/NotificationGroupSettingsScreen';
import { NotificationIndividualSettingsScreen } from './screens/NotificationIndividualSettingsScreen';
import { NotificationPreviewScreen } from './screens/NotificationPreviewScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { NotificationTimeScreen } from './screens/NotificationTimeScreen';
import { useNotificationPreferences } from './useNotificationPreferences';

export function NotificationPreferencesFlow({ service, onVoltar, onSessaoExpirada }) {
    const [categoriaId, definirCategoria] = useState(null);
    const [pagina, definirPagina] = useState('grupo');

    const { valores, erroLeitura, erroGravacao, salvando, salvar, recarregar, descartarFalha } =
        useNotificationPreferences(service);

    const voltar = useCallback(() => {
        if (salvando) return;
        if (pagina === 'teste') definirPagina('grupo');
        else if (!categoriaId) onVoltar();
        else if (pagina === 'horario') definirPagina('individual');
        else if (pagina === 'individual') definirPagina('grupo');
        else definirCategoria(null);
    }, [categoriaId, onVoltar, pagina, salvando]);

    useEffect(() => {
        const inscricao = BackHandler.addEventListener('hardwareBackPress', () => {
            voltar();
            return true;
        });

        return () => inscricao.remove();
    }, [voltar]);

    const sessaoExpirada = erroLeitura?.status === 401 || erroGravacao?.status === 401;

    useEffect(() => {
        if (sessaoExpirada) onSessaoExpirada?.();
    }, [sessaoExpirada, onSessaoExpirada]);

    async function alterar(chave, valor) {
        if ((await salvar({ chave, valor })) && chave === 'horarioLembreteDiario') {
            definirPagina('individual');
        }
    }

    if (__DEV__ && pagina === 'teste') return <NotificationPreviewScreen onVoltar={voltar} />;

    if (!categoriaId)
        return (
            <NotificationsScreen
                onAbrirCategoria={definirCategoria}
                onAbrirTeste={__DEV__ ? () => definirPagina('teste') : undefined}
                onVoltar={voltar}
            />
        );

    if (!valores)
        return (
            <NotificationPreferencesLoading
                titulo={catalogoNotificacoes[categoriaId].titulo}
                erro={erroLeitura}
                onVoltar={voltar}
                onRecarregar={recarregar}
            />
        );

    const props = { categoriaId, valores, ocupado: salvando, onAlterar: alterar, onVoltar: voltar };

    return (
        <>
            {pagina === 'horario' ? (
                <NotificationTimeScreen
                    horarioInicial={valores.horarioLembreteDiario}
                    ocupado={salvando}
                    onVoltar={voltar}
                    onConfirmar={(hora) => alterar('horarioLembreteDiario', hora)}
                />
            ) : pagina === 'individual' ? (
                <NotificationIndividualSettingsScreen
                    {...props}
                    onAbrirHorario={() => definirPagina('horario')}
                />
            ) : (
                <NotificationGroupSettingsScreen
                    {...props}
                    onAbrirIndividual={() => definirPagina('individual')}
                />
            )}

            <NotificationSaveError
                visivel={Boolean(erroGravacao) && !sessaoExpirada}
                salvando={salvando}
                onVoltar={descartarFalha}
                onTentar={() => {
                    const { chave, valor } = erroGravacao.alteracao;
                    return alterar(chave, valor);
                }}
            />
        </>
    );
}
