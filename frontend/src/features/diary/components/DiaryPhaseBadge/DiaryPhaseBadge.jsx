import { Text, View } from 'react-native';

import { obterApresentacaoFase } from '../../utils/diaryPhasePresentation';
import { estilos } from './DiaryPhaseBadge.styles';

function DiaryPhaseBadge({ fase, carregando }) {
    const apresentacao = obterApresentacaoFase(fase);

    if (!apresentacao) {
        if (!carregando) return null;
        return (
            <View style={[estilos.chip, { backgroundColor: '#F4F2ED' }]}>
                <Text style={[estilos.texto, { color: '#5C5C59' }]}>Identificando fase...</Text>
            </View>
        );
    }

    const { Icone, cor, fundo, rotulo } = apresentacao;
    return (
        <View accessibilityLabel={rotulo} style={[estilos.chip, { backgroundColor: fundo }]}>
            <Icone size={14} color={cor} weight={fase === 'menstruacao' ? 'fill' : 'regular'} />
            <Text style={[estilos.texto, { color: cor }]}>{rotulo}</Text>
        </View>
    );
}

export { DiaryPhaseBadge };
