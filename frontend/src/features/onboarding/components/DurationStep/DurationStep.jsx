/**
 * Estrutura reutilizável das etapas que coletam durações em dias.
 */
import { useState } from 'react';
import NumberInput from '../../../../shared/components/forms/NumberInput/NumberInput';
import { useTheme } from '../../../../shared/hooks/useTheme';
import OnboardingStep from '../OnboardingStep/OnboardingStep';

export default function DurationStep({
    etapa, titulo, valor, aoAlterar, aoVoltar, aoAvancar,
    aoPular, carregando, erro
}) {
    const tema = useTheme();
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
            podeAvancar={selecionado && Number.isInteger(valor) && valor > 0}
            carregando={carregando} erro={erro}>
            <NumberInput valor={valor} aoAlterar={alterar} unidade="dias"
                estilo={{ borderColor: tema.cores.marca.primaria }} />
        </OnboardingStep>
    );
}
