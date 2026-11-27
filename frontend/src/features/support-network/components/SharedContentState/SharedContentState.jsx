import { ActivityIndicator, StyleSheet, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { EmptyState } from '../../../../shared/components/feedback/EmptyState/EmptyState';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';

function SharedContentState({ status = 'vazio', aoTentarNovamente, mensagemErro }) {
    const tema = useTheme();
    const erro = status === 'erro';

    return (
        <View style={estilos.container}>
            {status === 'carregando' ? (
                <ActivityIndicator
                    accessibilityLabel="Carregando dados compartilhados"
                    color={
                        tema.escuro ? coresNoturnasConteudo.verde : tema.cores.interface.destaque
                    }
                />
            ) : (
                <EmptyState
                    usarPaletaNoturnaConteudo
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
    container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 }
});

export { SharedContentState };
