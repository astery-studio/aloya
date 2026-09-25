import { Text, View } from 'react-native';
import { Clock } from 'phosphor-react-native';
import { cores } from '../../../theme';
import { estilos } from './contraceptives.styles';

function ScheduleList({ horarios = [] }) {
    if (!horarios.length) return <Text style={estilos.textoSecundario}>Sem horário fixo</Text>;
    return (
        <View style={estilos.horarios}>
            {horarios.map((horario) => (
                <View key={horario} style={estilos.horario}><Clock size={16} color={cores.marca.secundaria} /><Text style={estilos.textoHorario}>{horario}</Text></View>
            ))}
        </View>
    );
}

export { ScheduleList };
