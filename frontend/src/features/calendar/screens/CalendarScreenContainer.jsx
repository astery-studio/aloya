// Conecta a tela ao serviço autenticado e ao estado controlado pelo hook.
import { useMemo } from 'react';
import { CalendarScreen } from './CalendarScreen';
import { obterChaveMes, useCalendar } from '../hooks/useCalendar';

function CalendarScreenContainer({
    service,
    onSessaoExpirada,
    somenteLeitura = false,
    aoCadastrarMenstruacao,
    aoEditarCiclo,
    statusSincronizacao,
    erroSincronizacao,
    aoTentarSincronizar,
    onSelecionarAba,
    abasDisponiveis
}) {
    const estado = useCalendar({ service, onSessaoExpirada, somenteLeitura });
    const chaveMesAtual = useMemo(() => obterChaveMes(), []);
    const calendarioAtual = estado.meses.find((mes) => mes.mes === chaveMesAtual);
    const confianca = calendarioAtual?.previsao?.nivelConfianca ?? null;

    return (
        <CalendarScreen
            somenteLeitura={somenteLeitura}
            permitePrevisoes={!somenteLeitura || estado.permitePrevisoes}
            statusSincronizacao={statusSincronizacao}
            erroSincronizacao={erroSincronizacao}
            aoTentarSincronizar={aoTentarSincronizar}
            meses={estado.meses}
            confianca={confianca}
            carregando={estado.carregando}
            carregandoAnteriores={estado.carregandoAnteriores}
            carregandoPosteriores={estado.carregandoPosteriores}
            erro={estado.erro}
            aoCarregarAnteriores={estado.carregarAnteriores}
            aoCarregarPosteriores={estado.carregarPosteriores}
            aoTentarNovamente={estado.tentarNovamente}
            aoCadastrarMenstruacao={aoCadastrarMenstruacao}
            aoEditarCiclo={aoEditarCiclo}
            onSelecionarAba={onSelecionarAba}
            abasDisponiveis={abasDisponiveis}
        />
    );
}

export { CalendarScreenContainer };
export default CalendarScreenContainer;
