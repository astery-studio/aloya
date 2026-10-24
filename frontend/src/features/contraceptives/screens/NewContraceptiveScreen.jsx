import { ScrollView, View } from 'react-native';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { ContraceptiveForm } from '../forms/ContraceptiveForm';
import { estilos } from './contraceptiveScreens.styles';

function NewContraceptiveScreen({ onVoltar, onCadastrar, salvando = false }) {
    return (
        <View style={estilos.tela}>
            <Header titulo="Cadastro de Anticoncepcional" variante="comVoltar" onVoltar={onVoltar} />
            <ScrollView contentContainerStyle={estilos.conteudoFormulario} keyboardShouldPersistTaps="handled">
                <ContraceptiveForm onSubmit={onCadastrar} salvando={salvando} />
            </ScrollView>
        </View>
    );
}

export { NewContraceptiveScreen };
