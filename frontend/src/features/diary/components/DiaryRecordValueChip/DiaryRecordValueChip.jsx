import { Text, View } from 'react-native';

import { obterApresentacaoOpcao } from '../../config/diaryOptionPresentation';
import { DiaryOptionIcon } from '../DiaryOptionIcon/DiaryOptionIcon';

function DiaryRecordValueChip({ categoriaId, opcao, rotulo, estilos, cores }) {
    const apresentacao = opcao ? obterApresentacaoOpcao(categoriaId, opcao) : null;
    const texto = opcao?.nome ?? rotulo;
    if (typeof texto !== 'string' || !texto.trim()) return null;

    return (
        <View style={[estilos.chip, { backgroundColor: cores.fundo }]}>
            {apresentacao ? (
                <DiaryOptionIcon
                    iconeId={apresentacao.iconeId}
                    tamanho={10.89}
                    cor={apresentacao.iconeProps?.color ?? cores.texto}
                    weight={apresentacao.iconeProps?.weight}
                />
            ) : null}
            <Text style={[estilos.textoChip, { color: cores.texto }]}>{texto.trim()}</Text>
        </View>
    );
}

export { DiaryRecordValueChip };
