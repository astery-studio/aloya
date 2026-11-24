import { Text, View } from 'react-native';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { CycleEducationalDisclaimer } from '../home/CycleEducationalDisclaimer';
import { AVISO_EDUCATIVO, CONTEUDO_POR_FASE } from './CyclePhaseEducationSheet.content';
import { estilos } from './CyclePhaseEducationSheet.styles';

function CyclePhaseEducationSheet({ visivel, fase, aoFechar }) {
    const conteudo = CONTEUDO_POR_FASE[fase] ?? CONTEUDO_POR_FASE.menstrual;
    const { Icone } = conteudo;
    return (
        <BottomSheet
            visivel={visivel}
            onFechar={aoFechar}
            permitirDeslizarParaFechar
            estiloPainel={estilos.painel}
            corPainel="#FFFFFF"
        >
            <View style={estilos.conteudo}>
                <View style={estilos.cabecalho}>
                    <View style={[estilos.icone, { backgroundColor: conteudo.fundo }]}>
                        <Icone size={28} color={conteudo.cor} weight={conteudo.weight} />
                    </View>
                    <Text style={estilos.rotulo}>Conheça seu ciclo</Text>
                </View>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    {conteudo.titulo}
                </Text>
                <Text style={estilos.descricao}>{conteudo.descricao}</Text>
                <CycleEducationalDisclaimer
                    texto={AVISO_EDUCATIVO}
                    style={estilos.aviso}
                    textStyle={estilos.textoAviso}
                />
            </View>
        </BottomSheet>
    );
}

export { CyclePhaseEducationSheet };
