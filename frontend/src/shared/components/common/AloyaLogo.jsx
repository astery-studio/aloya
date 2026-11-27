import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const logoClara = require('../../../../assets/aloya-logo-completa.png');
const logoEscura = require('../../../../assets/aloya-logo-completa-escura.png');

export default function AloyaLogo({ style }) {
    const tema = useTheme();

    return (
        <View style={style}>
            <Image
                accessible
                accessibilityLabel="Aloya"
                resizeMode="contain"
                source={tema.escuro ? logoEscura : logoClara}
                style={estilos.imagem}
            />
        </View>
    );
}

const estilos = StyleSheet.create({
    imagem: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }
});
