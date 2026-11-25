import { Text, View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { RECURSOS_SEM_CICLO } from '../../constants/noCycleTrackingContent';
import { CycleExpandableCard } from '../CycleExpandableCard';
import { estilos } from './NoCycleTrackingSection.styles';

function NoCycleTrackingSection({
    recursos = RECURSOS_SEM_CICLO,
    idsExpandidos,
    aoAlternar,
    aoAbrirAnticoncepcional
}) {
    const abertos = idsExpandidos instanceof Set ? idsExpandidos : new Set(idsExpandidos ?? []);
    return (
        <View style={estilos.secao}>
            <Text style={estilos.rotulo}>Com o tempo</Text>
            <Text accessibilityRole="header" style={estilos.titulo}>
                O que você poderá acompanhar
            </Text>
            <View style={estilos.cartoes}>
                {recursos.map(({ id, titulo, subtitulo, texto, Icone, cor, fundo }) => (
                    <CycleExpandableCard
                        key={id}
                        titulo={titulo}
                        subtitulo={subtitulo}
                        icone={
                            <View style={[estilos.icone, { backgroundColor: fundo }]}>
                                <Icone size={24} color={cor} />
                            </View>
                        }
                        expandido={abertos.has(id)}
                        aoAlternar={() => aoAlternar(id)}
                    >
                        <Text style={estilos.descricao}>{texto}</Text>
                        {id === 'anticoncepcional' ? (
                            <ButtonScreen
                                texto="Abrir Anticoncepcionais"
                                aoPressionar={aoAbrirAnticoncepcional}
                                variante="verde"
                                estilo={estilos.acao}
                                estiloTexto={estilos.textoAcao}
                            />
                        ) : null}
                    </CycleExpandableCard>
                ))}
            </View>
        </View>
    );
}

export { NoCycleTrackingSection };
