import { useHomeColors } from '../../hooks/useHomeColors';
import { View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DropIcon, NotepadIcon, PillIcon } from '../../../../shared/components/icons/AppIcons';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';
import { estilos as estilosClaros } from './CycleQuickActions.styles';

function MenstruationIcon(props) {
    return <DropIcon {...props} weight="fill" />;
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
                <ButtonScreen
                    texto="Anticoncepcional"
                    corConteudo={corConteudo}
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
