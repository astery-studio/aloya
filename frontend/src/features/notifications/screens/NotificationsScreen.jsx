import { StyleSheet, Text, View } from 'react-native';
import { TargetIcon } from 'phosphor-react-native/src/icons/Target';
import { NavigationField } from '../../../shared/components/common/NavigationField/NavigationField';
import { PillIcon, UsersThreeIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';

const categorias = [
    { id: 'ciclo', label: 'Ciclo e Previsões', icone: TargetIcon, paleta: 'corLaranja' },
    { id: 'anticoncepcional', label: 'Anticoncepcional', icone: PillIcon, paleta: 'corVerde' },
    { id: 'redeApoio', label: 'Rede de Apoio', icone: UsersThreeIcon, paleta: 'corAzul' }
];

export function NotificationsScreen({
    contato = false,
    onAbrirCategoria,
    onAbrirTeste,
    onAbrirTesteContato,
    onVoltar
}) {
    const { cores, typography } = useTheme();
    const categoriasVisiveis = contato ? categorias.filter(({ id }) => id === 'redeApoio') : categorias;

    return (
        <SettingsLayout titulo="Notificações" onVoltar={onVoltar} respeitarEntalhe>
            <Text style={[typography.bodyDefault, { color: cores.interface.textoSecundario }]}>
                {contato
                    ? 'Escolha os avisos que quer receber como contato da Rede de Apoio. Os controles disponíveis dependem das permissões que você recebeu.'
                    : 'Fique por dentro do que importa! Personalize suas notificações e escolha quais lembretes, atualizações e avisos deseja receber.'}
            </Text>
            <View style={estilos.lista}>
                <Text
                    accessibilityRole="header"
                    style={[typography.bodyDefault, { color: cores.interface.textoSecundario }]}
                >
                    Tipo de Notificações
                </Text>
                {categoriasVisiveis.map(({ id, ...campo }) => (
                    <NavigationField key={id} {...campo} labelSemLimite onPress={() => onAbrirCategoria(id)} />
                ))}
                {onAbrirTeste && (
                    <NavigationField label="Teste de notificações" labelSemLimite onPress={onAbrirTeste} />
                )}
                {onAbrirTesteContato && (
                    <NavigationField
                        label="Teste da tela da Rede de Apoio"
                        labelSemLimite
                        onPress={onAbrirTesteContato}
                    />
                )}
            </View>
        </SettingsLayout>
    );
}

const estilos = StyleSheet.create({
    lista: { gap: 8, marginTop: 20 }
});
