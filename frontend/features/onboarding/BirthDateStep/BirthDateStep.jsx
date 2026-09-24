/**
 * Etapa que coleta a data de nascimento e habilita avanço após preenchimento.
 */
import { Text, View } from 'react-native';
import DateInput from '../../../components/forms/DateInput';
import EmailInput from '../../../components/forms/EmailInput';
import { cores, typography } from '../../../theme';
import OnboardingStep from '../OnboardingStep/OnboardingStep';

export default function BirthDateStep({
    valor, aoAlterar, aoVoltar, aoAvancar, carregando,
    menorDe16 = false, emailResponsavelLegal = '', aoAlterarEmailResponsavel,
    erroEmailResponsavel
}) {
    return (
        <OnboardingStep etapa={1} titulo="Qual sua data de nascimento?"
            descricao="Usamos para calcular seu ciclo com mais precisão."
            aoVoltar={aoVoltar} aoAvancar={aoAvancar}
            podeAvancar={valor.length === 10} carregando={carregando}>
            <View style={{ gap: 12 }}>
                <DateInput valor={valor} onChangeText={aoAlterar} />
                {menorDe16 ? <>
                    <EmailInput
                        label="E-mail do responsável legal (opcional)"
                        placeholder="E-mail do responsável legal (opcional)"
                        value={emailResponsavelLegal}
                        erro={erroEmailResponsavel}
                        onChangeText={aoAlterarEmailResponsavel}
                    />
                    <Text style={{
                        ...typography.caption,
                        color: cores.neutras.textoSecundarioClaro
                    }}>
                        Informe apenas se quiser desbloquear a Rede de Apoio agora.
                        Você também poderá fazer isso depois.
                    </Text>
                </> : null}
            </View>
        </OnboardingStep>
    );
}
