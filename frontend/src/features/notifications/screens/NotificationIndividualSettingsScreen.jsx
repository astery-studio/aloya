import { useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Text, View } from 'react-native';
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
    categoriaId, categoria = catalogoNotificacoes[categoriaId],
    valores, ocupado, onAlterar, onAbrirHorario, onVoltar
}) {
    const { cores, escuro } = useTheme();
    const { titulo, grupos } = categoria;
    const [antecedenciaAberta, definirAntecedenciaAberta] = useState(false);
    const botaoAntecedencia = useRef(null);
    const diasSelecionados = useRef(null);

    function aoOcultarAntecedencia() {
        const identificador = findNodeHandle(botaoAntecedencia.current);
        if (identificador) AccessibilityInfo.setAccessibilityFocus(identificador);
        const dias = diasSelecionados.current;
        diasSelecionados.current = null;
        if (dias !== null) onAlterar('antecedenciaProximoCiclo', dias);
    }
    return (
        <SettingsLayout titulo={titulo} onVoltar={onVoltar} respeitarEntalhe>
            <View style={estilos.lista}>
                {Object.entries(grupos).map(([grupoId, [nome, linhas]]) => (
                    <View key={grupoId} style={estilos.secao}>
                        <Text accessibilityRole="header"
                            style={[estilos.titulo, { color: cores.interface.textoSecundario }]}>{nome}</Text>
                        {valores[`${categoriaId}.${grupoId}`] === false && (
                            <Text style={{ color: cores.interface.textoSecundario }}>
                                Grupo desligado. Suas escolhas individuais estão preservadas.
                            </Text>
                        )}
                        {linhas.map(([id, label, tipo]) => {
                            if (tipo === 'horario' || tipo === 'antecedencia') {
                                return <NavigationField key={id} label={label} labelSemLimite desabilitado={ocupado}
                                    referencia={tipo === 'antecedencia' ? botaoAntecedencia : undefined}
                                    onPress={tipo === 'horario' ? onAbrirHorario
                                        : () => definirAntecedenciaAberta(true)} />;
                            }
                            const chave = tipo === 'legado' ? id : `${categoriaId}.${grupoId}.${id}`;
                            return (
                                <SwitchField key={chave} titulo={label} ativo={valores[chave]}
                                    tituloSemLimite dicaAcessibilidade="Ativa ou desativa esta notificação"
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
                onOcultar={aoOcultarAntecedencia}
                focarTituloAoAbrir
                onSelecionar={ocupado ? undefined : (id) => {
                    if (diasSelecionados.current !== null) return;
                    diasSelecionados.current = id;
                    definirAntecedenciaAberta(false);
                }}
            />
        </SettingsLayout>
    );
}
