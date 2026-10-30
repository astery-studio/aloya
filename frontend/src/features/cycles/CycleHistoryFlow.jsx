//Conecta os dados do histórico ao fluxo reutilizável de edição.
import { useState } from 'react';

import { CycleEditFlow } from './CycleEditFlow';
import { useCycleHistory } from './hooks/useCycleHistory';
import { CycleHistoryScreen } from './screens/CycleHistoryScreen';

function CycleHistoryFlow({
    service,
    aoAbrirCalendario,
    aoExcluirCiclo,
    onSelecionarAba,
    onSessaoExpirada
}) {
    const historico = useCycleHistory({ service, onSessaoExpirada });
    const [cicloEditado, setCicloEditado] = useState(null);

    return (
        <>
            <CycleHistoryScreen
                ciclos={historico.ciclos}
                resumo={historico.resumo}
                carregando={historico.carregando}
                carregandoMais={historico.carregandoMais}
                erro={historico.erro}
                erroCarregarMais={historico.erroCarregarMais}
                temMais={historico.temMais}
                aoTentarNovamente={historico.tentarNovamente}
                aoCarregarMais={historico.carregarMais}
                aoTentarCarregarMais={historico.tentarCarregarMais}
                aoAbrirCalendario={aoAbrirCalendario}
                aoEditarCiclo={setCicloEditado}
                aoExcluirCiclo={aoExcluirCiclo}
                onSelecionarAba={onSelecionarAba}
            />

            {cicloEditado ? (
                <CycleEditFlow
                    key={cicloEditado.id}
                    ciclo={cicloEditado}
                    service={service}
                    onFechar={() => setCicloEditado(null)}
                    onAtualizado={historico.tentarNovamente}
                    onSessaoExpirada={onSessaoExpirada}
                />
            ) : null}
        </>
    );
}

export { CycleHistoryFlow };
