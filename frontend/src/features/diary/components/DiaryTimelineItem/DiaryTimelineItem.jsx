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

    return (
        <View style={estilos.item}>
            <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={estilos.trilho}
            >
                {indice > 0 ? <View style={estilos.linhaSuperior} /> : null}
                <View style={estilos.marcador}>
                    {apresentacao ? (
                        <DiaryPhaseIcon fase={item.fase} size={24} aceitarFaseIndefinida />
                    ) : null}
                </View>
                <View style={estilos.linhaHorizontal} />
                {indice < quantidade - 1 || temMais ? <View style={estilos.linhaInferior} /> : null}
            </View>
            <View style={estilos.cartao}>
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
    );
}

export { DiaryTimelineItem };
