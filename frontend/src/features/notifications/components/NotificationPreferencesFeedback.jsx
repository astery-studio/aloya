import { ActivityIndicator, Text } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { useTheme } from '../../../shared/hooks/useTheme';
import FormLayout from '../../../shared/layouts/FormLayout';

export function NotificationPreferencesLoading({ titulo, erro, onVoltar, onRecarregar }) {
    const { cores } = useTheme();
    return (
        <FormLayout corFundo={cores.interface.fundo}
            cabecalho={<Header titulo={titulo} variante="comVoltar" onVoltar={onVoltar} />}>
            {erro ? (
                <>
                    <Text accessibilityRole="alert" style={{ color: cores.interface.textoPrincipal }}>
                        Não foi possível carregar as preferências de notificação.
                    </Text>
                    <ButtonScreen texto="Tentar novamente" aoPressionar={onRecarregar} />
                </>
            ) : <ActivityIndicator accessibilityLabel="Carregando preferências" />}
        </FormLayout>
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
