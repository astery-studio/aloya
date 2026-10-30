import { useEffect, useMemo, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'phosphor-react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { ButtonSelection } from '../../../shared/components/common/Button/ButtonSelection/ButtonSelection';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { useTheme } from '../../../shared/hooks/useTheme';
import { INTENSIDADES_ALERTA } from '../constants/contraceptiveOptions';
import { SelectorField } from './SelectorField';
import { criarEstilos } from './contraceptiveForms.styles';

function AlertIntensitySelector({ valor, aberto, onAbrir, onSelecionar, onFechar }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [temporario, setTemporario] = useState(valor || 'critico');
    const selecionada = INTENSIDADES_ALERTA.find((item) => item.id === (valor || 'critico'));
    // Reabre o modal sempre com o último valor confirmado pelo formulário.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (aberto) setTemporario(valor || 'critico');
    }, [aberto, valor]);

    return (
        <>
            <SelectorField
                label="Intensidade do Alerta"
                valor={selecionada?.label}
                placeholder="Crítico"
                onPress={onAbrir}
                navegar
                icone={Bell}
            />
            <Modal visible={aberto} animationType="slide" onRequestClose={onFechar}>
                <SafeAreaView style={estilos.telaFluxo} edges={['top', 'left', 'right', 'bottom']}
                    testID="intensidade-anticoncepcional-area-segura">
                    <Header
                        titulo="Intensidade do Alerta"
                        variante="comVoltar"
                        onVoltar={onFechar}
                    />
                    <View style={estilos.conteudoFluxo}>
                        <Text style={estilos.descricaoFluxo}>
                            Escolha como quer ser lembrada de tomar seu anticoncepcional.
                        </Text>
                        <View style={estilos.opcoesIntensidade}>
                            {INTENSIDADES_ALERTA.map((opcao) => {
                                const ativa = opcao.id === temporario;
                                return (
                                    <ButtonSelection
                                        key={opcao.id}
                                        label={opcao.label}
                                        descricao={opcao.descricao}
                                        selected={ativa}
                                        onPress={() => setTemporario(opcao.id)}
                                        variante="intensidade"
                                    />
                                );
                            })}
                        </View>
                    </View>
                    <View style={estilos.acaoFixa}>
                        <ButtonScreen
                            texto="Confirmar"
                            aoPressionar={() => onSelecionar(temporario)}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
}

export { AlertIntensitySelector };
