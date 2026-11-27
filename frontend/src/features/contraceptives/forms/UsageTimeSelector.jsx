import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ContraceptiveModal } from '../components/ContraceptiveModal';
import { Clock } from 'phosphor-react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import TimeInput from '../../../shared/components/forms/TimeInput';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { useTheme } from '../../../shared/hooks/useTheme';
import { horarioValido } from '../../../shared/utils/validation/isValidTime';
import { SelectorField } from './SelectorField';
import { criarEstilos } from './contraceptiveForms.styles';

function UsageTimeSelector({
    aparenciaCadastro = false,
    horarios,
    aberto,
    onAbrir,
    onConfirmar,
    onFechar
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
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
    function atualizar(indice, valor) {
        setTemporarios((atuais) => atuais.map((item, atual) => (atual === indice ? valor : item)));
    }
    function remover(indice) {
        setTemporarios((atuais) => atuais.filter((_, atual) => atual !== indice));
    }
    function erroHorario(horario) {
        if (!horario) return 'Informe o horário de uso.';
        if (!horarioValido(horario)) return 'Informe um horário válido entre 00:00 e 23:59.';
        if (temporarios.filter((item) => item === horario).length > 1)
            return 'Não adicione horários repetidos.';
        return null;
    }
    function confirmar() {
        setTentouConfirmar(true);
        if (temporarios.length !== 1 || temporarios.some((horario) => erroHorario(horario))) return;
        onConfirmar(temporarios);
    }

    return (
        <>
            <SelectorField
                aparenciaCadastro={aparenciaCadastro}
                label="Horário"
                valor={resumo}
                placeholder="Defina o horário"
                onPress={onAbrir}
                navegar
                icone={Clock}
                coresNoturnas={{ icone: '#A5D6A7', caixa: 'rgba(165, 214, 167, 0.16)' }}
                corIcone="#2C4C3B"
                fundoIcone="#EEF4F0"
            />
            <ContraceptiveModal visible={aberto} animationType="slide" onRequestClose={onFechar}>
                <SafeAreaView
                    style={estilos.telaFluxo}
                    edges={['top', 'left', 'right', 'bottom']}
                    testID="horarios-anticoncepcional-area-segura"
                >
                    <Header
                        titulo="Horário de Uso"
                        variante="comVoltar"
                        onVoltar={onFechar}
                        aplicarSafeAreaSuperior={false}
                    />
                    <View style={[estilos.conteudoFluxo, estilos.areaHorarios]}>
                        <Text style={estilos.descricaoFluxo}>
                            {temporarios.length > 1
                                ? 'Este anticoncepcional aceita um horário. Remova os outros para manter o horário de sua escolha.'
                                : 'Defina o horário em que você usa seu anticoncepcional.'}
                        </Text>
                        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={estilos.listaHorariosFluxo}>
                            {temporarios.map((horario, indice) => {
                                const erro =
                                    tentouConfirmar || horario.length >= 5
                                        ? erroHorario(horario)
                                        : null;
                                return (
                                    <View key={`${indice}-${temporarios.length}`}>
                                        <TimeInput
                                            valor={horario}
                                            onChangeText={(valor) => atualizar(indice, valor)}
                                            podeRemover={temporarios.length > 1}
                                            aoRemover={() => remover(indice)}
                                        />
                                        {erro ? (
                                            <Text
                                                accessibilityRole="alert"
                                                accessibilityLiveRegion="polite"
                                                style={estilos.erroHorario}
                                            >
                                                {erro}
                                            </Text>
                                        ) : null}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                    <View style={estilos.acaoFixa}>
                        <ButtonScreen texto="Confirmar horário" desativado={temporarios.length > 1} aoPressionar={confirmar} />
                    </View>
                </SafeAreaView>
            </ContraceptiveModal>
        </>
    );
}

export { UsageTimeSelector };
