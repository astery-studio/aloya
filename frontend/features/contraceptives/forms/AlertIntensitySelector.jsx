import { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { Bell } from 'phosphor-react-native';
import ButtonScreen from '../../../components/common/Button/ButtonScreen';
import { ButtonSelection } from '../../../components/common/Button/ButtonSelection/ButtonSelection';
import { Header } from '../../../components/navigation/Header/Header';
import { INTENSIDADES_ALERTA } from '../constants/contraceptiveOptions';
import { SelectorField } from './SelectorField';
import { estilos } from './contraceptiveForms.styles';

function AlertIntensitySelector({ valor, aberto, onAbrir, onSelecionar, onFechar }) {
    const [temporario, setTemporario] = useState(valor || 'critico');
    const selecionada = INTENSIDADES_ALERTA.find((item) => item.id === (valor || 'critico'));
    useEffect(() => { if (aberto) setTemporario(valor || 'critico'); }, [aberto, valor]);

    return (
        <>
            <SelectorField label="Intensidade do Alerta" valor={selecionada?.label} placeholder="Crítico" onPress={onAbrir} navegar icone={Bell} />
            <Modal visible={aberto} animationType="slide" onRequestClose={onFechar}>
                <View style={estilos.telaFluxo}>
                    <Header titulo="Intensidade do Alerta" variante="comVoltar" onVoltar={onFechar} />
                    <View style={estilos.conteudoFluxo}>
                        <Text style={estilos.descricaoFluxo}>Escolha como quer ser lembrada de tomar seu anticoncepcional.</Text>
                        <View style={estilos.opcoesIntensidade}>
                            {INTENSIDADES_ALERTA.map((opcao) => {
                                const ativa = opcao.id === temporario;
                                return <ButtonSelection key={opcao.id} label={opcao.label} descricao={opcao.descricao} selected={ativa} onPress={() => setTemporario(opcao.id)} variante="intensidade" />;
                            })}
                        </View>
                    </View>
                    <View style={estilos.acaoFixa}><ButtonScreen texto="Confirmar" aoPressionar={() => onSelecionar(temporario)} /></View>
                </View>
            </Modal>
        </>
    );
}

export { AlertIntensitySelector };
