/**
 * Estrutura reutilizável das etapas que coletam durações em dias.
 */
import { useState } from 'react';
import NumberInput from '../../../../shared/components/forms/NumberInput/NumberInput';
import OnboardingStep from '../OnboardingStep/OnboardingStep';

export default function DurationStep({
    etapa, titulo, valor, aoAlterar, aoVoltar, aoAvancar,
    aoPular, carregando, erro
}) {
    const [selecionado, setSelecionado] = useState(false);
    const cicloComOpcaoNaoSei = Boolean(aoPular);
    const alterar = (novoValor) => {
        setSelecionado(true);
        aoAlterar?.(novoValor);
    };

    return (
        <OnboardingStep etapa={etapa} titulo={titulo}
            descricao="Você pode ajustar isso depois com mais calma."
            aoVoltar={aoVoltar} aoAvancar={aoAvancar}
            acaoSecundaria={cicloComOpcaoNaoSei && !selecionado
                ? { texto: 'Não sei', aoPressionar: aoPular } : null}
            podeAvancar={Number.isInteger(valor) && valor > 0}
            carregando={carregando} erro={erro}>
            <NumberInput valor={valor} aoAlterar={alterar} unidade="dias" />
        </OnboardingStep>
    );
}
