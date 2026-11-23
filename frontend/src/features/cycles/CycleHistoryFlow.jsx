// O Histórico solicita confirmação direta para excluir o ciclo completo.
import { useState } from 'react';
import { CycleEditFlow } from './CycleEditFlow';
import { useCycleHistory } from './hooks/useCycleHistory';
import { CycleHistoryScreen } from './screens/CycleHistoryScreen';
import { CycleRemovalFeedbackModal } from './components/CycleRemovalFeedbackModal';
import { useCycleRemoval } from './hooks/useCycleRemoval';
import { obterPeriodo } from './utils/cycleRemovalPresentation';

function CycleHistoryFlow({ service, aoAbrirCalendario, onSelecionarAba, onSessaoExpirada }) {
    const historico = useCycleHistory({ service, onSessaoExpirada });
    const [cicloEditado, setCicloEditado] = useState(null);
    const [cicloParaExcluir, setCicloParaExcluir] = useState(null);
    const [alerta, setAlerta] = useState('confirmacao');
    const remocao = useCycleRemoval({
        service,
        aoAtualizar: async () => {
            const atualizado = await historico.tentarNovamente();
            if (!atualizado) throw new Error('O histórico não foi atualizado.');
        },
        onSessaoExpirada
    });

    function abrirRemocao(ciclo) {
        remocao.limparFeedback();
        setAlerta('confirmacao');
        setCicloParaExcluir(ciclo);
    }

    function fecharRemocao() {
        if (remocao.operacao) return;
        setCicloParaExcluir(null);
        remocao.limparFeedback();
    }

    async function excluirCiclo() {
        if (!cicloParaExcluir || alerta === 'sucesso-excluir') return;
        const resultado = await remocao.excluirCiclo({ cicloId: cicloParaExcluir.id });
        if (resultado.motivo === 'OPERACAO_EM_ANDAMENTO') return;
        setAlerta(resultado.sucesso ? 'sucesso-excluir' : 'erro');
    }

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
                aoExcluirCiclo={abrirRemocao}
                onSelecionarAba={onSelecionarAba}
            />
            <CycleRemovalFeedbackModal
                visivel={Boolean(cicloParaExcluir)}
                tipo={alerta}
                periodo={obterPeriodo(cicloParaExcluir)}
                carregando={remocao.excluindoCiclo}
                onConfirmar={excluirCiclo}
                onCancelar={fecharRemocao}
                onTentarNovamente={excluirCiclo}
                onFechar={fecharRemocao}
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
