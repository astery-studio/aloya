import { ActivityIndicator, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { EmptyState } from '../../../../shared/components/feedback/EmptyState/EmptyState';

function DiaryHistoryStateView({ tipo, cabecalho, aoTentarNovamente, aoCriar, estilos, tema }) {
    let estado;

    if (tipo === 'carregando') {
        estado = (
            <View
                testID="diary-loading"
                accessibilityLiveRegion="polite"
                style={estilos.estadoCentralizado}
            >
                <ActivityIndicator color={tema.cores.interface.destaque} />
                <Text style={estilos.mensagemEstado}>Carregando histórico do Diário...</Text>
            </View>
        );
    } else if (tipo === 'erro') {
        estado = (
            <View style={estilos.estadoCentralizado}>
                <EmptyState
                    variante="erro"
                    titulo="Ocorreu um erro"
                    mensagem="Não foi possível carregar seu histórico do Diário. Tente novamente."
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
            <View accessibilityLiveRegion="polite" style={estilos.estadoFiltroVazio}>
                <Text style={estilos.mensagemFiltroVazio}>
                    Nenhum registro encontrado para os filtros aplicados.
                </Text>
            </View>
        );
    } else {
        estado = (
            <View style={estilos.estadoCentralizado}>
                <EmptyState
                    titulo="Nenhum registro visível"
                    mensagem={
                        'Você ainda pode não ter registros ou as categorias usadas neles podem estar desativadas.\nAtive-as em "Gerenciar categorias" ou toque em "Adicionar novo registro" para começar.'
                    }
                    acao={
                        <ButtonScreen
                            texto="Adicionar novo registro"
                            variante="laranja"
                            aoPressionar={aoCriar}
                        />
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
