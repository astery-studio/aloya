import { useState } from 'react';
import { useFonts } from 'expo-font';
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold
} from '@expo-google-fonts/dm-sans';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppThemeRoot } from '../../../app/AppThemeRoot';
import { CycleEducationSection } from '../../cycles/components/CycleEducationSection';
import { CycleHistoryCard } from '../../cycles/components/CycleHistoryCard/CycleHistoryCard';
import { CycleSummaryCard } from '../../cycles/components/CycleSummaryCard/CycleSummaryCard';
import { DiaryTimelineDivider } from '../../diary/components/DiaryHistoryHeader/DiaryHistoryHeader';
import { DiaryOverviewCard } from '../../diary/components/DiaryOverviewCard/DiaryOverviewCard';
import { DiaryTimeline } from '../../diary/components/DiaryTimeline/DiaryTimeline';
import { criarEstilos as criarEstilosDiario } from '../../diary/screens/DiaryScreen.styles';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import { SharedPermissionGate } from '../components/SharedPermissionGate/SharedPermissionGate';
import { SupportedCycleHero } from '../components/SupportedCycleHero/SupportedCycleHero';
import { SupportedPersonIndicator } from '../components/SupportedPersonIndicator/SupportedPersonIndicator';
import { gruposPermissoes, permissoesGerais } from '../constants/permissionOptions';

const NOME = 'Júlia';
const PERMISSOES_DEMONSTRACAO = [
    ...permissoesGerais,
    ...gruposPermissoes.flatMap(({ permissoes }) => permissoes)
].map(({ id }) => id);
const TITULOS = { inicio: 'Início', historico: 'Histórico de Ciclos', diario: 'Diário' };
const CENARIOS_CICLO = [
    { id: 'folicular', rotulo: 'Folicular', dia: 9 },
    { id: 'menstrual', rotulo: 'Menstrual', dia: 3 },
    { id: 'ovulatoria', rotulo: 'Ovulatória', dia: 14 },
    { id: 'lutea', rotulo: 'Lútea', dia: 16 },
    { id: 'sem-ciclo', rotulo: 'Sem ciclo' }
];
const CICLOS = [
    {
        numero: 5,
        periodo: '04 Setembro até hoje',
        diasMenstruais: 4,
        status: 'emAndamento'
    },
    {
        numero: 4,
        periodo: '07 Agosto até 03 Setembro',
        diasMenstruais: 5,
        duracaoDias: 27,
        status: 'concluido'
    },
    {
        numero: 3,
        periodo: '08 Julho até 06 Agosto',
        diasMenstruais: 6,
        duracaoDias: 29,
        status: 'incerto'
    }
];
const REGISTROS_DIARIO = [
    {
        id: 1,
        data: '2026-11-04',
        fase: 'menstrual',
        diaCiclo: 1,
        principais: [
            {
                categoriaId: 'banheiro',
                valor: 'Intestino',
                macrocategoriaId: 'corpo_sintomas_fisicos'
            },
            {
                categoriaId: 'sangramento_escape',
                valor: 'Sangramento de Escape',
                macrocategoriaId: 'ciclo_sangramento'
            },
            { categoriaId: 'tempo_sono', valor: 'Tempo de Sono', macrocategoriaId: 'energia_sono' }
        ],
        maisQuantidade: 2
    },
    {
        id: 2,
        data: '2026-10-28',
        fase: 'lutea',
        principais: [
            { categoriaId: 'pele', valor: 'Pele', macrocategoriaId: 'corpo_sintomas_fisicos' },
            {
                categoriaId: 'sintomas_pre_menstruais',
                valor: 'Sintomas pré-menstruais',
                macrocategoriaId: 'emocional'
            },
            {
                categoriaId: 'vida_social',
                valor: 'Vida social',
                macrocategoriaId: 'vida_intima_social'
            }
        ],
        maisQuantidade: 2,
        trechoAnotacao: 'Hoje tirei um tempo para descansar.'
    }
];

function DiarioPrevia({ permissoes, aviso }) {
    const tema = useTheme();

    return (
        <DiaryTimeline
            registros={REGISTROS_DIARIO}
            somenteLeitura
            contentContainerStyle={estilos.inset}
            ListHeaderComponent={
                <View style={estilos.lista}>
                    {aviso}
                    <DiaryOverviewCard
                        nomeTitular={NOME}
                        fase="folicular"
                        tituloFase="Fase Folicular"
                        descricao="Júlia costuma registrar aumento de energia, secreção clara de ovo e humor motivado."
                        diasRegistrados={4}
                        exibirFase={permissoes.includes('geral.fase_atual')}
                    />
                    <DiaryTimelineDivider estilos={criarEstilosDiario(tema)} />
                </View>
            }
        />
    );
}

function ConteudoPrevia() {
    const [tela, setTela] = useState('inicio');
    const [cenario, setCenario] = useState(CENARIOS_CICLO[0]);
    const tema = useTheme();
    const permissoes = PERMISSOES_DEMONSTRACAO;
    const aviso = (
        <Text style={[estilos.aviso, { color: tema.cores.interface.textoSecundario }]}>
            Prévia HU-032 · Dados fictícios · {permissoes.length} permissões simuladas
        </Text>
    );

    return (
        <MainLayout
            titulo={TITULOS[tela]}
            varianteHeader={tela === 'inicio' ? 'padrao' : 'comVoltar'}
            onVoltar={tela === 'inicio' ? undefined : () => setTela('inicio')}
            exibirNavegacaoInferior={false}
        >
            {tela === 'diario' ? (
                <DiarioPrevia permissoes={permissoes} aviso={aviso} />
            ) : (
                <ScrollView contentContainerStyle={estilos.conteudo}>
                    {aviso}
                    {tela === 'inicio' ? (
                        <>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={[estilos.inset, estilos.cenarios]}
                            >
                                {CENARIOS_CICLO.map((opcao) => {
                                    const selecionado = opcao.id === cenario.id;
                                    const {
                                        destaque,
                                        superficie,
                                        borda,
                                        textoSobreDestaque,
                                        textoPrincipal
                                    } = tema.cores.interface;
                                    return (
                                        <Pressable
                                            key={opcao.id}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Prévia da arte: ${opcao.rotulo}`}
                                            accessibilityState={{ selected: selecionado }}
                                            onPress={() => setCenario(opcao)}
                                            style={[
                                                estilos.cenario,
                                                {
                                                    borderColor: borda,
                                                    backgroundColor: selecionado
                                                        ? destaque
                                                        : superficie
                                                }
                                            ]}
                                        >
                                            <Text
                                                style={{
                                                    color: selecionado
                                                        ? textoSobreDestaque
                                                        : textoPrincipal
                                                }}
                                            >
                                                {opcao.rotulo}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                            <SupportedPersonIndicator nome={NOME} />
                            <SupportedCycleHero
                                nomeTitular={NOME}
                                fase={cenario.id}
                                possuiDadosCiclo={Boolean(cenario.dia)}
                                diaCiclo={cenario.dia}
                                duracaoCiclo={28}
                                exibirFase={permissoes.includes('geral.fase_atual')}
                            />
                            <SharedPermissionGate
                                permissoes={permissoes}
                                permissao="geral.historico_ciclo"
                            >
                                <View style={estilos.inset}>
                                    <ButtonScreen
                                        texto="Ver Histórico de Ciclos"
                                        aoPressionar={() => setTela('historico')}
                                    />
                                </View>
                            </SharedPermissionGate>
                            <SharedPermissionGate permissoes={permissoes} permissao="corpo.pele">
                                <View style={estilos.inset}>
                                    <ButtonScreen
                                        texto="Ver Diário"
                                        aoPressionar={() => setTela('diario')}
                                    />
                                </View>
                            </SharedPermissionGate>
                            <SharedPermissionGate permissoes={permissoes} permissao="geral.dicas">
                                <CycleEducationSection perspectiva="contato" />
                            </SharedPermissionGate>
                        </>
                    ) : null}
                    {tela === 'historico' ? (
                        <View style={[estilos.inset, estilos.lista]}>
                            <CycleSummaryCard
                                nomeTitular={NOME}
                                cicloMedioDias={28}
                                menstruacaoMediaDias={5}
                                quantidadeCiclos={5}
                                exibirConfianca={false}
                            />
                            {CICLOS.map((ciclo) => (
                                <CycleHistoryCard key={ciclo.numero} ciclo={ciclo} somenteLeitura />
                            ))}
                        </View>
                    ) : null}
                </ScrollView>
            )}
        </MainLayout>
    );
}

function SharedSupportPreview() {
    const [fontes, erroFontes] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold
    });

    return (
        <AppThemeRoot>
            {fontes || erroFontes ? <ConteudoPrevia /> : <ActivityIndicator />}
        </AppThemeRoot>
    );
}

const estilos = StyleSheet.create({
    conteudo: { gap: 16, paddingBottom: 24 },
    aviso: { textAlign: 'center', paddingHorizontal: 16 },
    inset: { paddingHorizontal: 16 },
    cenarios: { gap: 8 },
    cenario: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
    lista: { gap: 12 }
});

export { SharedSupportPreview };
