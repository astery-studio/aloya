import { ActivityIndicator, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { EmptyState } from '../../../../shared/components/feedback/EmptyState/EmptyState';
import { obterCoresDiario } from '../../config/diaryColors';

function DiaryHistoryStateView({
    tipo,
    cabecalho,
    aoTentarNovamente,
    estilos,
    tema,
    somenteLeitura
}) {
    const cores = obterCoresDiario(tema).interface;
    let estado;

    if (tipo === 'carregando') {
        estado = (
            <View
                testID="diary-loading"
                accessibilityLiveRegion="polite"
                style={estilos.estadoCentralizado}
            >
                <ActivityIndicator color={cores.destaque} />
                <Text style={estilos.mensagemEstado}>Carregando histórico do Diário...</Text>
            </View>
        );
    } else if (tipo === 'erro') {
        estado = (
            <View style={estilos.estadoCentralizado}>
                <EmptyState
                    variante="erro"
                    titulo="Ocorreu um erro"
                    mensagem={
                        somenteLeitura
                            ? 'Não foi possível carregar o histórico do Diário. Tente novamente.'
                            : 'Não foi possível carregar seu histórico do Diário. Tente novamente.'
                    }
                    acao={
                        <ButtonScreen
                            texto="Tentar Novamente"
                            variante="preto"
                            aoPressionar={aoTentarNovamente}
                        />
                    }
                />
            </View>
        );
    } else if (tipo === 'filtro-vazio') {
        estado = (
            <View
                accessibilityLiveRegion="polite"
                style={[
                    estilos.estadoFiltroVazio,
                    somenteLeitura && estilos.filtroVazioCompartilhado
                ]}
            >
                <Text style={estilos.mensagemFiltroVazio}>
                    Nenhum registro encontrado para os filtros aplicados.
                </Text>
            </View>
        );
    } else {
        estado = (
            <View style={estilos.estadoCentralizado}>
                <EmptyState
                    titulo={somenteLeitura ? 'Nada para exibir' : 'Nenhum registro visível'}
                    mensagem={
                        somenteLeitura ? (
                            'Ainda não há dados suficientes para exibir aqui.'
                        ) : (
                            <>
                                Você ainda pode não ter registros ou as categorias usadas neles
                                podem estar desativadas. Ative-as em{' '}
                                <Text style={estilos.opcaoEstadoVazio}>
                                    &quot;Gerenciar categorias&quot;
                                </Text>{' '}
                                ou use o{' '}
                                <Text style={estilos.opcaoEstadoVazio}>botão de adicionar</Text>{' '}
                                para começar.
                            </>
                        )
                    }
                />
            </View>
        );
    }

    return (
        <View style={estilos.conteudoEstatico}>
            {cabecalho}
            {estado}
        </View>
    );
}

export { DiaryHistoryStateView };
