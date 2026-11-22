import { Pressable, Text, View } from 'react-native';

import SwitchField from '../../../../shared/components/forms/SwitchField/SwitchField';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterCoresDiario } from '../../config/diaryColors';
import { obterApresentacaoFase } from '../../utils/diaryPhasePresentation';
import { DiaryPhaseIcon } from '../DiaryPhaseIcon/DiaryPhaseIcon';

function DiaryPhaseFilterOption({ fase, ativo, aoAlterar, estilos }) {
    const tema = useTheme();
    const coresDiario = obterCoresDiario(tema);
    const apresentacao = obterApresentacaoFase(fase, tema);
    const coresSwitch = {
        trilhaAtiva: coresDiario.interface.destaque,
        trilhaInativa: coresDiario.interface.switchInativo,
        indicadorAtivo: coresDiario.interface.textoSobreDestaque,
        indicadorInativo: coresDiario.interface.textoSobreDestaque
    };

    return (
        <Pressable
            accessible={false}
            onPress={() => aoAlterar(!ativo)}
            style={({ pressed }) => [estilos.opcaoFase, pressed && estilos.pressionado]}
        >
            <View style={estilos.identificacaoFase}>
                <View style={[estilos.iconeFase, { backgroundColor: apresentacao.fundo }]}>
                    <DiaryPhaseIcon fase={fase} size={18} />
                </View>
                <Text style={estilos.nomeFase}>{apresentacao.rotulo}</Text>
            </View>
            <SwitchField
                cores={coresSwitch}
                somenteControle
                ativo={ativo}
                aoAlterar={aoAlterar}
                rotuloAcessibilidade={`Filtrar por ${apresentacao.rotulo}`}
            />
        </Pressable>
    );
}

export { DiaryPhaseFilterOption };
