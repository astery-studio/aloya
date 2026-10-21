// Conecta a tela ao serviço autenticado e ao estado controlado pelo hook.
import {useMemo} from 'react'
import {CalendarScreen} from './CalendarScreen'
import {obterChaveMes, useCalendar} from '../hooks/useCalendar'

function CalendarScreenContainer({
    service,
    onSessaoExpirada,
    aoVoltar,
    aoCadastrarMenstruacao
}) {
    const estado = useCalendar({service, onSessaoExpirada})
    const chaveMesAtual = useMemo(() => obterChaveMes(), [])
    const calendarioAtual = estado.meses.find(mes => mes.mes === chaveMesAtual)
    const confianca = calendarioAtual?.previsao?.nivelConfianca ?? null

    return (
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
        />
    )
}

export {CalendarScreenContainer}
export default CalendarScreenContainer
