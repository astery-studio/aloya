import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileTextIcon } from 'phosphor-react-native/src/icons/FileText';

import {
    CaretDownIcon,
    CaretUpIcon,
    ShieldCheckIcon
} from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { LegalSupport } from '../../legal/components/LegalSupport/LegalSupport';
import { CONSULTA_LEGAL_DISPONIVEL } from '../../legal/data/legalConfig';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { criarEstilos } from './PrivacyTermsScreen.styles';

const documentos = __DEV__
    ? Object.fromEntries(
          Object.entries(require('../../legal/data/legalDocuments.json')).map(([id, documento]) => [
              id,
              {
                  ...documento,
                  secoes: documento.secoes.filter(
                      ({ blocos, contatoSuporte }) => blocos.length > 0 || contatoSuporte
                  )
              }
          ])
      )
    : null;

const abas = [
    { id: 'privacy', titulo: 'Privacidade', icone: ShieldCheckIcon },
    { id: 'terms', titulo: 'Termos de uso', icone: FileTextIcon }
];

function LegalDocument({
    documento,
    abertas,
    onAlterarAbertas,
    posicao,
    onRolar,
    Icone,
    estilos,
    corDestaque
}) {
    const { secoes, estadoEditorial } = documento;
    const rolagem = useRef(null);
    const [posicaoInicial] = useState(() => ({ x: 0, y: posicao }));
    const restaurar = useRef(posicaoInicial.y > 0);
    const todasAbertas = abertas.size === secoes.length;

    function alternarSecao(id) {
        onAlterarAbertas((anteriores) => {
            const proximas = new Set(anteriores);
            if (proximas.has(id)) proximas.delete(id);
            else proximas.add(id);
            return proximas;
        });
    }

    function alternarTodas() {
        onAlterarAbertas((anteriores) =>
            anteriores.size === secoes.length ? new Set() : new Set(secoes.map(({ id }) => id))
        );
    }

    return (
        <ScrollView
            ref={rolagem}
            contentContainerStyle={estilos.conteudo}
            contentOffset={posicaoInicial}
            contentInsetAdjustmentBehavior="never"
            testID={`documento-${documento.id}`}
            scrollEventThrottle={16}
            onScroll={({ nativeEvent }) => onRolar(nativeEvent.contentOffset.y)}
            onContentSizeChange={() => {
                if (restaurar.current) {
                    restaurar.current = false;
                    rolagem.current?.scrollTo({ ...posicaoInicial, animated: false });
                }
            }}
        >
            <Text style={estilos.corpo}>
                Conheça seus direitos e consulte como o Aloya trata suas informações e quais
                condições se aplicam ao uso.
            </Text>
            <View style={estilos.identificacao}>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    {documento.titulo}
                </Text>
                {estadoEditorial === 'minuta' && (
                    <Text style={estilos.meta}>
                        Minuta interna · Redação de {documento.dataRedacao}
                    </Text>
                )}
            </View>
            <View style={estilos.resumo}>
                <View style={estilos.linha}>
                    <Icone size={20} color={estilos.tituloResumo.color} accessible={false} />
                    <Text
                        accessibilityRole="header"
                        style={[estilos.tituloResumo, estilos.flexivel]}
                    >
                        Apresentação
                    </Text>
                </View>
                <Text selectable style={estilos.textoResumo}>
                    {documento.resumo}
                </Text>
            </View>
            <View style={estilos.secoes}>
                <View style={estilos.barraSecoes}>
                    <Text accessibilityRole="header" style={estilos.chamada}>
                        Seções do documento
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        onPress={alternarTodas}
                        style={({ pressed }) => [estilos.acao, pressed && estilos.pressionado]}
                    >
                        <Text style={estilos.textoAcao}>
                            {todasAbertas ? 'Recolher tudo' : 'Expandir tudo'}
                        </Text>
                    </Pressable>
                </View>
                {secoes.map((secao, indice) => {
                    const aberta = abertas.has(secao.id);
                    const Chevron = aberta ? CaretUpIcon : CaretDownIcon;
                    return (
                        <View key={secao.id} style={[estilos.secao, aberta && estilos.secaoAberta]}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={secao.titulo}
                                accessibilityState={{ expanded: aberta }}
                                onPress={() => alternarSecao(secao.id)}
                                style={({ pressed }) => [
                                    estilos.linha,
                                    estilos.cabecalhoSecao,
                                    pressed && estilos.pressionado
                                ]}
                            >
                                <Text style={estilos.numero}>{indice + 1}.</Text>
                                <Text style={[estilos.tituloSecao, estilos.flexivel]}>
                                    {secao.titulo}
                                </Text>
                                <Chevron size={18} color={corDestaque} accessible={false} />
                            </Pressable>
                            {aberta && (
                                <View style={estilos.corpoSecao}>
                                    {secao.contatoSuporte && <LegalSupport somenteEndereco />}
                                    {secao.blocos.map(({ enfase, texto }) => (
                                        <Text key={texto} selectable style={estilos.corpo}>
                                            {enfase ? (
                                                <Text style={estilos.enfase}>{enfase} </Text>
                                            ) : null}
                                            {texto}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
            <LegalSupport />
        </ScrollView>
    );
}

function PrivacyTermsScreen({ documentoInicial, onVoltar }) {
    const tema = useTheme();
    const areaSegura = useSafeAreaInsets();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [selecionado, setSelecionado] = useState(
        documentoInicial === 'terms' ? 'terms' : 'privacy'
    );
    const [secoesAbertas, setSecoesAbertas] = useState(() => ({
        privacy: new Set(),
        terms: new Set()
    }));
    const posicoes = useRef({ privacy: 0, terms: 0 });

    if (!CONSULTA_LEGAL_DISPONIVEL) return null;

    const corDestaque = tema.cores.interface.destaque;
    const abaSelecionada = abas.find(({ id }) => id === selecionado);
    return (
        <Modal
            testID="consulta-legal"
            onRequestClose={onVoltar}
            animationType="none"
            statusBarTranslucent
            navigationBarTranslucent
        >
            <View
                style={[
                    estilos.tela,
                    {
                        paddingTop: areaSegura.top,
                        paddingRight: areaSegura.right,
                        paddingBottom: areaSegura.bottom,
                        paddingLeft: areaSegura.left
                    }
                ]}
            >
                <Header
                    titulo="Privacidade e Termos"
                    onVoltar={onVoltar}
                    variante="comVoltar"
                    corFundo={tema.cores.interface.fundo}
                    layoutRefatorado
                />
                <View accessibilityRole="tablist" style={estilos.abas}>
                    {abas.map(({ id, titulo }) => {
                        const ativo = selecionado === id;
                        return (
                            <Pressable
                                key={id}
                                accessibilityRole="tab"
                                accessibilityState={{ selected: ativo }}
                                onPress={() => setSelecionado(id)}
                                style={({ pressed }) => [
                                    estilos.aba,
                                    pressed && estilos.pressionado
                                ]}
                            >
                                <View style={[estilos.rotuloAba, ativo && estilos.abaAtiva]}>
                                    <Text
                                        style={[estilos.textoAba, ativo && estilos.textoAbaAtiva]}
                                    >
                                        {titulo}
                                    </Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
                <LegalDocument
                    key={selecionado}
                    documento={documentos[selecionado]}
                    abertas={secoesAbertas[selecionado]}
                    onAlterarAbertas={(atualizar) =>
                        setSecoesAbertas((anteriores) => ({
                            ...anteriores,
                            [selecionado]: atualizar(anteriores[selecionado])
                        }))
                    }
                    posicao={posicoes.current[selecionado]}
                    onRolar={(y) => {
                        posicoes.current[selecionado] = y;
                    }}
                    Icone={abaSelecionada.icone}
                    estilos={estilos}
                    corDestaque={corDestaque}
                />
            </View>
        </Modal>
    );
}

export { PrivacyTermsScreen };
