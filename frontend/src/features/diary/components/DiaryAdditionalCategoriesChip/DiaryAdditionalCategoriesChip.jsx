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
            <PlusCircleIcon accessible={false} size={10.89} color={cores.textoPrincipal} />
            <Text style={estilos.textoChip}>+ {quantidade}</Text>
        </View>
    );
}

export { DiaryAdditionalCategoriesChip };
