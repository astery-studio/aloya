import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import {
    NotificationPreferencesLoading,
    NotificationSaveError
} from './components/NotificationPreferencesFeedback';
import { catalogoNotificacoes, categoriaNotificacoesContato } from './notificationCatalog';
import { NotificationGroupSettingsScreen } from './screens/NotificationGroupSettingsScreen';
import { NotificationIndividualSettingsScreen } from './screens/NotificationIndividualSettingsScreen';
import { NotificationPreviewScreen } from './screens/NotificationPreviewScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { NotificationTimeScreen } from './screens/NotificationTimeScreen';
import { useNotificationPreferences } from './useNotificationPreferences';

export function NotificationPreferencesFlow({
    service,
    contato = false,
    previaContato = false,
    onAbrirTesteContato,
    onVoltar,
    onSessaoExpirada
}) {
    const [categoriaId, definirCategoria] = useState(previaContato ? 'redeApoio' : null);
    const [pagina, definirPagina] = useState('grupo');

    const { valores, erroLeitura, erroGravacao, salvando, salvar, recarregar, descartarFalha } =
        useNotificationPreferences(service, {
            atualizarAoRetomar: !previaContato && (categoriaId === 'redeApoio' || pagina === 'teste')
        });

    const voltar = useCallback(() => {
        if (salvando) return;
        if (pagina === 'teste') definirPagina('grupo');
        else if (!categoriaId) onVoltar();
        else if (pagina === 'horario') definirPagina('individual');
        else if (pagina === 'individual') definirPagina('grupo');
        else if (previaContato) onVoltar();
        else definirCategoria(null);
    }, [categoriaId, onVoltar, pagina, previaContato, salvando]);

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

    if (__DEV__ && !contato && pagina === 'teste') {
        return valores ? (
            <NotificationPreviewScreen
                efetivas={valores.efetivas}
                buscarPreferencias={service.buscar}
                onVoltar={voltar}
            />
        ) : (
            <NotificationPreferencesLoading
                titulo="Teste de notificações"
                erro={erroLeitura}
                onVoltar={voltar}
                onRecarregar={recarregar}
            />
        );
    }

    if (!categoriaId)
        return (
            <NotificationsScreen
                contato={contato}
                onAbrirCategoria={(id) => {
                    if (id === 'redeApoio') recarregar();
                    definirCategoria(id);
                }}
                onAbrirTeste={__DEV__ && !contato ? () => {
                    recarregar();
                    definirPagina('teste');
                } : undefined}
                onAbrirTesteContato={__DEV__ && !contato ? onAbrirTesteContato : undefined}
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

    const filtrarRedeApoio = categoriaId === 'redeApoio'
        && (contato || Array.isArray(valores.chavesDisponiveis));
    const categoria = filtrarRedeApoio
        ? categoriaNotificacoesContato(valores.chavesDisponiveis)
        : catalogoNotificacoes[categoriaId];
    const props = {
        categoriaId,
        categoria: previaContato ? { ...categoria, titulo: 'Prévia da Rede de Apoio' } : categoria,
        valores,
        ocupado: salvando,
        onAlterar: alterar,
        onVoltar: voltar
    };

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
                    onAbrirIndividual={() => {
                        if (categoriaId === 'redeApoio' && !previaContato) recarregar();
                        definirPagina('individual');
                    }}
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
