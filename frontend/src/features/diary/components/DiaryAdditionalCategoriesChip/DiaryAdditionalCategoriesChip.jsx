import { Text, View } from 'react-native';
import { PlusCircleIcon } from 'phosphor-react-native/src/icons/PlusCircle';

function DiaryAdditionalCategoriesChip({ quantidade, estilos, tema }) {
    return (
        <View
            accessible
            accessibilityLabel={`${quantidade} outras categorias marcadas`}
            style={estilos.chip}
        >
            <PlusCircleIcon
                accessible={false}
                size={10.89}
                color={tema.cores.interface.textoPrincipal}
            />
            <Text style={estilos.textoChip}>+ {quantidade}</Text>
        </View>
    );
}

export { DiaryAdditionalCategoriesChip };
