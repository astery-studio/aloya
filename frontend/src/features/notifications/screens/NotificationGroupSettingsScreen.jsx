import { Text, View } from 'react-native';
import { NavigationField } from '../../../shared/components/common/NavigationField/NavigationField';
import SwitchField from '../../../shared/components/forms/SwitchField/SwitchField';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { useTheme } from '../../../shared/hooks/useTheme';
import FormLayout from '../../../shared/layouts/FormLayout';
import { catalogoNotificacoes } from '../notificationCatalog';
import { estilos } from './notificationSettingsStyles';

export function NotificationGroupSettingsScreen({
    categoriaId, valores, ocupado, onAlterar, onAbrirIndividual, onVoltar
}) {
    const { cores } = useTheme();
    const { titulo, grupos, ordemGrupo = Object.keys(grupos) } = catalogoNotificacoes[categoriaId];
    const estiloTitulo = [estilos.titulo, { color: cores.interface.textoSecundario }];
    return (
        <FormLayout corFundo={cores.interface.fundo}
            cabecalho={<Header titulo={titulo} variante="comVoltar" onVoltar={onVoltar} />}>
            <View style={estilos.lista}>
                <View style={estilos.secao}>
                    <Text accessibilityRole="header" style={estiloTitulo}>Configuração em grupo</Text>
                    {ordemGrupo.map((grupoId) => {
                        const chave = `${categoriaId}.${grupoId}`;
                        return (
                            <SwitchField
                                key={chave}
                                titulo={grupos[grupoId][0]}
                                ativo={valores[chave] ?? true}
                                desabilitado={ocupado}
                                aoAlterar={(ativo) => onAlterar(chave, ativo)}
                                estilo={estilos.campo}
                                estiloTitulo={estilos.rotulo}
                            />
                        );
                    })}
                </View>
                <View style={estilos.secao}>
                    <Text accessibilityRole="header" style={estiloTitulo}>Configuração individual</Text>
                    <NavigationField label="Personalizar notificações" onPress={onAbrirIndividual} />
                </View>
            </View>
        </FormLayout>
    );
}
