/**
 * Estrutura reutilizável das etapas que coletam durações em dias.
 */
import { useState } from 'react';
import { SelectionSheet } from '../../../components/feedback/SelectionSheet/SelectionSheet';
import SelectInput from '../../../components/forms/SelectInput';
import OnboardingStep from './OnboardingStep';

const opcoesDias = Array.from({ length: 60 }, (_, indice) => ({
    id: indice + 1, label: `${indice + 1} dias`
}));

export default function DurationStep({
    etapa, titulo, valor, aoAlterar, aoVoltar, aoAvancar,
    aoPular, carregando
}) {
    const [seletorAberto, setSeletorAberto] = useState(false);

    function selecionar(novoValor) {
        aoAlterar(novoValor);
        setSeletorAberto(false);
    }

    return <>
        <OnboardingStep etapa={etapa} titulo={titulo}
            descricao="Você pode ajustar isso depois com mais calma."
            aoVoltar={aoVoltar} aoAvancar={aoAvancar} aoPular={aoPular}
            podeAvancar={Number.isInteger(valor) && valor > 0}
            carregando={carregando}>
            <SelectInput valor={valor} unidade="dias"
                rotuloAcessibilidade="Selecionar duração em dias"
                aoPressionar={() => setSeletorAberto(true)} />
        </OnboardingStep>
        <SelectionSheet visivel={seletorAberto} titulo="Selecionar duração"
            opcoes={opcoesDias} valorSelecionado={valor}
            onSelecionar={selecionar} onFechar={() => setSeletorAberto(false)} />
    </>;
}
