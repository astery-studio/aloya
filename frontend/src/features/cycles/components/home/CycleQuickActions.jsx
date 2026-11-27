import { View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DropIcon, NotepadIcon, PillIcon } from '../../../../shared/components/icons/AppIcons';
import { estilos } from './CycleQuickActions.styles';

function MenstruationIcon(props) {
    return <DropIcon {...props} weight="fill" />;
}

function CycleContraceptiveAction({
    aoPressionar,
    texto = 'Anticoncepcional',
    larguraTotal = false
}) {
    return (
        <ButtonScreen
            texto={texto}
            icone={PillIcon}
            tamanhoIcone={20}
            aoPressionar={aoPressionar}
            variante="verde"
            estilo={[
                estilos.secundaria,
                estilos.anticoncepcional,
                larguraTotal && estilos.larguraTotal
            ]}
            estiloTexto={estilos.texto}
        />
    );
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
                estiloTexto={[estilos.texto, estilos.textoPrincipal]}
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
                <CycleContraceptiveAction aoPressionar={aoAbrirAnticoncepcional} />
            </View>
        </View>
    );
}

export { CycleContraceptiveAction, CycleQuickActions };
