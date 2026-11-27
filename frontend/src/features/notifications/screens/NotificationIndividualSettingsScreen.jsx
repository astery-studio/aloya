import { Text, View } from 'react-native';
import SwitchField from '../../../shared/components/forms/SwitchField/SwitchField';
import { useTheme } from '../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';
import { estilos } from './notificationSettingsStyles';

export function NotificationIndividualSettingsScreen({ categoria, valores, ocupado, onAlterar, onVoltar }) {
    const { cores } = useTheme();
    const { titulo, grupos } = categoria;

    return (
        <SettingsLayout titulo={titulo} onVoltar={onVoltar} respeitarEntalhe>
            <View style={estilos.lista}>
                {Object.entries(grupos).map(([grupoId, [nome, linhas]]) => {
                    const grupo = `redeApoio.${grupoId}`;
                    return (
                        <View key={grupoId} style={estilos.secao}>
                            <Text
                                accessibilityRole="header"
                                style={[estilos.titulo, { color: cores.interface.textoSecundario }]}
                            >
                                {nome}
                            </Text>
                            {linhas.map(([id, label]) => {
                                const chave = `${grupo}.${id}`;
                                const ativo = valores.efetivas?.[chave]
                                    ?? (valores[grupo] !== false && valores[chave] === true);
                                return (
                                    <SwitchField
                                        key={chave}
                                        titulo={label}
                                        ativo={ativo}
                                        tituloSemLimite
                                        dicaAcessibilidade="Ativa ou desativa esta notificação"
                                        aoAlterar={(valor) => onAlterar(chave, valor)}
                                        desabilitado={ocupado}
                                        estilo={estilos.campo}
                                        estiloTitulo={estilos.rotulo}
                                    />
                                );
                            })}
                        </View>
                    );
                })}
            </View>
        </SettingsLayout>
    );
}
