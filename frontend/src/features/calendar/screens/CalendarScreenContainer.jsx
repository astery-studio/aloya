// Conecta a tela ao serviço autenticado e ao estado controlado pelo hook.
import {useMemo, useState} from 'react'
import {CalendarScreen} from './CalendarScreen'
import {obterChaveMes, useCalendar} from '../hooks/useCalendar'
import {RemoveMenstruationModal} from '../../cycles/components/RemoveMenstruationModal'
import {useCycleRemoval} from '../../cycles/hooks/useCycleRemoval'

function CalendarScreenContainer({
    service,
    onSessaoExpirada,
    aoVoltar,
    aoCadastrarMenstruacao
}) {
    const estado = useCalendar({service, onSessaoExpirada})
    const [remocaoVisivel, setRemocaoVisivel] = useState(false)
    const remocao = useCycleRemoval({service, aoAtualizar: estado.recarregarMeses, onSessaoExpirada})
    const chaveMesAtual = useMemo(() => obterChaveMes(), [])
    const calendarioAtual = estado.meses.find(mes => mes.mes === chaveMesAtual)
    const confianca = calendarioAtual?.previsao?.nivelConfianca ?? null

    return (
        <>
        <CalendarScreen
            meses={estado.meses}
            confianca={confianca}
            carregando={estado.carregando}
            carregandoAnteriores={estado.carregandoAnteriores}
            carregandoPosteriores={estado.carregandoPosteriores}
            erro={estado.erro}
            aoCarregarAnteriores={estado.carregarAnteriores}
            aoCarregarPosteriores={estado.carregarPosteriores}
            aoTentarNovamente={estado.tentarNovamente}
            aoVoltar={aoVoltar}
            aoCadastrarMenstruacao={aoCadastrarMenstruacao}
            aoRemoverDia={dia => {
                remocao.limparFeedback()
                setRemocaoVisivel(true)
                remocao.removerDia({cicloId: dia.registroCicloId, data: dia.data})
            }}
        />
        <RemoveMenstruationModal
            modo="dia" visivel={remocaoVisivel} meses={estado.meses}
            carregando={Boolean(remocao.operacao)} erro={remocao.erro}
            erroAtualizacao={remocao.erroAtualizacao} sucesso={remocao.sucesso}
            onRemoverDia={dia => remocao.removerDia({cicloId: dia.registroCicloId, data: dia.data})}
            onFechar={() => setRemocaoVisivel(false)}
        />
        </>
    )
}

export {CalendarScreenContainer}
export default CalendarScreenContainer
