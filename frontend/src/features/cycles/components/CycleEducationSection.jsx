import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CONTEUDOS_EDUCATIVOS } from '../constants/cycleEducationContent';
import { CycleEducationalDisclaimer } from './home/CycleEducationalDisclaimer';
import { estilos } from './CycleEducationSection.styles';
import { textos } from './CycleEducationSection.textStyles';

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
    conteudos = CONTEUDOS_EDUCATIVOS,
    perspectiva = 'titular',
    rodape
}) {
    const [faseLocal, setFaseLocal] = useState('menstrual');
    const ehContato = perspectiva === 'contato';
    const conteudoEducativo = ehContato ? CONTEUDOS_EDUCATIVOS : conteudos;
    const idSelecionado = ehContato ? faseLocal : (faseSelecionada ?? faseLocal);
    const selected = conteudoEducativo[idSelecionado] ?? conteudoEducativo.menstrual;
    const fases = Object.entries(conteudoEducativo).map(([id, conteudo]) => ({ id, ...conteudo }));
    const selecionar = (id) => {
        setFaseLocal(id);
        aoSelecionarFase?.(id);
    };
    return (
        <View style={estilos.secao}>
            <Text style={textos.etiqueta}>
                {ehContato ? 'Conhecimento sem expectativas' : 'Conteúdo educativo'}
            </Text>
            <Text accessibilityRole="header" style={textos.titulo}>
                {ehContato ? 'Entenda cada fase' : 'Conheça as fases do ciclo'}
            </Text>
            <Text style={textos.introducao}>
                {ehContato
                    ? 'Conhecer o funcionamento do ciclo pode ajudar você a compreender melhor o corpo, sem criar expectativas sobre como alguém deve se sentir.'
                    : 'Uma apresentação geral — nenhuma fase está sendo atribuída a você.'}
            </Text>
            <ScrollView
                horizontal
                accessibilityRole="list"
                style={estilos.rolagem}
                contentContainerStyle={estilos.seletor}
                showsHorizontalScrollIndicator={false}
            >
                {fases.map((phase) => (
                    <Pressable
                        key={phase.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: phase.id === idSelecionado }}
                        onPress={() => selecionar(phase.id)}
                        style={[
                            estilos.fase,
                            phase.id === idSelecionado && { borderColor: phase.cor }
                        ]}
                    >
                        <View testID={`icone-fase-educativa-${phase.id}`} style={estilos.icone}>
                            <phase.Icone
                                size={24}
                                color={phase.cor}
                                weight={phase.weight ?? 'fill'}
                            />
                        </View>
                        <Text style={[textos.nomeFase, { color: phase.cor }]}>{phase.label}</Text>
                    </Pressable>
                ))}
            </ScrollView>
            <View style={estilos.artigo}>
                <Text style={[textos.visao, { color: selected.cor }]}>Visão educativa</Text>
                <Text style={textos.tituloArtigo}>{selected.titulo}</Text>
                <Text style={textos.descricao}>{selected.texto}</Text>
            </View>
            {rodape ?? (
                <CycleEducationalDisclaimer
                    texto="As fases podem se sobrepor biologicamente e não possuem duração fixa para todas as pessoas."
                    style={estilos.aviso}
                />
            )}
        </View>
    );
}

export { CycleEducationSection, PHASES };
