import { ActivityIndicator, Text } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';

export function NotificationPreferencesLoading({ titulo, erro, onVoltar, onRecarregar }) {
    const { cores } = useTheme();
    return (
        <SettingsLayout titulo={titulo} onVoltar={onVoltar} respeitarEntalhe>
            {erro ? (
                <>
                    <Text accessibilityRole="alert" style={{ color: cores.interface.textoPrincipal }}>
                        Não foi possível carregar as preferências de notificação.
                    </Text>
                    <ButtonScreen texto="Tentar novamente" aoPressionar={onRecarregar} />
                </>
            ) : <ActivityIndicator accessibilityLabel="Carregando preferências" />}
        </SettingsLayout>
    );
}

export function NotificationSaveError({ visivel, salvando, onTentar, onVoltar }) {
    return (
        <SimpleModal erroInterno visivel={visivel} aoFechar={onVoltar}
            icone={WarningCircleIcon} titulo="Algo deu errado"
            mensagem="Ocorreu um erro ao salvar. Verifique sua conexão e tente novamente."
            acaoPrincipal={{ texto: 'Tentar novamente', carregando: salvando, aoPressionar: onTentar }}
            acaoSecundaria={{ texto: 'Voltar', desativado: salvando, aoPressionar: onVoltar }} />
    );
}
