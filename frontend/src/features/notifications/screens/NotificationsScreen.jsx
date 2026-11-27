import { StyleSheet, Text, View } from 'react-native';
import { NavigationField } from '../../../shared/components/common/NavigationField/NavigationField';
import { UsersThreeIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';

export function NotificationsScreen({ onAbrirCategoria, onVoltar }) {
    const { cores, typography } = useTheme();
    const estiloTexto = [typography.bodyDefault, { color: cores.interface.textoSecundario }];

    return (
        <SettingsLayout titulo="Notificações" onVoltar={onVoltar} respeitarEntalhe>
            <Text style={estiloTexto}>
                Escolha os avisos que quer receber como contato da Rede de Apoio. Os controles
                disponíveis dependem das permissões que você recebeu.
            </Text>
            <View style={estilos.lista}>
                <Text accessibilityRole="header" style={estiloTexto}>Tipo de Notificações</Text>
                <NavigationField
                    label="Rede de Apoio"
                    icone={UsersThreeIcon}
                    paleta="corAzul"
                    labelSemLimite
                    onPress={onAbrirCategoria}
                />
            </View>
        </SettingsLayout>
    );
}

const estilos = StyleSheet.create({
    lista: { gap: 8, marginTop: 20 }
});
