import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './DiaryCategoryField.styles';

function DiaryCategoryField({ categoria, paleta = 'ciclo', children }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const cores = tema.cores.redeApoio[paleta] ?? tema.cores.redeApoio.ciclo;
    return (
        <View style={estilos.container}>
            <View style={[estilos.faixaTitulo, { backgroundColor: cores.fundoExpandido }]}>
                <Text accessibilityRole="header" style={[estilos.titulo, { color: cores.icone }]}>
                    {categoria.nome}
                </Text>
            </View>
            {children}
        </View>
    );
}

export { DiaryCategoryField };
