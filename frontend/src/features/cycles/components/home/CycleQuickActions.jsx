import { useHomeColors } from '../../hooks/useHomeColors';
import { View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DropIcon, NotepadIcon, PillIcon } from '../../../../shared/components/icons/AppIcons';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';
import { estilos as estilosClaros } from './CycleQuickActions.styles';

function MenstruationIcon(props) {
    return <DropIcon {...props} weight="fill" />;
}

function CycleContraceptiveAction({
    aoPressionar,
    texto = 'Anticoncepcional',
    larguraTotal = false
}) {
    const { estilos, escuro } = useHomeColors(estilosClaros);
    return (
        <ButtonScreen
            texto={texto}
            icone={PillIcon}
            tamanhoIcone={20}
            aoPressionar={aoPressionar}
            variante="verde"
            corConteudo={escuro ? coresNoturnasConteudo.fundo : undefined}
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
    const { estilos, escuro } = useHomeColors(estilosClaros);
    const corConteudo = escuro ? coresNoturnasConteudo.fundo : undefined;
    return (
        <View style={estilos.secao}>
            <ButtonScreen
                texto="Cadastrar Menstruação"
                corConteudo={corConteudo}
                icone={MenstruationIcon}
                tamanhoIcone={20}
                aoPressionar={aoCadastrarMenstruacao}
                estilo={estilos.principal}
                estiloTexto={[estilos.texto, estilos.textoPrincipal]}
            />
            <View style={estilos.linha}>
                <ButtonScreen
                    texto="Diário"
                    corConteudo={corConteudo}
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
