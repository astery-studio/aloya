import DateInput from '../../../components/forms/DateInput';
import OnboardingStep from './OnboardingStep';

export default function BirthDateStep({
    valor, aoAlterar, aoVoltar, aoAvancar, carregando
}) {
    return (
        <OnboardingStep etapa={1} titulo="Qual sua data de nascimento?"
            descricao="Usamos para calcular seu ciclo com mais precisão."
            aoVoltar={aoVoltar} aoAvancar={aoAvancar}
            podeAvancar={valor.length === 10} carregando={carregando}>
            <DateInput valor={valor} onChangeText={aoAlterar} />
        </OnboardingStep>
    );
}
