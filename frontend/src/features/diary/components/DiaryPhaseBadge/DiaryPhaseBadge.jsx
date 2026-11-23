import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterApresentacaoFase } from '../../utils/diaryPhasePresentation';
import { criarEstilos } from './DiaryPhaseBadge.styles';

function DiaryPhaseBadge({
    fase,
    carregando,
    estilo,
    estiloTexto,
    tamanhoIcone = 14,
    larguraIcone,
    alturaIcone,
    cor: corPersonalizada,
    fundo: fundoPersonalizado
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const apresentacao = obterApresentacaoFase(fase, tema);

    if (!apresentacao) {
        if (!carregando) return null;
        return (
            <View style={[estilos.chip, estilos.carregando, estilo]}>
                <Text style={[estilos.texto, estilos.textoCarregando, estiloTexto]}>
                    Identificando fase...
                </Text>
            </View>
        );
    }

    const { Icone, cor: corPadrao, fundo: fundoPadrao, rotulo } = apresentacao;
    const cor = corPersonalizada ?? corPadrao;
    const fundo = fundoPersonalizado ?? fundoPadrao;
    return (
        <View
            accessibilityLabel={rotulo}
            style={[estilos.chip, { backgroundColor: fundo }, estilo]}
        >
            <Icone
                size={tamanhoIcone}
                width={larguraIcone ?? tamanhoIcone}
                height={alturaIcone ?? tamanhoIcone}
                color={cor}
                weight={fase === 'menstruacao' || fase === 'menstrual' ? 'fill' : 'regular'}
            />
            <Text style={[estilos.texto, { color: cor }, estiloTexto]}>{rotulo}</Text>
        </View>
    );
}

export { DiaryPhaseBadge };
