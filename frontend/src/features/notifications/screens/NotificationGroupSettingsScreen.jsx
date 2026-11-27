import { Text, View } from 'react-native';
import { NavigationField } from '../../../shared/components/common/NavigationField/NavigationField';
import SwitchField from '../../../shared/components/forms/SwitchField/SwitchField';
import { useTheme } from '../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';
import { catalogoNotificacoes } from '../notificationCatalog';
import { estilos } from './notificationSettingsStyles';

export function NotificationGroupSettingsScreen({
    categoriaId, categoria = catalogoNotificacoes[categoriaId],
    valores, ocupado, onAlterar, onAbrirIndividual, onVoltar
}) {
    const { cores } = useTheme();
    const { titulo, grupos, ordemGrupo = Object.keys(grupos) } = categoria;
    const estiloTitulo = [estilos.titulo, { color: cores.interface.textoSecundario }];
    return (
        <SettingsLayout titulo={titulo} onVoltar={onVoltar} respeitarEntalhe>
            <View style={estilos.lista}>
                <View style={estilos.secao}>
                    <Text accessibilityRole="header" style={estiloTitulo}>Configuração em grupo</Text>
                    {ordemGrupo.map((grupoId) => {
                        const chave = `${categoriaId}.${grupoId}`;
                        return (
                            <SwitchField
                                key={chave}
                                titulo={grupos[grupoId][0]}
                                tituloSemLimite
                                dicaAcessibilidade="Ativa ou desativa as notificações deste grupo"
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
                    <NavigationField label="Personalizar notificações" labelSemLimite onPress={onAbrirIndividual} />
                </View>
            </View>
        </SettingsLayout>
    );
}
