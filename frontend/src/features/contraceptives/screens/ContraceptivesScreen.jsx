import { useMemo } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'phosphor-react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { useTheme } from '../../../shared/hooks/useTheme';
import { ContraceptiveCard } from '../components/ContraceptiveCard';
import { criarEstilos } from './contraceptiveScreens.styles';

function ContraceptivesScreen({
    anticoncepcionais = [],
    onCadastrarNovo,
    onVoltar,
    carregando = false,
    erro = null,
    onTentarNovamente
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    let estadoVazio = (
        <View style={estilos.vazio}>
            <Text style={estilos.tituloVazio}>Nenhum anticoncepcional cadastrado</Text>
            <Text style={estilos.textoVazio}>
                Cadastre seu anticoncepcional para acompanhar os próximos horários de uso.
            </Text>
        </View>
    );
    if (carregando)
        estadoVazio = (
            <View style={estilos.vazio}>
                <ActivityIndicator />
                <Text style={estilos.textoVazio}>Carregando anticoncepcionais...</Text>
            </View>
        );
    if (erro)
        estadoVazio = (
            <View style={estilos.vazio}>
                <Text style={estilos.tituloVazio}>Não foi possível carregar</Text>
                <Text style={estilos.textoVazio}>{erro}</Text>
                <ButtonScreen
                    texto="Tentar novamente"
                    variante="preto"
                    aoPressionar={onTentarNovamente}
                />
            </View>
        );

    return (
        <SafeAreaView style={estilos.tela} edges={['top', 'left', 'right', 'bottom']}
            testID="lista-anticoncepcionais-area-segura">
            <Header titulo="Meus Anticoncepcionais" variante="comVoltar" onVoltar={onVoltar} />
            <FlatList
                data={anticoncepcionais}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ContraceptiveCard anticoncepcional={item} />}
                contentContainerStyle={estilos.lista}
                ItemSeparatorComponent={() => <View style={estilos.separador} />}
                ListEmptyComponent={estadoVazio}
                ListFooterComponent={
                    carregando || erro ? null : (
                        <View style={estilos.acao}>
                            <ButtonScreen
                                texto="Cadastrar novo anticoncepcional"
                                variante="verde"
                                icone={Plus}
                                aoPressionar={onCadastrarNovo}
                            />
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}

export { ContraceptivesScreen };
