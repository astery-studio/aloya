import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileTextIcon } from 'phosphor-react-native/src/icons/FileText';

import { ShieldCheckIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { LegalDocument } from '../../legal/components/LegalDocument/LegalDocument';
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
                />
            </View>
        </Modal>
    );
}

export { PrivacyTermsScreen };
