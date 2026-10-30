import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Clock } from 'phosphor-react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos } from './contraceptives.styles';

function ScheduleList({ horarios = [] }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    if (!horarios.length) return <Text style={estilos.textoSecundario}>Sem horário fixo</Text>;
    return (
        <View style={estilos.horarios}>
            {horarios.map((horario) => (
                <View key={horario} style={estilos.horario}>
                    <Clock size={16} color={tema.cores.interface.destaque} />
                    <Text style={estilos.textoHorario}>{horario}</Text>
                </View>
            ))}
        </View>
    );
}

export { ScheduleList };
