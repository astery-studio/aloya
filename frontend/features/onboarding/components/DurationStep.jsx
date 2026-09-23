import OnboardingStep from './OnboardingStep';

export default function DurationStep({
    etapa, titulo, valor, aoAlterar, aoVoltar, aoAvancar,
    aoPular, renderizarSeletor, carregando
}) {
    return (
        <OnboardingStep etapa={etapa} titulo={titulo}
            descricao="Você pode ajustar isso depois com mais calma."
            aoVoltar={aoVoltar} aoAvancar={aoAvancar} aoPular={aoPular}
            podeAvancar={Number.isInteger(valor) && valor > 0}
            carregando={carregando}>
            {renderizarSeletor?.({ valor, aoAlterar, unidade: 'dias' })}
        </OnboardingStep>
    );
}
