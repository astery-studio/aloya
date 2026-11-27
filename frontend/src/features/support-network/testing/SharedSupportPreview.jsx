import { useState } from 'react';
import { useFonts } from 'expo-font';
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold
} from '@expo-google-fonts/dm-sans';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppThemeRoot } from '../../../app/AppThemeRoot';
import { CycleEducationSection } from '../../cycles/components/CycleEducationSection';
import { CycleHistoryCard } from '../../cycles/components/CycleHistoryCard/CycleHistoryCard';
import { CycleSummaryCard } from '../../cycles/components/CycleSummaryCard/CycleSummaryCard';
import { DiaryOverviewCard } from '../../diary/components/DiaryOverviewCard/DiaryOverviewCard';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import { SharedPermissionGate } from '../components/SharedPermissionGate/SharedPermissionGate';
import { SupportedPersonIndicator } from '../components/SupportedPersonIndicator/SupportedPersonIndicator';
import { gruposPermissoes, permissoesGerais } from '../constants/permissionOptions';

const NOME = 'Júlia';
const PERMISSOES_DEMONSTRACAO = [
    ...permissoesGerais,
    ...gruposPermissoes.flatMap(({ permissoes }) => permissoes)
].map(({ id }) => id);
const TITULOS = { inicio: 'Início', historico: 'Histórico de Ciclos', diario: 'Diário' };
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

function ConteudoPrevia() {
    const [tela, setTela] = useState('inicio');
    const tema = useTheme();
    const permissoes = PERMISSOES_DEMONSTRACAO;

    return (
        <MainLayout
            titulo={TITULOS[tela]}
            varianteHeader={tela === 'inicio' ? 'padrao' : 'comVoltar'}
            onVoltar={tela === 'inicio' ? undefined : () => setTela('inicio')}
            exibirNavegacaoInferior={false}
        >
            <ScrollView contentContainerStyle={estilos.conteudo}>
                <Text style={[estilos.aviso, { color: tema.cores.interface.textoSecundario }]}>
                    Prévia HU-032 · Dados fictícios · {permissoes.length} permissões simuladas
                </Text>
                {tela === 'inicio' ? (
                    <>
                        <SupportedPersonIndicator nome={NOME} />
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
                {tela === 'diario' ? (
                    <View style={estilos.inset}>
                        <DiaryOverviewCard
                            nomeTitular={NOME}
                            fase="folicular"
                            tituloFase="Fase Folicular"
                            descricao="Júlia costuma registrar aumento de energia, secreção clara de ovo e humor motivado."
                            diasRegistrados={4}
                            exibirFase={permissoes.includes('geral.fase_atual')}
                        />
                    </View>
                ) : null}
            </ScrollView>
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
    lista: { gap: 12 }
});

export { SharedSupportPreview };
