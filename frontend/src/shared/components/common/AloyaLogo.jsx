import { Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const logoClara = require('../../../../assets/aloya-logo-completa.png');
const logoEscura = require('../../../../assets/aloya-logo-completa-escura.png');

export default function AloyaLogo({ style }) {
    const tema = useTheme();

    return (
        <Image
            accessible
            accessibilityLabel="Aloya"
            resizeMode="contain"
            source={tema.escuro ? logoEscura : logoClara}
            style={style}
        />
    );
}
