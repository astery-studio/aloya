import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { ContraceptiveForm } from '../forms/ContraceptiveForm';
import { criarEstilos } from './contraceptiveScreens.styles';

function NewContraceptiveScreen({ onVoltar, onCadastrar, salvando = false }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    return (
        <View style={estilos.tela}>
            <Header
                titulo="Cadastro de Anticoncepcional"
                variante="comVoltar"
                onVoltar={onVoltar}
            />
            <ScrollView
                contentContainerStyle={estilos.conteudoFormulario}
                keyboardShouldPersistTaps="handled"
            >
                <ContraceptiveForm onSubmit={onCadastrar} salvando={salvando} />
            </ScrollView>
        </View>
    );
}

export { NewContraceptiveScreen };
