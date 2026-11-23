import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

const PHASES = Object.freeze([
    { id: 'menstrual', label: 'Menstrual', text: 'O ciclo recomeça com o período menstrual.' },
    {
        id: 'folicular',
        label: 'Folicular',
        text: 'O corpo se prepara gradualmente para a ovulação.'
    },
    {
        id: 'ovulatoria',
        label: 'Ovulatória',
        text: 'A fertilidade estimada costuma ser mais alta.'
    },
    { id: 'lutea', label: 'Lútea', text: 'O corpo se prepara para o próximo ciclo.' }
]);

function CycleEducationSection() {
    const [selected, setSelected] = useState(PHASES[0]);
    return (
        <View style={{ paddingHorizontal: 16, paddingVertical: 24, gap: 14 }}>
            <Text accessibilityRole="header" style={{ fontFamily: 'DMSans_700Bold', fontSize: 20 }}>
                Conheça as fases do ciclo
            </Text>
            <View
                accessibilityRole="list"
                style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
            >
                {PHASES.map((phase) => (
                    <Pressable
                        key={phase.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: phase.id === selected.id }}
                        onPress={() => setSelected(phase)}
                        style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}
                    >
                        <Text>{phase.label}</Text>
                    </Pressable>
                ))}
            </View>
            <Text>{selected.text}</Text>
            <Text>
                Cada corpo é único. Estas informações são educativas e não substituem orientação
                médica.
            </Text>
        </View>
    );
}

export { CycleEducationSection, PHASES };
