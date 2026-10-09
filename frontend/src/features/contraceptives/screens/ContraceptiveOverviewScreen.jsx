import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { Plus } from 'phosphor-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { ContraceptiveOverviewCard } from '../components/ContraceptiveOverviewCard';
import { PendingUsesBanner } from '../components/PendingUsesBanner';
import { estilosVisaoGeral } from './contraceptiveOverviewScreen.styles';

const MENSAGEM_ERRO = 'Não foi possível carregar seus anticoncepcionais no momento. Tente novamente.';
const MENSAGEM_VAZIO = "Você ainda não cadastrou nenhum anticoncepcional. Toque em 'Cadastrar novo anticoncepcional' para começar.";

function ordenarPorProximoUso(itens) {
    return [...itens].sort((a, b) => {
        const horarioA = a.proximoUsoPrevisto ?? a.usosHoje?.find((uso) => uso.status !== 'confirmado')?.horario ?? '99:99';
        const horarioB = b.proximoUsoPrevisto ?? b.usosHoje?.find((uso) => uso.status !== 'confirmado')?.horario ?? '99:99';
        return horarioA.localeCompare(horarioB, 'pt-BR');
    });
}

function ContraceptiveOverviewScreen({
    anticoncepcionais = [],
    carregando = false,
    erro = false,
    aoCadastrarNovo,
    aoTentarNovamente,
    aoVoltar,
    aoAlternarUso,
    renderizarAcoes
}) {
    const insets = useSafeAreaInsets();
    const itens = ordenarPorProximoUso(anticoncepcionais);
    const pendentes = itens.reduce((total, item) => total + (item.usosHoje ?? []).filter((uso) => uso.status !== 'confirmado').length, 0);

    let corpo;
    if (carregando) {
        corpo = <View style={estilosVisaoGeral.estado}><ActivityIndicator size="large" color="#2C4C3B" /><Text style={estilosVisaoGeral.textoEstado}>Carregando anticoncepcionais...</Text></View>;
    } else if (erro) {
        corpo = <View accessibilityRole="alert" style={estilosVisaoGeral.estado}><Text style={estilosVisaoGeral.tituloEstado}>Não foi possível carregar</Text><Text style={estilosVisaoGeral.textoEstado}>{MENSAGEM_ERRO}</Text><ButtonScreen texto="Tentar novamente" variante="preto" aoPressionar={aoTentarNovamente} /></View>;
    } else {
        corpo = <FlatList
            data={itens}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <ContraceptiveOverviewCard anticoncepcional={item} aoAlternarUso={aoAlternarUso} renderizarAcoes={renderizarAcoes} />}
            ItemSeparatorComponent={() => <View style={estilosVisaoGeral.separador} />}
            ListHeaderComponent={pendentes ? <PendingUsesBanner quantidade={pendentes} /> : null}
            ListEmptyComponent={<View style={estilosVisaoGeral.estado}><Text style={estilosVisaoGeral.tituloEstado}>Nenhum anticoncepcional cadastrado</Text><Text style={estilosVisaoGeral.textoEstado}>{MENSAGEM_VAZIO}</Text></View>}
            contentContainerStyle={[estilosVisaoGeral.lista, { paddingBottom: 112 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
        />;
    }

    return (
        <SafeAreaView edges={['left', 'right']} style={estilosVisaoGeral.tela}>
            <Header titulo="Meus Anticoncepcionais" variante="comVoltar" onVoltar={aoVoltar} />
            <View style={estilosVisaoGeral.conteudo}>{corpo}</View>
            {!carregando && !erro ? <View style={[estilosVisaoGeral.acaoFixa, { paddingBottom: Math.max(insets.bottom, 12) }]}><ButtonScreen texto="Cadastrar novo anticoncepcional" variante="verde" icone={Plus} aoPressionar={aoCadastrarNovo} /></View> : null}
        </SafeAreaView>
    );
}

export { ContraceptiveOverviewScreen, MENSAGEM_ERRO, MENSAGEM_VAZIO, ordenarPorProximoUso };
