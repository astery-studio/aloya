import { useCycleHistory } from '../../../cycles/hooks/useCycleHistory';
import { CycleHistoryScreen } from '../../../cycles/screens/CycleHistoryScreen';

function SharedCycleHistoryScreen({ nomeTitular, service, onVoltar, onSessaoExpirada }) {
    const { carregarMais, tentarNovamente, tentarCarregarMais, ...historico } = useCycleHistory({
        service,
        onSessaoExpirada,
        historicoCompartilhado: true
    });

    return (
        <CycleHistoryScreen
            {...historico}
            nomeTitular={nomeTitular}
            somenteLeitura
            aoCarregarMais={carregarMais}
            aoTentarNovamente={tentarNovamente}
            aoTentarCarregarMais={tentarCarregarMais}
            onVoltar={onVoltar}
        />
    );
}

export { SharedCycleHistoryScreen };
