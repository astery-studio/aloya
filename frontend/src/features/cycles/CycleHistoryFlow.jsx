//Conecta a tela de histórico aos serviços de remoção e ao calendário do ciclo selecionado.
import { useCallback, useEffect, useState } from 'react';
import { useCycleHistory } from './hooks/useCycleHistory';
import { CycleHistoryScreen } from './screens/CycleHistoryScreen';
import { RemoveMenstruationModal } from './components/RemoveMenstruationModal';
import { useCycleRemoval } from './hooks/useCycleRemoval';
import { obterHojeLocal } from '../calendar/utils/cycleCalendar.utils';

function listarMesesDoCiclo(ciclo) {
    const inicio = ciclo?.dataInicio;
    const fim = ciclo?.dataFim || obterHojeLocal();
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(inicio || '') ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fim) ||
        fim < inicio
    )
        return [];
    const [anoInicio, mesInicio] = inicio.split('-').map(Number);
    const [anoFim, mesFim] = fim.split('-').map(Number);
    const meses = [];
    let ano = anoInicio;
    let mes = mesInicio;
    while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
        meses.push(`${ano}-${String(mes).padStart(2, '0')}`);
        mes += 1;
        if (mes > 12) {
            mes = 1;
            ano += 1;
        }
    }
    return meses;
}

function filtrarDiasDoCiclo(calendario, cicloId) {
    const diasMenstruacao = calendario.diasMenstruacao.filter(
        (dia) => String(dia.registroCicloId) === String(cicloId)
    );
    return {
        ...calendario,
        possuiCiclos: diasMenstruacao.length > 0,
        diasMenstruacao,
        previsao: null
    };
}

function CycleHistoryFlow({
    service,
    calendarService,
    aoAbrirCalendario,
    aoEditarCiclo,
    onSelecionarAba,
    onSessaoExpirada
}) {
    const historico = useCycleHistory({ service, onSessaoExpirada });
    const [cicloParaExcluir, setCicloParaExcluir] = useState(null);
    const [modoRemocao, setModoRemocao] = useState('dia');
    const [mesesCiclo, setMesesCiclo] = useState([]);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [carregandoMeses, setCarregandoMeses] = useState(false);
    const [erroMeses, setErroMeses] = useState(null);
    const [diasAlterados, setDiasAlterados] = useState(false);
    const [alerta, setAlerta] = useState(null);
    const [operacaoFalha, setOperacaoFalha] = useState(null);
    const remocao = useCycleRemoval({
        service,
        aoAtualizar: async () => {
            const atualizado = await historico.tentarNovamente();
            if (!atualizado) throw new Error('O histórico não foi atualizado.');
        },
        onSessaoExpirada
    });

    const carregarMeses = useCallback(
        async (ciclo, signal) => {
            if (!calendarService || typeof calendarService.buscarMes !== 'function') {
                setErroMeses('Não foi possível carregar os dias deste ciclo.');
                return;
            }
            setCarregandoMeses(true);
            setErroMeses(null);
            try {
                const chaves = listarMesesDoCiclo(ciclo);
                if (!chaves.length) throw new Error('Período do ciclo inválido.');
                const calendarios = await Promise.all(
                    chaves.map((mes) => calendarService.buscarMes({ mes, signal }))
                );
                if (!signal.aborted)
                    setMesesCiclo(
                        calendarios.map((calendario) => filtrarDiasDoCiclo(calendario, ciclo.id))
                    );
            } catch {
                if (!signal.aborted) setErroMeses('Não foi possível carregar os dias deste ciclo.');
            } finally {
                if (!signal.aborted) setCarregandoMeses(false);
            }
        },
        [calendarService]
    );

    useEffect(() => {
        if (!cicloParaExcluir) return undefined;
        const controlador = new AbortController();
        carregarMeses(cicloParaExcluir, controlador.signal);
        return () => controlador.abort();
    }, [carregarMeses, cicloParaExcluir]);

    const abrirRemocao = (ciclo) => {
        remocao.limparFeedback();
        setMesesCiclo([]);
        setDiasAlterados(false);
        setAlerta(null);
        setOperacaoFalha(null);
        setModoRemocao('dia');
        setDataSelecionada(null);
        setCicloParaExcluir(ciclo);
    };

    const removerDia = async (dia) => {
        if (!cicloParaExcluir || !dia?.data) return;
        const argumentos = { cicloId: cicloParaExcluir.id, data: dia.data };
        setDataSelecionada(dia.data);
        const resultado = await remocao.removerDia(argumentos);
        if (resultado.sucesso) {
            setDataSelecionada(null);
            setMesesCiclo((atuais) =>
                atuais.map((mes) => ({
                    ...mes,
                    diasMenstruacao: mes.diasMenstruacao.filter(
                        (registro) => registro.data !== dia.data
                    ),
                    possuiCiclos: mes.diasMenstruacao.some((registro) => registro.data !== dia.data)
                }))
            );
            setDiasAlterados(true);
            setOperacaoFalha(null);
        } else {
            setOperacaoFalha({ tipo: 'dia', argumentos });
            setAlerta('erro');
        }
    };

    const excluirCiclo = async () => {
        if (!cicloParaExcluir) return;
        const resultado = await remocao.excluirCiclo({ cicloId: cicloParaExcluir.id });
        if (resultado.sucesso) {
            setCicloParaExcluir(null);
            setOperacaoFalha(null);
            setAlerta('sucesso-excluir');
        } else {
            setOperacaoFalha({ tipo: 'ciclo', argumentos: { cicloId: cicloParaExcluir.id } });
            setAlerta('erro');
        }
    };

    const tentarNovamente = async () => {
        if (erroMeses) {
            setCicloParaExcluir((ciclo) => (ciclo ? { ...ciclo } : ciclo));
            return;
        }
        if (!operacaoFalha) return;
        const resultado =
            operacaoFalha.tipo === 'dia'
                ? await remocao.removerDia(operacaoFalha.argumentos)
                : await remocao.excluirCiclo(operacaoFalha.argumentos);
        if (resultado.sucesso) {
            if (operacaoFalha.tipo === 'dia') {
                const data = operacaoFalha.argumentos.data;
                setMesesCiclo((atuais) =>
                    atuais.map((mes) => ({
                        ...mes,
                        diasMenstruacao: mes.diasMenstruacao.filter(
                            (registro) => registro.data !== data
                        ),
                        possuiCiclos: mes.diasMenstruacao.some((registro) => registro.data !== data)
                    }))
                );
                setDiasAlterados(true);
                setDataSelecionada(null);
                setAlerta(null);
            } else {
                setCicloParaExcluir(null);
                setModoRemocao('dia');
                setAlerta('sucesso-excluir');
            }
            setOperacaoFalha(null);
        }
    };

    const concluir = () => {
        setCicloParaExcluir(null);
        setModoRemocao('dia');
        if (diasAlterados) setAlerta('sucesso-atualizar');
    };

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
                aoExcluirCiclo={abrirRemocao}
                onSelecionarAba={onSelecionarAba}
            />
            <RemoveMenstruationModal
                modo={modoRemocao}
                visivel={Boolean(cicloParaExcluir)}
                ciclo={cicloParaExcluir}
                meses={mesesCiclo}
                dataSelecionada={dataSelecionada}
                carregandoMeses={carregandoMeses}
                erroMeses={erroMeses}
                carregando={Boolean(remocao.operacao)}
                diasAlterados={diasAlterados}
                alerta={alerta}
                onRemoverDia={removerDia}
                onConcluir={concluir}
                onSolicitarExcluirCiclo={() => setModoRemocao('cicloCompleto')}
                onExcluirCiclo={excluirCiclo}
                onTentarNovamente={tentarNovamente}
                onFecharAlerta={() => {
                    setAlerta(null);
                    setModoRemocao('dia');
                }}
                onCancelarExclusao={() => setModoRemocao('dia')}
                onFechar={() => {
                    setCicloParaExcluir(null);
                    setModoRemocao('dia');
                }}
            />
        </>
    );
}

export { CycleHistoryFlow, filtrarDiasDoCiclo, listarMesesDoCiclo };
