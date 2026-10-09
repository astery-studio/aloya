import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Pill } from 'phosphor-react-native';
import { WarningCircleIcon } from '../../shared/components/icons/AppIcons';
import SimpleModal from '../../shared/components/feedback/Modal/SimpleModal';
import { ContraceptiveTrackingScreen } from './screens/ContraceptiveTrackingScreen';
import { ContraceptiveHomeScreen } from './screens/ContraceptiveHomeScreen';
import { NewContraceptiveScreen } from './screens/NewContraceptiveScreen';
import { EditContraceptiveScreen } from './screens/EditContraceptiveScreen';
import { atualizarUsoDoAnticoncepcional, fusoDoDispositivo } from './utils/contraceptiveTrackingAdapter';

const serviceLocal = Object.freeze({
    listar: async () => [],
    cadastrar: async (anticoncepcional) => anticoncepcional
});

function ContraceptiveFlow({ service = serviceLocal, onVoltar, onSessaoExpirada, inicio = false, onSelecionarAba }) {
    const [tela, setTela] = useState(inicio ? 'inicio' : 'lista');
    const [itens, setItens] = useState([]);
    const [mensagem, setMensagem] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState(null);
    const [erroUso, setErroUso] = useState(null);
    const [selecionado, setSelecionado] = useState(null);
    const [remocao, setRemocao] = useState(null);
    const [removendo, setRemovendo] = useState(false);
    const [erroRemocao, setErroRemocao] = useState(false);
    const versaoBusca = useRef(0);
    const montado = useRef(true);
    const operacaoRemocao = useRef(false);
    // A trava por dose permanece no fluxo quando a seção remonta o cartão.
    const operacoesUso = useRef(new Set());

    const carregar = useCallback(async (signal, discreto = false) => {
        const versao = ++versaoBusca.current;
        if (!discreto) setCarregando(true);
        setErro(null);
        try {
            const registros = await service.listar({ signal, incluirRemovidos: true, fusoHorario: fusoDoDispositivo() });
            if (montado.current && !signal?.aborted && versao === versaoBusca.current && !operacoesUso.current.size) setItens(registros);
        } catch (falha) {
            if (falha?.name === 'AbortError' || signal?.aborted || !montado.current || versao !== versaoBusca.current) return;
            if (falha?.status === 401) return onSessaoExpirada?.();
            setErro(falha?.mensagemUsuario || 'Verifique sua conexão e tente novamente.');
        } finally {
            if (montado.current && !signal?.aborted && versao === versaoBusca.current) setCarregando(false);
        }
    }, [onSessaoExpirada, service]);

    useEffect(() => {
        montado.current = true;
        const controlador = new AbortController();
        // A busca externa inicia ao montar o fluxo e cancela ao desmontar.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregar(controlador.signal);
        const inscricao = AppState.addEventListener('change', (estado) => {
            if (estado === 'active') carregar(controlador.signal, true);
        });
        // Recalcula os usos do dia ao atravessar meia-noite, inclusive com a tela aberta.
        let temporizador;
        function agendarViradaDoDia() {
            const agora = new Date();
            const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1);
            temporizador = setTimeout(() => {
                carregar(controlador.signal, true);
                agendarViradaDoDia();
            }, amanha.getTime() - agora.getTime() + 1000);
        }
        agendarViradaDoDia();
        return () => {
            montado.current = false;
            controlador.abort();
            inscricao.remove();
            clearTimeout(temporizador);
        };
    }, [carregar]);

    async function cadastrar(anticoncepcional) {
        setSalvando(true);
        try {
            const salvo = await service.cadastrar(anticoncepcional);
            setItens((atuais) => [salvo, ...atuais]);
            setTela('lista');
            setMensagem('Anticoncepcional cadastrado com sucesso.');
            carregar(undefined, true);
        } catch (falha) {
            if (falha?.status === 401) onSessaoExpirada?.();
            throw falha;
        } finally {
            setSalvando(false);
        }
    }

    async function alternarUso(anticoncepcional, uso, confirmar) {
        const chaveDose = JSON.stringify([String(anticoncepcional.id), uso.data, uso.horario]);
        if (operacoesUso.current.has(chaveDose)) {
            // O cartão desfaz apenas este segundo toque; o primeiro PUT continua.
            throw new Error('Este horário já está sendo atualizado.');
        }
        operacoesUso.current.add(chaveDose);
        // Invalida snapshots de busca iniciados antes desta mutação.
        versaoBusca.current += 1;
        try {
            if (typeof service.alternarUso !== 'function') throw new Error('Serviço de uso indisponível.');
            const resposta = await service.alternarUso({
                anticoncepcionalId: anticoncepcional.id,
                data: uso.data,
                horario: uso.horario,
                confirmar,
                fusoHorario: fusoDoDispositivo()
            });
            const atualizado = resposta?.uso;
            if (!atualizado?.data || !atualizado?.horario) throw new Error('Resposta de uso inválida.');
            if (montado.current) setItens((atuais) => atuais.map((item) => item.id === anticoncepcional.id
                ? atualizarUsoDoAnticoncepcional(item, atualizado) : item));
            return atualizado;
        } catch (falha) {
            if (falha?.status === 401) onSessaoExpirada?.();
            setErroUso(falha);
            throw falha;
        } finally {
            operacoesUso.current.delete(chaveDose);
            // Invalida também GETs iniciados durante o PUT, inclusive após rollback.
            versaoBusca.current += 1;
        }
    }

    async function atualizar(dados) {
        try {
            const salvo = await service.editar(selecionado.id, dados);
            setItens((atuais) => atuais.map((item) => item.id === selecionado.id ? { ...item, ...salvo } : item));
            setSelecionado(salvo);
            carregar(undefined, true);
            return salvo;
        } catch (falha) {
            if (falha?.status === 401) onSessaoExpirada?.();
            throw falha;
        }
    }

    async function excluir(id) {
        try {
            const resultado = await service.remover(id);
            setItens((atuais) => atuais.map((item) => item.id === String(id)
                ? { ...item, ativo: false, removido: true, usosHoje: [] } : item));
            carregar(undefined, true);
            return resultado;
        } catch (falha) {
            if (falha?.status === 401) onSessaoExpirada?.();
            throw falha;
        }
    }

    async function confirmarRemocao() {
        if (!remocao || operacaoRemocao.current) return;
        operacaoRemocao.current = true;
        setRemovendo(true);
        setErroRemocao(false);
        try {
            await excluir(remocao.id);
            setRemocao(null);
            setMensagem('Anticoncepcional removido com sucesso.');
        } catch {
            setErroRemocao(true);
        } finally {
            operacaoRemocao.current = false;
            setRemovendo(false);
        }
    }

    const propriedadesLista = {
        anticoncepcionais: itens,
        aoCadastrarNovo: () => setTela('cadastro'),
        aoVoltar: inicio ? () => setTela('inicio') : onVoltar,
        carregando, erro, erroUso,
        aoDispensarErroUso: () => setErroUso(null),
        aoTentarNovamente: () => carregar(undefined, Boolean(itens.length)),
        aoAlternarUso: alternarUso,
        aoEditar: (item) => { setSelecionado(item); setTela('edicao'); },
        aoRemover: (item) => { setErroRemocao(false); setRemocao(item); }
    };

    return (
        <>
            {tela === 'cadastro'
                ? <NewContraceptiveScreen onVoltar={() => setTela('lista')} onCadastrar={cadastrar} salvando={salvando} />
                : tela === 'edicao'
                    ? <EditContraceptiveScreen anticoncepcional={selecionado} aoAtualizar={atualizar} aoExcluir={excluir} aoVoltar={() => setTela('lista')} />
                    : tela === 'inicio'
                        ? <ContraceptiveHomeScreen {...propriedadesLista} aoAbrirLista={() => setTela('lista')} onSelecionarAba={onSelecionarAba} />
                        : <ContraceptiveTrackingScreen {...propriedadesLista} />}
            <SimpleModal
                visivel={Boolean(remocao)}
                aoFechar={removendo ? undefined : () => setRemocao(null)}
                icone={WarningCircleIcon}
                titulo={erroRemocao ? 'Algo deu errado' : 'Apagar anticoncepcional'}
                mensagem={erroRemocao
                    ? 'Ocorreu um erro ao deletar. Verifique sua conexão e tente novamente.'
                    : 'Tem certeza que deseja remover este anticoncepcional? Os alertas programados para ele serão cancelados.'}
                acaoPrincipal={{ texto: erroRemocao ? 'Tentar novamente' : 'Remover', variante: erroRemocao ? 'preto' : 'verde', aoPressionar: confirmarRemocao, carregando: removendo, desativado: removendo }}
                acaoSecundaria={{ texto: 'Cancelar', variante: 'branco', aoPressionar: () => setRemocao(null), desativado: removendo }}
            />
            <SimpleModal
                visivel={Boolean(mensagem)}
                aoFechar={() => setMensagem(null)}
                icone={Pill}
                titulo={mensagem}
                acaoPrincipal={{ texto: 'OK', variante: 'verde', aoPressionar: () => setMensagem(null) }}
            />
        </>
    );
}

export { ContraceptiveFlow };
