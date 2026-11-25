import { StyleSheet, Text, View } from 'react-native';
import { TargetIcon } from 'phosphor-react-native/src/icons/Target';
import { NavigationField } from '../../../shared/components/common/NavigationField/NavigationField';
import { PillIcon, UsersThreeIcon } from '../../../shared/components/icons/AppIcons';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { useTheme } from '../../../shared/hooks/useTheme';
import FormLayout from '../../../shared/layouts/FormLayout';

const categorias = [
    { id: 'ciclo', label: 'Ciclo e Previsões', icone: TargetIcon, paleta: 'corLaranja' },
    { id: 'anticoncepcional', label: 'Anticoncepcional', icone: PillIcon, paleta: 'corVerde' },
    { id: 'redeApoio', label: 'Rede de Apoio', icone: UsersThreeIcon, paleta: 'corAzul' }
];

export function NotificationsScreen({ onAbrirCategoria, onVoltar }) {
    const { cores, typography } = useTheme();
    return (
        <FormLayout
            corFundo={cores.interface.fundo}
            cabecalho={<Header titulo="Notificações" variante="comVoltar" onVoltar={onVoltar} />}
        >
            <Text style={[typography.bodyDefault, { color: cores.interface.textoSecundario }]}>
                {'Fique por dentro do que importa! Personalize suas notificações e escolha quais lembretes, atualizações e avisos deseja receber.'}
            </Text>
            <View style={estilos.lista}>
                <Text
                    accessibilityRole="header"
                    style={[typography.bodyDefault, { color: cores.interface.textoSecundario }]}
                >
                    Tipo de Notificações
                </Text>
                {categorias.map(({ id, ...campo }) => (
                    <NavigationField key={id} {...campo} onPress={() => onAbrirCategoria(id)} />
                ))}
            </View>
        </FormLayout>
    );
}

const estilos = StyleSheet.create({
    lista: { gap: 8, marginTop: 20 }
});
