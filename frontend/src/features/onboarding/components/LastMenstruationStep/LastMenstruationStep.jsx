/**
 * Etapa que recebe o período da última menstruação em um calendário inline.
 */
import MenstruationCalendar from '../MenstruationCalendar/MenstruationCalendar';
import OnboardingStep from '../OnboardingStep/OnboardingStep';

export default function LastMenstruationStep({
    valor, aoAlterar, aoVoltar, aoAvancar, aoNaoSei, carregando, erro
}) {
    return (
        <OnboardingStep etapa={2} titulo="Quando foi sua última menstruação?"
            descricao="Selecione o primeiro dia ou todos os dias do período."
            cabecalhoFixo
            aoVoltar={aoVoltar} aoAvancar={aoAvancar}
            acaoSecundaria={{ texto: 'Não sei', aoPressionar: aoNaoSei }}
            podeAvancar={Boolean(valor?.inicio)} carregando={carregando} erro={erro}>
            <MenstruationCalendar valor={valor} aoAlterar={aoAlterar} />
        </OnboardingStep>
    );
}
