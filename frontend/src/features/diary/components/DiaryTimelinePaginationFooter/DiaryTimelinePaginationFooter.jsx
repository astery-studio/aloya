import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { obterCoresDiario } from '../../config/diaryColors';

function DiaryTimelinePaginationFooter({
    carregando,
    erro,
    aoTentarNovamente,
    estilos,
    tema,
    children
}) {
    const cores = obterCoresDiario(tema).interface;
    return (
        <>
            {carregando ? (
                <View
                    testID="diary-timeline-loading-more"
                    accessibilityLiveRegion="polite"
                    style={estilos.rodapeCarregando}
                >
                    <ActivityIndicator size="small" color={cores.destaque} />
                    <Text style={estilos.textoCarregando}>Carregando mais registros...</Text>
                </View>
            ) : null}
            {erro ? (
                <View accessibilityRole="alert" style={estilos.rodape}>
                    <Text style={estilos.textoRodape}>
                        Não foi possível carregar mais registros.
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tentar carregar mais registros novamente"
                        disabled={typeof aoTentarNovamente !== 'function'}
                        onPress={aoTentarNovamente}
                        style={estilos.tentarNovamente}
                    >
                        <Text style={estilos.textoTentarNovamente}>Tentar novamente</Text>
                    </Pressable>
                </View>
            ) : null}
            {children}
        </>
    );
}

export { DiaryTimelinePaginationFooter };
