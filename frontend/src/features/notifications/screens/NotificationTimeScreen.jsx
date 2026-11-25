import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import TimeInput from '../../../shared/components/forms/TimeInput';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { useTheme } from '../../../shared/hooks/useTheme';
import FormLayout from '../../../shared/layouts/FormLayout';

export function NotificationTimeScreen({ horarioInicial, ocupado, onConfirmar, onVoltar }) {
    const { cores, typography } = useTheme();
    const [horario, definirHorario] = useState(horarioInicial);
    const valido = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horario);
    return (
        <FormLayout
            corFundo={cores.interface.fundo}
            cabecalho={<Header titulo="Horário de Notificação" variante="comVoltar" onVoltar={onVoltar} />}
            acoes={
                <ButtonScreen texto="Confirmar horários" desativado={!valido || ocupado}
                    carregando={ocupado} aoPressionar={() => onConfirmar(horario)} />
            }
        >
            <Text style={[typography.bodyDefault, estilos.descricao, { color: cores.interface.textoSecundario }]}>
                Defina o horário em que você deseja receber esta notificação.
            </Text>
            <TimeInput valor={horario} onChangeText={definirHorario} desativado={ocupado}
                estiloCampo={estilos.campo} />
        </FormLayout>
    );
}

const estilos = StyleSheet.create({
    descricao: { marginBottom: 20 },
    campo: { minHeight: 56, paddingLeft: 22, gap: 20 }
});
