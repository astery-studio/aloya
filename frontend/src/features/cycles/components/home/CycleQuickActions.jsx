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
                tamanhoIcone={20}
                aoPressionar={aoCadastrarMenstruacao}
                estilo={estilos.principal}
                estiloTexto={estilos.texto}
            />
            <View style={estilos.linha}>
                <ButtonScreen
                    texto="Diário"
                    icone={NotepadIcon}
                    tamanhoIcone={20}
                    aoPressionar={aoAbrirDiario}
                    variante="verde"
                    estilo={estilos.secundaria}
                    estiloTexto={estilos.texto}
                />
                <ButtonScreen
                    texto="Anticoncepcional"
                    icone={PillIcon}
                    tamanhoIcone={20}
                    aoPressionar={aoAbrirAnticoncepcional}
                    variante="verde"
                    estilo={[estilos.secundaria, estilos.anticoncepcional]}
                    estiloTexto={estilos.texto}
                />
            </View>
        </View>
    );
}

export { CycleQuickActions };
