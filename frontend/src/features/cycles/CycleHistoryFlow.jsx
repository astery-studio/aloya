//Conecta o serviço e os estados do histórico à tela visual sem misturar rede com interface.
import {useState} from 'react'
import {useCycleHistory} from './hooks/useCycleHistory'
import {CycleHistoryScreen} from './screens/CycleHistoryScreen'
import {RemoveMenstruationModal} from './components/RemoveMenstruationModal'
import {useCycleRemoval} from './hooks/useCycleRemoval'

//Organiza o fluxo real do histórico usando o resumo calculado pelo backend.
function CycleHistoryFlow({
    service,
    aoAbrirCalendario,
    aoEditarCiclo,
    onSelecionarAba,
    onSessaoExpirada
}) {
    const historico = useCycleHistory({
        service,
        onSessaoExpirada
    })
    const [cicloParaExcluir, setCicloParaExcluir] = useState(null)
    const remocao = useCycleRemoval({
        service,
        aoAtualizar: async () => {
            const atualizado = await historico.tentarNovamente()
            if (!atualizado) throw new Error('O histórico não foi atualizado.')
        },
        onSessaoExpirada
    })

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
            aoEditarCiclo={aoEditarCiclo}
            aoExcluirCiclo={ciclo => { remocao.limparFeedback(); setCicloParaExcluir(ciclo) }}
            onSelecionarAba={onSelecionarAba}
        />
        <RemoveMenstruationModal
            modo="cicloCompleto" visivel={Boolean(cicloParaExcluir)} ciclo={cicloParaExcluir}
            carregando={Boolean(remocao.operacao)} erro={remocao.erro}
            erroAtualizacao={remocao.erroAtualizacao} sucesso={remocao.sucesso}
            onExcluirCiclo={ciclo => remocao.excluirCiclo({cicloId: ciclo.id})}
            onFechar={() => setCicloParaExcluir(null)}
        />
        </>
    )
}

export {CycleHistoryFlow}
