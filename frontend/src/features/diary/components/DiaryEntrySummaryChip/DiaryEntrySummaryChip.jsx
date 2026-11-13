import { Text, View } from 'react-native';

import {
    obterApresentacaoMacrocategoria,
    obterCorMacrocategoria
} from '../../config/diaryMacroPresentation';

function DiaryEntrySummaryChip({ principal, estilos, tema }) {
    const macro = obterApresentacaoMacrocategoria(principal.macrocategoriaId);
    const cor = obterCorMacrocategoria(tema, principal.macrocategoriaId);
    const IconeMacro = macro.icone;

    return (
        <View style={estilos.chip}>
            <IconeMacro
                accessible={false}
                size={10.89}
                color={cor}
                weight={macro.iconeProps?.weight ?? 'regular'}
            />
            <Text style={estilos.textoChip}>{principal.valor.trim()}</Text>
        </View>
    );
}

export { DiaryEntrySummaryChip };
