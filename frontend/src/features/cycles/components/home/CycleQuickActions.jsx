import { View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DropIcon, NotepadIcon, PillIcon } from '../../../../shared/components/icons/AppIcons';
import { estilos } from './CycleQuickActions.styles';

function CycleQuickActions({ aoCadastrarMenstruacao, aoAbrirDiario, aoAbrirAnticoncepcional }) {
    return (
        <View style={estilos.secao}>
            <ButtonScreen
                texto="Cadastrar Menstruação"
                icone={DropIcon}
                aoPressionar={aoCadastrarMenstruacao}
                estilo={estilos.principal}
            />
            <View style={estilos.linha}>
                <ButtonScreen
                    texto="Diário"
                    icone={NotepadIcon}
                    aoPressionar={aoAbrirDiario}
                    variante="verde"
                    estilo={estilos.secundaria}
                />
                <ButtonScreen
                    texto="Anticoncepcional"
                    icone={PillIcon}
                    aoPressionar={aoAbrirAnticoncepcional}
                    variante="verde"
                    estilo={estilos.secundaria}
                />
            </View>
        </View>
    );
}

export { CycleQuickActions };
