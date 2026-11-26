import { useState } from 'react';
import { View } from 'react-native';

import { obterApresentacaoFaseRegistro } from '../../utils/diaryPhasePresentation';
import { DiaryEntryCard } from '../DiaryEntryCard/DiaryEntryCard';
import { DiaryPhaseIcon } from '../DiaryPhaseIcon/DiaryPhaseIcon';

function DiaryTimelineItem({
    item,
    indice,
    quantidade,
    temMais,
    acaoEmAndamentoId,
    aoAbrir,
    aoEditar,
    aoExcluir,
    estilos
}) {
    const apresentacao = obterApresentacaoFaseRegistro(item.fase);
    const [alturaCartao, setAlturaCartao] = useState(122);
    const centroCartao = alturaCartao / 2;

    function medirCartao({ nativeEvent }) {
        const altura = nativeEvent?.layout?.height;
        if (Number.isFinite(altura) && altura > 0 && altura !== alturaCartao) {
            setAlturaCartao(altura);
        }
    }

    return (
        <View style={estilos.item}>
            <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={estilos.trilho}
            >
                {indice > 0 ? (
                    <View style={[estilos.linhaSuperior, { height: centroCartao }]} />
                ) : null}
                <View
                    testID="diary-timeline-marker"
                    style={[estilos.marcador, { top: centroCartao - 25 }]}
                >
                    {apresentacao ? (
                        <DiaryPhaseIcon fase={item.fase} size={24} aceitarFaseIndefinida />
                    ) : null}
                </View>
                <View
                    testID="diary-timeline-horizontal-connector"
                    style={[estilos.linhaHorizontal, { top: centroCartao - 0.5 }]}
                />
                {indice < quantidade - 1 || temMais ? (
                    <View style={[estilos.linhaInferior, { top: centroCartao }]} />
                ) : null}
            </View>
            <View style={estilos.cartao}>
                <View testID="diary-timeline-card-layout" onLayout={medirCartao}>
                    <DiaryEntryCard
                        registro={item}
                        aoAbrir={aoAbrir}
                        aoEditar={aoEditar}
                        aoExcluir={aoExcluir}
                        acaoEmAndamento={
                            String(acaoEmAndamentoId) === String(item.id) ? 'excluir' : null
                        }
                    />
                </View>
            </View>
        </View>
    );
}

export { DiaryTimelineItem };
