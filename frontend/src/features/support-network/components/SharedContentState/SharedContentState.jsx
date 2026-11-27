import { ActivityIndicator, StyleSheet, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { EmptyState } from '../../../../shared/components/feedback/EmptyState/EmptyState';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { espacamentosLayout } from '../../../../shared/theme';

function SharedContentState({ status = 'vazio', aoTentarNovamente, mensagemErro }) {
    const tema = useTheme();
    const erro = status === 'erro';

    return (
        <View style={estilos.container}>
            {status === 'carregando' ? (
                <ActivityIndicator
                    accessibilityLabel="Carregando dados compartilhados"
                    color={tema.cores.interface.destaque}
                />
            ) : (
                <EmptyState
                    titulo={erro ? 'Ocorreu um erro' : 'Nada para exibir'}
                    mensagem={
                        erro
                            ? (mensagemErro ??
                              'Não foi possível carregar os dados compartilhados. Tente novamente.')
                            : 'Ainda não há dados suficientes para exibir aqui.'
                    }
                    variante={erro ? 'erro' : 'vazio'}
                    acao={
                        erro && aoTentarNovamente ? (
                            <ButtonScreen
                                texto="Tentar Novamente"
                                variante="preto"
                                aoPressionar={aoTentarNovamente}
                            />
                        ) : undefined
                    }
                />
            )}
        </View>
    );
}

const estilos = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: espacamentosLayout.margemHorizontalTela
    }
});

export { SharedContentState };
