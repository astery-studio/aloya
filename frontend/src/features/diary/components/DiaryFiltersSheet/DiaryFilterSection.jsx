import { Text, View } from 'react-native';

function DiaryFilterSection({ titulo, descricao, children, estilos }) {
    return (
        <View style={estilos.secao}>
            <Text style={estilos.tituloSecao}>{titulo}</Text>
            <Text style={estilos.descricaoSecao}>{descricao}</Text>
            {children}
        </View>
    );
}

export { DiaryFilterSection };
