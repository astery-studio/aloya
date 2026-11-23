import { Text, View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { RECURSOS_SEM_CICLO } from '../../constants/noCycleTrackingContent';
import { CycleExpandableCard } from '../CycleExpandableCard';

function NoCycleTrackingSection({
    recursos = RECURSOS_SEM_CICLO,
    idsExpandidos,
    aoAlternar,
    aoAbrirAnticoncepcional
}) {
    const abertos = idsExpandidos instanceof Set ? idsExpandidos : new Set(idsExpandidos ?? []);
    return (
        <View style={{ paddingTop: 38, paddingHorizontal: 16, gap: 10 }}>
            <Text style={{ fontSize: 9, fontFamily: 'DMSans_700Bold' }}>COM O TEMPO</Text>
            <Text accessibilityRole="header" style={{ fontSize: 23 }}>
                O que você poderá acompanhar
            </Text>
            {recursos.map(({ id, titulo, subtitulo, texto, Icone, cor, fundo }) => (
                <CycleExpandableCard
                    key={id}
                    titulo={titulo}
                    subtitulo={subtitulo}
                    icone={
                        <View style={{ padding: 10, borderRadius: 12, backgroundColor: fundo }}>
                            <Icone size={20} color={cor} />
                        </View>
                    }
                    expandido={abertos.has(id)}
                    aoAlternar={() => aoAlternar(id)}
                >
                    <Text>{texto}</Text>
                    {id === 'anticoncepcional' ? (
                        <ButtonScreen
                            texto="Abrir Anticoncepcionais"
                            aoPressionar={aoAbrirAnticoncepcional}
                            variante="verde"
                        />
                    ) : null}
                </CycleExpandableCard>
            ))}
        </View>
    );
}

export { NoCycleTrackingSection };
