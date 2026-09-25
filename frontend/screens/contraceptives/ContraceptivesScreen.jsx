import { FlatList, Text, View } from 'react-native';
import { Plus } from 'phosphor-react-native';
import ButtonScreen from '../../components/common/Button/ButtonScreen';
import { Header } from '../../components/navigation/Header/Header';
import { ContraceptiveCard } from '../../features/contraceptives/components/ContraceptiveCard';
import { estilos } from './contraceptiveScreens.styles';

function ContraceptivesScreen({ anticoncepcionais = [], onCadastrarNovo }) {
    return (
        <View style={estilos.tela}>
            <Header titulo="Meus Anticoncepcionais" />
            <FlatList
                data={anticoncepcionais}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ContraceptiveCard anticoncepcional={item} />}
                contentContainerStyle={estilos.lista}
                ItemSeparatorComponent={() => <View style={estilos.separador} />}
                ListEmptyComponent={<View style={estilos.vazio}><Text style={estilos.tituloVazio}>Nenhum anticoncepcional cadastrado</Text><Text style={estilos.textoVazio}>Cadastre seu anticoncepcional para acompanhar os próximos horários de uso.</Text></View>}
                ListFooterComponent={<View style={estilos.acao}><ButtonScreen texto="Cadastrar novo anticoncepcional" variante="verde" icone={Plus} aoPressionar={onCadastrarNovo} /></View>}
            />
        </View>
    );
}

export { ContraceptivesScreen };
