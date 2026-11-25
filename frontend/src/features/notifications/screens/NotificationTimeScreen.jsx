import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import TimeInput from '../../../shared/components/forms/TimeInput';
import { useTheme } from '../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';

export function NotificationTimeScreen({ horarioInicial, ocupado, onConfirmar, onVoltar }) {
    const { cores, typography } = useTheme();
    const [horario, definirHorario] = useState(horarioInicial);
    const valido = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horario);
    return (
        <SettingsLayout
            titulo="Horário de Notificação"
            onVoltar={onVoltar}
            respeitarEntalhe
            rodapeFixo
            estiloRodapeFixo={estilos.rodape}
            rodape={
                <ButtonScreen texto="Confirmar horários" desativado={!valido || ocupado}
                    carregando={ocupado} aoPressionar={() => onConfirmar(horario)} />
            }
        >
            <Text style={[typography.bodyDefault, estilos.descricao, { color: cores.interface.textoSecundario }]}>
                Defina o horário em que você deseja receber esta notificação.
            </Text>
            <TimeInput valor={horario} onChangeText={definirHorario} desativado={ocupado}
                estiloCampo={estilos.campo} />
        </SettingsLayout>
    );
}

const estilos = StyleSheet.create({
    descricao: { marginBottom: 20 },
    campo: { minHeight: 56, paddingLeft: 22, gap: 20 },
    rodape: { borderTopWidth: 0, paddingBottom: 16 }
});
