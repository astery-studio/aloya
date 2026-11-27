import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import {
    NotificationPreferencesLoading,
    NotificationSaveError
} from './components/NotificationPreferencesFeedback';
import { categoriaNotificacoesContato } from './notificationCatalog';
import { NotificationGroupSettingsScreen } from './screens/NotificationGroupSettingsScreen';
import { NotificationIndividualSettingsScreen } from './screens/NotificationIndividualSettingsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { useNotificationPreferences } from './useNotificationPreferences';

export function NotificationPreferencesFlow({ service, onVoltar, onSessaoExpirada }) {
    const [pagina, definirPagina] = useState('categorias');
    const { valores, erroLeitura, erroGravacao, salvando, salvar, recarregar, descartarFalha } =
        useNotificationPreferences(service, { atualizarAoRetomar: pagina !== 'categorias' });

    const voltar = useCallback(() => {
        if (salvando) return;
        if (pagina === 'individual') definirPagina('grupo');
        else if (pagina === 'grupo') definirPagina('categorias');
        else onVoltar();
    }, [onVoltar, pagina, salvando]);

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

    if (pagina === 'categorias')
        return (
            <NotificationsScreen
                onAbrirCategoria={() => {
                    recarregar();
                    definirPagina('grupo');
                }}
                onVoltar={voltar}
            />
        );

    const categoria = categoriaNotificacoesContato(valores?.chavesDisponiveis);
    if (!valores)
        return (
            <NotificationPreferencesLoading
                titulo={categoria.titulo}
                erro={erroLeitura}
                onVoltar={voltar}
                onRecarregar={recarregar}
            />
        );

    const props = {
        categoria,
        valores,
        ocupado: salvando,
        onAlterar: (chave, valor) => salvar({ chave, valor }),
        onVoltar: voltar
    };

    return (
        <>
            {pagina === 'individual' ? (
                <NotificationIndividualSettingsScreen {...props} />
            ) : (
                <NotificationGroupSettingsScreen
                    {...props}
                    onAbrirIndividual={() => {
                        recarregar();
                        definirPagina('individual');
                    }}
                />
            )}
            <NotificationSaveError
                visivel={Boolean(erroGravacao) && !sessaoExpirada}
                salvando={salvando}
                limiteAtingido={erroGravacao?.status === 429}
                onVoltar={descartarFalha}
                onTentar={() => salvar(erroGravacao.alteracao)}
            />
        </>
    );
}
