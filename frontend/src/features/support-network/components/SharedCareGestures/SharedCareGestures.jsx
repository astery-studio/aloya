import { PersonIcon } from 'phosphor-react-native/src/icons/Person';
import { ShieldPlusIcon } from 'phosphor-react-native/src/icons/ShieldPlus';
import { Text, View } from 'react-native';
import { HeartIcon, QuestionIcon } from '../../../../shared/components/icons/AppIcons';
import { estilos } from './SharedCareGestures.styles';

const GESTOS = [
    ['Escutar', HeartIcon],
    ['Perguntar', QuestionIcon],
    ['Respeitar', ShieldPlusIcon],
    ['Ajudar', PersonIcon]
];

function SharedCareGestures() {
    return (
        <View style={estilos.secao}>
            <Text style={estilos.rotulo}>Para qualquer momento</Text>
            <Text accessibilityRole="header" style={estilos.titulo}>
                Pequenos gestos, muito cuidado.
            </Text>
            <View style={estilos.grade}>
                {GESTOS.map(([titulo, Icone]) => (
                    <View key={titulo} style={estilos.opcao}>
                        <View style={estilos.caixaIcone}>
                            <Icone size={24} color="#C85A44" />
                        </View>
                        <Text style={estilos.textoOpcao}>{titulo}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export { SharedCareGestures };
