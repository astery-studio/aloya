// Conecta a tela de calendário à consulta autenticada e à remoção imediata de um dia.
import { useState } from 'react';
import { CalendarScreen } from './CalendarScreen';
import { obterChaveMes, useCalendar } from '../hooks/useCalendar';
import AlertModal from '../../../shared/components/feedback/Modal/AlertModal/AlertModal';
import { useCycleRemoval } from '../../cycles/hooks/useCycleRemoval';

function CalendarScreenContainer({ service, onSessaoExpirada, aoVoltar, aoCadastrarMenstruacao }) {
    const estado = useCalendar({ service, onSessaoExpirada });
    const [alerta, setAlerta] = useState(null);
    const [diaComFalha, setDiaComFalha] = useState(null);
    const remocao = useCycleRemoval({
        service,
        aoAtualizar: estado.recarregarMeses,
        onSessaoExpirada
    });
    const chaveMesAtual = obterChaveMes();

    const removerDia = async (dia) => {
        remocao.limparFeedback();
        const resultado = await remocao.removerDia({
            cicloId: dia.registroCicloId,
            data: dia.data
        });
        if (resultado.sucesso) {
            setDiaComFalha(null);
            setAlerta('sucesso');
        } else {
            setDiaComFalha(dia);
            setAlerta('erro');
        }
    };

    const tentarNovamente = async () => {
        if (!diaComFalha) return;
        const resultado = await remocao.removerDia({
            cicloId: diaComFalha.registroCicloId,
            data: diaComFalha.data
        });
        if (resultado.sucesso) {
            setDiaComFalha(null);
            setAlerta('sucesso');
        }
    };

    return (
        <>
            <CalendarScreen
                meses={estado.meses}
                confianca={
                    estado.meses.find((mes) => mes.mes === chaveMesAtual)?.previsao
                        ?.nivelConfianca ?? null
                }
                carregando={estado.carregando}
                carregandoAnteriores={estado.carregandoAnteriores}
                carregandoPosteriores={estado.carregandoPosteriores}
                erro={estado.erro}
                aoCarregarAnteriores={estado.carregarAnteriores}
                aoCarregarPosteriores={estado.carregarPosteriores}
                aoTentarNovamente={estado.tentarNovamente}
                aoVoltar={aoVoltar}
                aoCadastrarMenstruacao={aoCadastrarMenstruacao}
                aoRemoverDia={removerDia}
            />
            <AlertModal
                visivel={Boolean(alerta)}
                titulo={alerta === 'erro' ? 'Algo deu errado' : 'Registro removido'}
                mensagem={
                    alerta === 'erro'
                        ? 'Ocorreu um erro ao excluir este registro. Tente novamente.'
                        : 'Registro de menstruação excluído com sucesso.'
                }
                aoFechar={() => {
                    setAlerta(null);
                    remocao.limparFeedback();
                }}
                acaoPrincipal={
                    alerta === 'erro'
                        ? {
                              texto: 'Tentar novamente',
                              variante: 'preto',
                              aoPressionar: tentarNovamente,
                              carregando: Boolean(remocao.operacao)
                          }
                        : { texto: 'OK', variante: 'verde', aoPressionar: () => setAlerta(null) }
                }
                acaoSecundaria={
                    alerta === 'erro'
                        ? { texto: 'Voltar', aoPressionar: () => setAlerta(null) }
                        : undefined
                }
            />
        </>
    );
}

export { CalendarScreenContainer };
export default CalendarScreenContainer;
