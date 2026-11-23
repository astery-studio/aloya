import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CONTEUDOS_EDUCATIVOS } from '../constants/cycleEducationContent';

const PHASES = Object.freeze(
    Object.entries(CONTEUDOS_EDUCATIVOS).map(([id, conteudo]) => ({
        id,
        ...conteudo,
        text: conteudo.texto
    }))
);

function CycleEducationSection({
    faseSelecionada,
    aoSelecionarFase,
    conteudos = CONTEUDOS_EDUCATIVOS
}) {
    const [faseLocal, setFaseLocal] = useState('menstrual');
    const idSelecionado = faseSelecionada ?? faseLocal;
    const selected = conteudos[idSelecionado] ?? conteudos.menstrual;
    const fases = Object.entries(conteudos).map(([id, conteudo]) => ({ id, ...conteudo }));
    const selecionar = (id) => {
        setFaseLocal(id);
        aoSelecionarFase?.(id);
    };
    return (
        <View style={{ paddingHorizontal: 16, paddingVertical: 24, gap: 14 }}>
            <Text accessibilityRole="header" style={{ fontFamily: 'DMSans_700Bold', fontSize: 20 }}>
                Conheça as fases do ciclo
            </Text>
            <View
                accessibilityRole="list"
                style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
            >
                {fases.map((phase) => (
                    <Pressable
                        key={phase.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: phase.id === idSelecionado }}
                        onPress={() => selecionar(phase.id)}
                        style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}
                    >
                        <Text>{phase.label}</Text>
                    </Pressable>
                ))}
            </View>
            <Text>{selected.texto}</Text>
            <Text>
                Cada corpo é único. Estas informações são educativas e não substituem orientação
                médica.
            </Text>
        </View>
    );
}

export { CycleEducationSection, PHASES };
