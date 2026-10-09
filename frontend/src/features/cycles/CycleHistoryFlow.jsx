//Conecta o serviço e os estados do histórico à tela visual sem misturar rede com interface.
import {useCycleHistory} from './hooks/useCycleHistory'
import {CycleHistoryScreen} from './screens/CycleHistoryScreen'

//Organiza o fluxo real do histórico usando o resumo calculado pelo backend.
function CycleHistoryFlow({
    service,
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

    return (
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
            aoEditarCiclo={aoEditarCiclo}
            aoExcluirCiclo={aoExcluirCiclo}
            onSelecionarAba={onSelecionarAba}
        />
    )
}

export {CycleHistoryFlow}