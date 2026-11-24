import { View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DropIcon, NotepadIcon, PillIcon } from '../../../../shared/components/icons/AppIcons';
import { estilos } from './CycleQuickActions.styles';

function MenstruationIcon(props) {
    return <DropIcon {...props} weight="fill" />;
}

function CycleQuickActions({ aoCadastrarMenstruacao, aoAbrirDiario, aoAbrirAnticoncepcional }) {
    return (
        <View style={estilos.secao}>
            <ButtonScreen
                texto="Cadastrar Menstruação"
                icone={MenstruationIcon}
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
