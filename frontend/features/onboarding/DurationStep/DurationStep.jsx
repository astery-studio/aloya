/**
 * Estrutura reutilizável das etapas que coletam durações em dias.
 */
import NumberInput from '../../../components/forms/NumberInput/NumberInput';
import OnboardingStep from '../OnboardingStep/OnboardingStep';

export default function DurationStep({
    etapa, titulo, valor, aoAlterar, aoVoltar, aoAvancar,
    aoPular, carregando
}) {
    return (
        <OnboardingStep etapa={etapa} titulo={titulo}
            descricao="Você pode ajustar isso depois com mais calma."
            aoVoltar={aoVoltar} aoAvancar={aoAvancar} aoPular={aoPular}
            podeAvancar={Number.isInteger(valor) && valor > 0}
            carregando={carregando}>
            <NumberInput valor={valor} aoAlterar={aoAlterar} unidade="Dias" />
        </OnboardingStep>
    );
}
