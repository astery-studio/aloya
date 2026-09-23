import DateInput from '../../../components/forms/DateInput';
import { isValidDate } from '../../../utils/validation/isValidDate';
import OnboardingStep from './OnboardingStep';

export default function BirthDateStep({
    valor, aoAlterar, aoVoltar, aoAvancar, carregando
}) {
    const valida = isValidDate(valor) && (() => {
        const [dia, mes, ano] = valor.split('/').map(Number);
        return new Date(ano, mes - 1, dia) <= new Date();
    })();

    return (
        <OnboardingStep etapa={1} titulo="Qual sua data de nascimento?"
            descricao="Usamos para calcular seu ciclo com mais precisão."
            aoVoltar={aoVoltar} aoAvancar={aoAvancar}
            podeAvancar={valida} carregando={carregando}>
            <DateInput valor={valor} onChangeText={aoAlterar} />
        </OnboardingStep>
    );
}
