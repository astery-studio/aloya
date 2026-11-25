import { useMemo, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileTextIcon } from 'phosphor-react-native/src/icons/FileText';

import { ShieldCheckIcon } from '../../../../shared/components/icons/AppIcons';
import { Header } from '../../../../shared/components/navigation/Header/Header';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { LegalDocument } from '../../components/LegalDocument/LegalDocument';
import { LegalTabs } from '../../components/LegalTabs/LegalTabs';
import { CONSULTA_LEGAL_DISPONIVEL } from '../../data/legalConfig';
import { documentosLegais, normalizarDocumentoInicial } from '../../utils/legalDocuments';
import { criarEstilos } from './PrivacyTermsScreen.styles';

const iconesDocumento = { privacy: ShieldCheckIcon, terms: FileTextIcon };

function PrivacyTermsScreen({ documentoInicial, onVoltar }) {
    const tema = useTheme();
    const areaSegura = useSafeAreaInsets();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [selecionado, setSelecionado] = useState(() =>
        normalizarDocumentoInicial(documentoInicial)
    );
    const [secoesAbertas, setSecoesAbertas] = useState(() => ({
        privacy: new Set(),
        terms: new Set()
    }));
    const posicoes = useRef({ privacy: 0, terms: 0 });

    if (!CONSULTA_LEGAL_DISPONIVEL) return null;

    const IconeDocumento = iconesDocumento[selecionado];
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
                <LegalTabs selecionado={selecionado} onSelecionar={setSelecionado} />
                <LegalDocument
                    key={selecionado}
                    documento={documentosLegais[selecionado]}
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
                    Icone={IconeDocumento}
                />
            </View>
        </Modal>
    );
}

export { PrivacyTermsScreen };
