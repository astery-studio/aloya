/**
 * Etapa que recebe o período da última menstruação em um calendário inline.
 */
import MenstruationCalendar from './MenstruationCalendar';
import OnboardingStep from './OnboardingStep';

export default function LastMenstruationStep({
    valor, aoAlterar, aoVoltar, aoAvancar, carregando
}) {
    return (
        <OnboardingStep etapa={2} titulo="Quando foi sua última menstruação?"
            descricao="Selecione o primeiro dia ou todos os dias do período."
            aoVoltar={aoVoltar} aoAvancar={aoAvancar}
            podeAvancar={Boolean(valor?.inicio)} carregando={carregando}>
            <MenstruationCalendar valor={valor} aoAlterar={aoAlterar} />
        </OnboardingStep>
    );
}
