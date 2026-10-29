// Acesso rápido da HU-023: reutiliza o layout/menu e os cartões existentes sem modificá-los.
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { fontFamilies } from '../../../shared/theme';
import { useTheme } from '../../../shared/hooks/useTheme';
import {
    ContraceptiveUsageCard,
    criarUsos,
    usoConfirmado
} from '../components/ContraceptiveUsageCard';
import { PendingUsesBanner } from '../components/PendingUsesBanner';
import { MENSAGEM_ERRO_CARREGAR } from './ContraceptiveTrackingScreen';

function ContraceptiveHomeScreen({
    anticoncepcionais = [],
    carregando,
    erro,
    erroUso,
    aoTentarNovamente,
    aoDispensarErroUso,
    aoAlternarUso,
    aoEditar,
    aoRemover,
    aoAbrirLista,
    onSelecionarAba
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [usosAtualizados, setUsosAtualizados] = useState({});
    const ativos = anticoncepcionais
        .filter((item) => item.ativo !== false && !item.removido)
        .map((item) =>
            usosAtualizados[item.id]?.origem === item
                ? { ...item, usosHoje: usosAtualizados[item.id].usos }
                : item
        );
    const itensHoje = ativos.filter(
        (item) => criarUsos(item).length || item.tipo === 'diu_hormonal'
    );
    const pendentes = itensHoje.reduce(
        (total, item) => total + criarUsos(item).filter((uso) => !usoConfirmado(uso)).length,
        0
    );
    function atualizarUsos(item, usos) {
        const origem = anticoncepcionais.find((original) => original.id === item.id);
        if (origem !== item && usosAtualizados[item.id]?.origem !== origem) return;
        setUsosAtualizados((atuais) => ({ ...atuais, [item.id]: { origem, usos } }));
    }
    return (
        <SafeAreaView
            style={estilos.tela}
            edges={['top', 'left', 'right', 'bottom']}
            testID="usos-home-area-segura"
        >
            <MainLayout titulo="Início" abaAtiva="inicio" onSelecionarAba={onSelecionarAba}>
                <ScrollView
                    contentContainerStyle={estilos.conteudo}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={estilos.titulo} accessibilityRole="header">
                        Anticoncepcionais de hoje
                    </Text>
                    {carregando ? (
                        <ActivityIndicator color={tema.escuro ? '#F08A75' : '#C85A44'} />
                    ) : (
                        <>
                            {erro ? (
                                <View style={estilos.feedback}>
                                    <Text accessibilityRole="alert" style={estilos.mensagem}>
                                        {MENSAGEM_ERRO_CARREGAR}
                                    </Text>
                                    <ButtonScreen
                                        texto="Tentar novamente"
                                        variante="preto"
                                        aoPressionar={aoTentarNovamente}
                                    />
                                </View>
                            ) : null}
                            {erroUso ? (
                                <View style={estilos.feedback}>
                                    <Text accessibilityRole="alert" style={estilos.mensagem}>
                                        Não foi possível atualizar o uso do anticoncepcional no
                                        momento. Tente novamente.
                                    </Text>
                                    <ButtonScreen
                                        texto="OK"
                                        variante="preto"
                                        aoPressionar={aoDispensarErroUso}
                                    />
                                </View>
                            ) : null}
                            <PendingUsesBanner quantidade={pendentes} />
                            {!erro && !itensHoje.length ? (
                                <Text style={estilos.mensagem}>
                                    Nenhum uso programado para hoje.
                                </Text>
                            ) : null}
                            {itensHoje.map((item) => (
                                <ContraceptiveUsageCard
                                    key={item.id}
                                    anticoncepcional={item}
                                    aoAlternarUso={aoAlternarUso}
                                    aoAtualizarUsos={atualizarUsos}
                                    aoEditar={aoEditar}
                                    aoRemover={aoRemover}
                                />
                            ))}
                        </>
                    )}
                    <ButtonScreen
                        texto="Meus anticoncepcionais"
                        variante="verde"
                        aoPressionar={aoAbrirLista}
                    />
                </ScrollView>
            </MainLayout>
        </SafeAreaView>
    );
}

function criarEstilos(tema) {
    const interfaceTema = tema.cores.interface;
    return StyleSheet.create({
        tela: { flex: 1, backgroundColor: interfaceTema.fundo },
        conteudo: { padding: 21.66, gap: 12, alignItems: 'center' },
        titulo: {
            width: '100%',
            maxWidth: 350.01,
            fontFamily: fontFamilies.bold,
            fontSize: 18,
            lineHeight: 26,
            color: interfaceTema.textoPrincipal
        },
        mensagem: {
            fontFamily: fontFamilies.regular,
            fontSize: 13,
            lineHeight: 20,
            color: interfaceTema.textoSecundario
        },
        feedback: { width: '100%', maxWidth: 350.01, gap: 12 }
    });
}

export { ContraceptiveHomeScreen };
