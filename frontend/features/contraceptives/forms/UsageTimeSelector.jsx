import { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { Clock } from 'phosphor-react-native';
import ButtonDashed from '../../../components/common/Button/ButtonDashed';
import ButtonScreen from '../../../components/common/Button/ButtonScreen';
import TimeInput from '../../../components/forms/TimeInput';
import { Header } from '../../../components/navigation/Header/Header';
import { SelectorField } from './SelectorField';
import { estilos } from './contraceptiveForms.styles';

function UsageTimeSelector({ horarios, permiteMultiplos, aberto, onAbrir, onConfirmar, onFechar }) {
    const [temporarios, setTemporarios] = useState(horarios.length ? horarios : ['']);
    useEffect(() => { if (aberto) setTemporarios(horarios.length ? horarios : ['']); }, [aberto, horarios]);

    const resumo = horarios.filter(Boolean).join(', ');
    function atualizar(indice, valor) { setTemporarios((atuais) => atuais.map((item, atual) => atual === indice ? valor : item)); }
    function remover(indice) { setTemporarios((atuais) => atuais.filter((_, atual) => atual !== indice)); }

    return (
        <>
            <SelectorField label="Horário" valor={resumo} placeholder="Defina o horário" onPress={onAbrir} navegar icone={Clock} corIcone="#2C4C3B" fundoIcone="#EEF4F0" />
            <Modal visible={aberto} animationType="slide" onRequestClose={onFechar}>
                <View style={estilos.telaFluxo}>
                    <Header titulo="Horários de Uso" variante="comVoltar" onVoltar={onFechar} />
                    <View style={estilos.conteudoFluxo}>
                        <Text style={estilos.descricaoFluxo}>{permiteMultiplos ? 'Defina os horários em que você toma sua pílula.\nVocê pode adicionar mais de um lembrete por dia.' : 'Defina o horário em que você usa seu anticoncepcional.'}</Text>
                        <View style={estilos.listaHorariosFluxo}>
                            {temporarios.map((horario, indice) => <TimeInput key={`${indice}-${temporarios.length}`} valor={horario} onChangeText={(valor) => atualizar(indice, valor)} podeRemover={permiteMultiplos && temporarios.length > 1} aoRemover={() => remover(indice)} />)}
                            {permiteMultiplos ? <ButtonDashed texto="Adicionar horário" aoPressionar={() => setTemporarios((atuais) => [...atuais, ''])} /> : null}
                        </View>
                    </View>
                    <View style={estilos.acaoFixa}><ButtonScreen texto="Confirmar horários" aoPressionar={() => onConfirmar(temporarios)} /></View>
                </View>
            </Modal>
        </>
    );
}

export { UsageTimeSelector };
