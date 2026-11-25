import { useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationField } from '../../../shared/components/common/NavigationField/NavigationField';
import { SelectionSheet } from '../../../shared/components/feedback/SelectionSheet/SelectionSheet';
import SwitchField from '../../../shared/components/forms/SwitchField/SwitchField';
import { useTheme } from '../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';
import { catalogoNotificacoes } from '../notificationCatalog';
import { estilos } from './notificationSettingsStyles';

const opcoesAntecedencia = [
    { id: 0, label: 'Somente no dia' }, { id: 1, label: '1 dia antes' },
    ...[2, 3, 4, 5].map((id) => ({ id, label: `${id} dias antes` }))
];

export function NotificationIndividualSettingsScreen({
    categoriaId, valores, ocupado, onAlterar, onAbrirHorario, onVoltar
}) {
    const { cores, escuro } = useTheme();
    const { titulo, grupos } = catalogoNotificacoes[categoriaId];
    const [antecedenciaAberta, definirAntecedenciaAberta] = useState(false);
    return (
        <SettingsLayout titulo={titulo} onVoltar={onVoltar} respeitarEntalhe>
            <View style={estilos.lista}>
                {Object.entries(grupos).map(([grupoId, [nome, linhas]]) => (
                    <View key={grupoId} style={estilos.secao}>
                        <Text accessibilityRole="header"
                            style={[estilos.titulo, { color: cores.interface.textoSecundario }]}>{nome}</Text>
                        {linhas.map(([id, label, tipo]) => {
                            if (tipo === 'horario' || tipo === 'antecedencia') {
                                return <NavigationField key={id} label={label} desabilitado={ocupado}
                                    onPress={tipo === 'horario' ? onAbrirHorario
                                        : () => definirAntecedenciaAberta(true)} />;
                            }
                            const chave = tipo === 'legado' ? id : `${categoriaId}.${grupoId}.${id}`;
                            return (
                                <SwitchField key={chave} titulo={label} ativo={valores[chave]}
                                    aoAlterar={(ativo) => onAlterar(chave, ativo)}
                                    desabilitado={ocupado} estilo={estilos.campo}
                                    estiloTitulo={estilos.rotulo} />
                            );
                        })}
                    </View>
                ))}
            </View>
            <SelectionSheet
                visivel={antecedenciaAberta}
                titulo="Antecedência de Notificação"
                opcoes={opcoesAntecedencia}
                valorSelecionado={valores.antecedenciaProximoCiclo}
                estiloOpcaoSelecionada={escuro ? undefined : { backgroundColor: '#F0F5F2' }}
                onFechar={() => definirAntecedenciaAberta(false)}
                onSelecionar={ocupado ? undefined : (id) => {
                    definirAntecedenciaAberta(false);
                    onAlterar('antecedenciaProximoCiclo', id);
                }}
            />
        </SettingsLayout>
    );
}
