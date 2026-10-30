import { useMemo } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/hooks/useTheme';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { ContraceptiveForm } from '../forms/ContraceptiveForm';
import { criarEstilos } from './contraceptiveScreens.styles';

function NewContraceptiveScreen({ onVoltar, onCadastrar, salvando = false }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    return (
        <SafeAreaView style={estilos.tela} edges={['top', 'left', 'right', 'bottom']}
            testID="cadastro-anticoncepcional-area-segura">
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
        </SafeAreaView>
    );
}

export { NewContraceptiveScreen };
