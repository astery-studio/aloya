import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { ContraceptiveFlow } from '../contraceptives/ContraceptiveFlow';
import { useActiveContraceptives } from '../contraceptives/hooks/useActiveContraceptives';
import {
    NoContraceptivesForNotifications,
    NotificationPreferencesLoading,
    NotificationSaveError
} from './components/NotificationPreferencesFeedback';
import {
    catalogoNotificacoes,
    categoriaNotificacoesAnticoncepcional,
    categoriaNotificacoesContato
} from './notificationCatalog';
import { NotificationGroupSettingsScreen } from './screens/NotificationGroupSettingsScreen';
import { NotificationIndividualSettingsScreen } from './screens/NotificationIndividualSettingsScreen';
import { NotificationPreviewScreen } from './screens/NotificationPreviewScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { NotificationTimeScreen } from './screens/NotificationTimeScreen';
import { useNotificationPreferences } from './useNotificationPreferences';

export function NotificationPreferencesFlow({
    service,
    contraceptiveService,
    contato = false,
    previaContato = false,
    onAbrirTesteContato,
    onVoltar,
    onSessaoExpirada
}) {
    const [categoriaId, definirCategoria] = useState(previaContato ? 'redeApoio' : null);
    const [pagina, definirPagina] = useState('grupo');
    const categoriaAnticoncepcional = categoriaId === 'anticoncepcional';
    const emCadastro = pagina === 'cadastrarAnticoncepcional';
    const {
        metodos,
        falhou: falhaMetodos,
        recarregar: recarregarMetodos
    } = useActiveContraceptives({
        ativo: categoriaAnticoncepcional && !emCadastro,
        service: contraceptiveService,
        onSessaoExpirada,
        atualizarAoRetomar: true
    });

    const { valores, erroLeitura, erroGravacao, salvando, salvar, recarregar, descartarFalha } =
        useNotificationPreferences(service, {
            atualizarAoRetomar: !previaContato && categoriaId === 'redeApoio'
        });

    const voltar = useCallback(() => {
        if (salvando) return;
        if (emCadastro) {
            recarregarMetodos();
            definirPagina('grupo');
        } else if (pagina === 'teste') definirPagina('grupo');
        else if (!categoriaId) onVoltar();
        else if (pagina === 'horario') definirPagina('individual');
        else if (pagina === 'individual') definirPagina('grupo');
        else if (previaContato) onVoltar();
        else definirCategoria(null);
    }, [categoriaId, emCadastro, onVoltar, pagina, previaContato, recarregarMetodos, salvando]);

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

    if (__DEV__ && !contato && pagina === 'teste')
        return <NotificationPreviewScreen onVoltar={voltar} />;

    if (!categoriaId)
        return (
            <NotificationsScreen
                contato={contato}
                onAbrirCategoria={(id) => {
                    if (id === 'redeApoio') recarregar();
                    if (id === 'anticoncepcional') recarregarMetodos();
                    definirCategoria(id);
                }}
                onAbrirTeste={__DEV__ && !contato ? () => definirPagina('teste') : undefined}
                onAbrirTesteContato={__DEV__ && !contato ? onAbrirTesteContato : undefined}
                onVoltar={voltar}
            />
        );

    if (emCadastro)
        return (
            <ContraceptiveFlow
                iniciarCadastro
                service={contraceptiveService}
                onVoltar={voltar}
                onSessaoExpirada={onSessaoExpirada}
            />
        );

    if (categoriaAnticoncepcional && !metodos)
        return (
            <NotificationPreferencesLoading
                titulo="Anticoncepcional"
                erro={falhaMetodos || !contraceptiveService?.listar}
                mensagemErro="Não foi possível carregar seus anticoncepcionais."
                rotuloCarregamento="Carregando anticoncepcionais"
                onVoltar={voltar}
                onRecarregar={recarregarMetodos}
            />
        );

    if (categoriaAnticoncepcional && metodos.length === 0)
        return (
            <NoContraceptivesForNotifications
                onVoltar={voltar}
                onCadastrar={() => definirPagina('cadastrarAnticoncepcional')}
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
    let categoria = catalogoNotificacoes[categoriaId];
    if (filtrarRedeApoio) categoria = categoriaNotificacoesContato(valores.chavesDisponiveis);
    if (categoriaAnticoncepcional) categoria = categoriaNotificacoesAnticoncepcional(metodos);
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
                limiteAtingido={erroGravacao?.status === 429}
                onVoltar={descartarFalha}
                onTentar={() => {
                    const { chave, valor } = erroGravacao.alteracao;
                    return alterar(chave, valor);
                }}
            />
        </>
    );
}
