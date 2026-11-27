import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { EmptyState } from '../../../shared/components/feedback/EmptyState/EmptyState';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilosErro } from '../../../shared/theme/errorStateStyles';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';

const estilos = StyleSheet.create({
    estado: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' }
});

export function NotificationPreferencesLoading({ titulo, erro, onVoltar, onRecarregar }) {
    const tema = useTheme();
    const estilosErro = useMemo(() => criarEstilosErro(tema), [tema]);

    return (
        <SettingsLayout titulo={titulo} onVoltar={onVoltar} respeitarEntalhe>
            <View accessibilityLiveRegion="polite" style={estilos.estado}>
                {erro ? (
                    <EmptyState
                        variante="erro"
                        titulo="Algo deu errado"
                        mensagem="Não foi possível carregar suas preferências de notificação."
                        acao={
                            <ButtonScreen
                                texto="Tentar novamente"
                                variante="preto"
                                estilo={estilosErro.botao}
                                estiloTexto={estilosErro.textoBotao}
                                aoPressionar={onRecarregar}
                            />
                        }
                    />
                ) : (
                    <ActivityIndicator
                        accessibilityLabel="Carregando preferências"
                        color={tema.cores.interface.destaque}
                    />
                )}
            </View>
        </SettingsLayout>
    );
}

export function NotificationSaveError({ visivel, salvando, onTentar, onVoltar }) {
    return (
        <SimpleModal
            erroInterno
            visivel={visivel}
            aoFechar={onVoltar}
            icone={WarningCircleIcon}
            titulo="Algo deu errado"
            mensagem="Ocorreu um erro ao salvar. Verifique sua conexão e tente novamente."
            acaoPrincipal={{
                texto: 'Tentar novamente',
                carregando: salvando,
                aoPressionar: onTentar
            }}
            acaoSecundaria={{ texto: 'Voltar', desativado: salvando, aoPressionar: onVoltar }}
        />
    );
}
