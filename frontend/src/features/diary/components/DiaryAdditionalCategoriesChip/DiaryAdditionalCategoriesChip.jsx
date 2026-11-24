import { Text, View } from 'react-native';
import { PlusCircleIcon } from 'phosphor-react-native/src/icons/PlusCircle';

import { obterCoresDiario } from '../../config/diaryColors';

function DiaryAdditionalCategoriesChip({ quantidade, estilos, tema }) {
    const cores = obterCoresDiario(tema).interface;
    return (
        <View
            accessible
            accessibilityLabel={`${quantidade} outras categorias marcadas`}
            style={estilos.chip}
        >
            <View testID="diary-entry-chip-icon" style={estilos.iconeChip}>
                <PlusCircleIcon accessible={false} size={10.89} color={cores.textoPrincipal} />
            </View>
            <Text style={estilos.textoChip}>{quantidade}</Text>
        </View>
    );
}

export { DiaryAdditionalCategoriesChip };
