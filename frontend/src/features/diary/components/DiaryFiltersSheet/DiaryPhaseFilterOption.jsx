import { Pressable, Text, View } from 'react-native';

import SwitchField from '../../../../shared/components/forms/SwitchField/SwitchField';
import { obterApresentacaoFase } from '../../utils/diaryPhasePresentation';
import { DiaryPhaseIcon } from '../DiaryPhaseIcon/DiaryPhaseIcon';

function DiaryPhaseFilterOption({ fase, ativo, aoAlterar, estilos }) {
    const apresentacao = obterApresentacaoFase(fase);

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
                somenteControle
                ativo={ativo}
                aoAlterar={aoAlterar}
                rotuloAcessibilidade={`Filtrar por ${apresentacao.rotulo}`}
            />
        </Pressable>
    );
}

export { DiaryPhaseFilterOption };
