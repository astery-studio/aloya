//Conecta o serviço e os estados do histórico à tela visual sem misturar rede com interface.
import {useMemo} from 'react'

import {useCycleHistory} from './hooks/useCycleHistory'
import {CycleHistoryScreen} from './screens/CycleHistoryScreen'

//Organiza o fluxo real do histórico e mantém os cálculos estatísticos substituíveis.
function CycleHistoryFlow({
    service,
    resumo,
    aoAbrirCalendario,
    aoEditarCiclo,
    aoExcluirCiclo,
    onSelecionarAba,
    onSessaoExpirada
}) {
    const historico = useCycleHistory({
        service,
        onSessaoExpirada
    })

    const resumoDaTela = useMemo(() => ({
        ...(resumo && typeof resumo === 'object' ? resumo : {}),
        quantidadeCiclos: historico.quantidadeCiclos
    }), [historico.quantidadeCiclos, resumo])

    return (
        <CycleHistoryScreen
            ciclos={historico.ciclos}
            resumo={resumoDaTela}
            carregando={historico.carregando}
            carregandoMais={historico.carregandoMais}
            erro={historico.erro}
            erroCarregarMais={historico.erroCarregarMais}
            temMais={historico.temMais}
            aoTentarNovamente={historico.tentarNovamente}
            aoCarregarMais={historico.carregarMais}
            aoTentarCarregarMais={historico.tentarCarregarMais}
            aoAbrirCalendario={aoAbrirCalendario}
            aoEditarCiclo={aoEditarCiclo}
            aoExcluirCiclo={aoExcluirCiclo}
            onSelecionarAba={onSelecionarAba}
        />
    )
}

export {CycleHistoryFlow}