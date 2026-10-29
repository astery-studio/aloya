import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Bell } from 'phosphor-react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos } from './contraceptives.styles';

const rotulos = { leve: 'Leve', moderado: 'Moderado', critico: 'Crítico' };

function ContraceptiveAlert({ intensidade = 'critico' }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    return (
        <View
            style={[estilos.alerta, estilos[`alerta_${intensidade}`]]}
            accessibilityLabel={`Alerta ${rotulos[intensidade] ?? 'Crítico'}`}
        >
            <Bell size={16} color={tema.cores.interface.textoPrincipal} />
            <Text style={estilos.textoAlerta}>{rotulos[intensidade] ?? 'Crítico'}</Text>
        </View>
    );
}

export { ContraceptiveAlert };
