//Mostra a listagem de anticoncepcionais e encaminha para cadastro ou edição.
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { Plus } from 'phosphor-react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { ContraceptiveCard } from '../components/ContraceptiveCard';
import { estilos } from './contraceptiveScreens.styles';

//Recebe um item e retorna sua chave estável para a lista.
function extrairChave(item) {
    return String(item.id);
}

//Mostra uma separação leve entre os cards sem criar margens duplicadas.
function SeparadorLista() {
    return (
        <View style={estilos.separador} />
    );
}

//Recebe os itens e ações da listagem e mostra seus estados de carregamento e erro.
function ContraceptivesScreen({
    anticoncepcionais = [],
    onCadastrarNovo,
    onEditar,
    onVoltar,
    carregando = false,
    erro = null,
    onTentarNovamente
}) {
    //Memoização mantém a função de renderização estável enquanto a ação de edição não muda.
    const renderizarItem = useCallback(({
        item
    }) => (
        <ContraceptiveCard
            anticoncepcional={item}
            onEditar={onEditar}
        />
    ), [onEditar]);

    let estadoVazio = (
        <View style={estilos.vazio}>
            <Text style={estilos.tituloVazio}>
                Nenhum anticoncepcional cadastrado
            </Text>

            <Text style={estilos.textoVazio}>
                Cadastre seu anticoncepcional para acompanhar os próximos horários de uso.
            </Text>
        </View>
    );

    if (carregando) {
        estadoVazio = (
            <View style={estilos.vazio}>
                <ActivityIndicator />

                <Text style={estilos.textoVazio}>
                    Carregando anticoncepcionais...
                </Text>
            </View>
        );
    }

    if (erro) {
        estadoVazio = (
            <View style={estilos.vazio}>
                <Text style={estilos.tituloVazio}>
                    Não foi possível carregar
                </Text>

                <Text style={estilos.textoVazio}>
                    {erro}
                </Text>

                <ButtonScreen
                    texto="Tentar novamente"
                    variante="preto"
                    aoPressionar={onTentarNovamente}
                />
            </View>
        );
    }

    const rodape = carregando || erro ? null : (
        <View style={estilos.acao}>
            <ButtonScreen
                texto="Cadastrar novo anticoncepcional"
                variante="verde"
                icone={Plus}
                aoPressionar={onCadastrarNovo}
            />
        </View>
    );

    return (
        <View style={estilos.tela}>
            <Header
                titulo="Meus Anticoncepcionais"
                variante="comVoltar"
                onVoltar={onVoltar}
            />

            <FlatList
                data={anticoncepcionais}
                keyExtractor={extrairChave}
                renderItem={renderizarItem}
                contentContainerStyle={estilos.lista}
                ItemSeparatorComponent={SeparadorLista}
                ListEmptyComponent={estadoVazio}
                ListFooterComponent={rodape}
                initialNumToRender={6}
                maxToRenderPerBatch={6}
                windowSize={5}
                removeClippedSubviews
            />
        </View>
    );
}

export { ContraceptivesScreen };