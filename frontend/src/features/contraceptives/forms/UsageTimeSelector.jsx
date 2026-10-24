import { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { Clock } from 'phosphor-react-native';
import ButtonDashed from '../../../shared/components/common/Button/ButtonDashed';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import TimeInput from '../../../shared/components/forms/TimeInput';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { horarioValido } from '../../../shared/utils/validation/isValidTime';
import { SelectorField } from './SelectorField';
import { estilos } from './contraceptiveForms.styles';

function UsageTimeSelector({ horarios, permiteMultiplos, aberto, onAbrir, onConfirmar, onFechar }) {
    const [temporarios, setTemporarios] = useState(horarios.length ? horarios : ['']);
    const [tentouConfirmar, setTentouConfirmar] = useState(false);
    // Descarta edições canceladas e restaura os horários confirmados ao reabrir.
    useEffect(() => {
        if (aberto) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTemporarios(horarios.length ? horarios : ['']);
            setTentouConfirmar(false);
        }
    }, [aberto, horarios]);

    const resumo = horarios.filter(Boolean).join(', ');
    function atualizar(indice, valor) { setTemporarios((atuais) => atuais.map((item, atual) => atual === indice ? valor : item)); }
    function remover(indice) { setTemporarios((atuais) => atuais.filter((_, atual) => atual !== indice)); }
    function erroHorario(horario) {
        if (!horario) return 'Informe o horário de uso.';
        if (!horarioValido(horario)) return 'Informe um horário válido entre 00:00 e 23:59.';
        if (temporarios.filter((item) => item === horario).length > 1) return 'Não adicione horários repetidos.';
        return null;
    }
    function confirmar() {
        setTentouConfirmar(true);
        if (temporarios.some((horario) => erroHorario(horario))) return;
        onConfirmar(temporarios);
    }

    return (
        <>
            <SelectorField label="Horário" valor={resumo} placeholder="Defina o horário" onPress={onAbrir} navegar icone={Clock} corIcone="#2C4C3B" fundoIcone="#EEF4F0" />
            <Modal visible={aberto} animationType="slide" onRequestClose={onFechar}>
                <View style={estilos.telaFluxo}>
                    <Header titulo="Horários de Uso" variante="comVoltar" onVoltar={onFechar} />
                    <View style={estilos.conteudoFluxo}>
                        <Text style={estilos.descricaoFluxo}>{permiteMultiplos ? 'Defina os horários em que você toma sua pílula.\nVocê pode adicionar mais de um lembrete por dia.' : 'Defina o horário em que você usa seu anticoncepcional.'}</Text>
                        <View style={estilos.listaHorariosFluxo}>
                            {temporarios.map((horario, indice) => {
                                const erro = tentouConfirmar || horario.length >= 5 ? erroHorario(horario) : null;
                                return (
                                    <View key={`${indice}-${temporarios.length}`}>
                                        <TimeInput valor={horario} onChangeText={(valor) => atualizar(indice, valor)} podeRemover={permiteMultiplos && temporarios.length > 1} aoRemover={() => remover(indice)} />
                                        {erro ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={estilos.erroHorario}>{erro}</Text> : null}
                                    </View>
                                );
                            })}
                            {permiteMultiplos ? <ButtonDashed texto="Adicionar horário" aoPressionar={() => setTemporarios((atuais) => [...atuais, ''])} /> : null}
                        </View>
                    </View>
                    <View style={estilos.acaoFixa}><ButtonScreen texto="Confirmar horários" aoPressionar={confirmar} /></View>
                </View>
            </Modal>
        </>
    );
}

export { UsageTimeSelector };
