import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Pill } from 'phosphor-react-native';
import { WarningCircleIcon } from '../../shared/components/icons/AppIcons';
import SimpleModal from '../../shared/components/feedback/Modal/SimpleModal';
import { useTheme } from '../../shared/hooks/useTheme';
import { ContraceptiveTrackingScreen } from './screens/ContraceptiveTrackingScreen';
import { ContraceptiveHomeScreen } from './screens/ContraceptiveHomeScreen';
import { NewContraceptiveScreen } from './screens/NewContraceptiveScreen';
import { EditContraceptiveScreen } from './screens/EditContraceptiveScreen';
import {
    atualizarUsoDoAnticoncepcional,
    fusoDoDispositivo,
    mesmoUso
} from './utils/contraceptiveTrackingAdapter';

const serviceLocal = Object.freeze({
    listar: async () => [],
    cadastrar: async (anticoncepcional) => anticoncepcional
});

function ContraceptiveFlow({
    service = serviceLocal,
    onVoltar,
    onSessaoExpirada,
    inicio = false,
    onSelecionarAba
}) {
    const tema = useTheme();
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
    const [erroRemocao, setErroRemocao] = useState(null);

    const versaoBusca = useRef(0);
    const montado = useRef(true);
    const operacaoRemocao = useRef(false);
    // A trava por dose permanece no fluxo quando a seção remonta o cartão.
    const operacoesUso = useRef(new Set());

    const carregar = useCallback(
        async (signal, discreto = false) => {
            const versao = ++versaoBusca.current;
            const buscaAtiva = () =>
                montado.current && !signal?.aborted && versao === versaoBusca.current;

            if (!discreto) setCarregando(true);
            setErro(null);

            try {
                const registros = await service.listar({
                    signal,
                    incluirRemovidos: true,
                    fusoHorario: fusoDoDispositivo()
                });

                if (buscaAtiva() && !operacoesUso.current.size) {
                    setItens(registros);
                }
            } catch (falha) {
                if (falha?.name === 'AbortError' || !buscaAtiva()) return;
                if (falha?.status === 401) return onSessaoExpirada?.();

                setErro(falha?.mensagemUsuario || 'Verifique sua conexão e tente novamente.');
            } finally {
                if (buscaAtiva()) setCarregando(false);
            }
        },
        [onSessaoExpirada, service]
    );

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
            const atraso = amanha.getTime() - agora.getTime() + 1000;

            temporizador = setTimeout(() => {
                carregar(controlador.signal, true);
                agendarViradaDoDia();
            }, atraso);
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
            const salvo = await service.cadastrar(anticoncepcional, {
                fusoHorario: fusoDoDispositivo()
            });
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
            if (typeof service.alternarUso !== 'function')
                throw new Error('Serviço de uso indisponível.');
            const resposta = await service.alternarUso({
                anticoncepcionalId: anticoncepcional.id,
                data: uso.data,
                horario: uso.horario,
                confirmar,
                fusoHorario: fusoDoDispositivo()
            });

            const atualizado = resposta?.uso;
            if (!atualizado?.data || !atualizado?.horario)
                throw new Error('Resposta de uso inválida.');
            if (montado.current)
                setItens((atuais) =>
                    atuais.map((item) =>
                        item.id === anticoncepcional.id
                            ? atualizarUsoDoAnticoncepcional(item, atualizado)
                            : item
                    )
                );
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
            setItens((atuais) =>
                atuais.map((item) => (item.id === selecionado.id ? { ...item, ...salvo } : item))
            );
            setSelecionado(salvo);
            carregar(undefined, true);
            return salvo;
        } catch (falha) {
            if (falha?.status === 401) onSessaoExpirada?.();
            throw falha;
        }
    }

    async function salvarEdicaoHistorico(anticoncepcional, ocorrencia, alteracao) {
        const chaveDose = JSON.stringify([
            String(anticoncepcional.id),
            ocorrencia.data,
            ocorrencia.horarioProgramado
        ]);
        if (operacoesUso.current.has(chaveDose)) {
            throw new Error('Este horário já está sendo atualizado.');
        }

        operacoesUso.current.add(chaveDose);
        versaoBusca.current += 1;

        try {
            let salvo;
            if (alteracao.apagar) {
                await service.apagarRegistroHistorico(anticoncepcional.id, ocorrencia);
            } else {
                salvo = await service.corrigirHistorico(anticoncepcional.id, ocorrencia, {
                    ...alteracao,
                    fusoHorario: fusoDoDispositivo()
                });
            }

            const agora = new Date();
            if (montado.current) {
                setItens((atuais) =>
                    atuais.map((item) => {
                        if (item.id !== anticoncepcional.id) return item;

                        const usoAlterado = salvo ?? ocorrencia;
                        const historico = item.historico.filter(
                            (registro) => !mesmoUso(registro, usoAlterado)
                        );
                        if (salvo) {
                            historico.unshift(salvo);
                            historico.sort((a, b) =>
                                `${b.data} ${b.horarioProgramado}`.localeCompare(
                                    `${a.data} ${a.horarioProgramado}`
                                )
                            );
                        }

                        const usosHoje = item.usosHoje.map((uso) => {
                            if (!mesmoUso(uso, usoAlterado)) return uso;

                            if (!salvo) {
                                return {
                                    ...uso,
                                    id: `${uso.data}-${uso.horario}`,
                                    status: 'pendente',
                                    confirmadoEm: null,
                                    horarioConfirmacao: null,
                                    foraDoPrazo: false,
                                    confirmacaoForaPrazo: false,
                                    atrasado: new Date(`${uso.data}T${uso.horario}:00`) < agora
                                };
                            }

                            const foraDoPrazo = salvo.estado === 'foraDoPrazo';
                            return {
                                ...uso,
                                id: salvo.id,
                                status: salvo.estado,
                                atrasado: false,
                                confirmadoEm: salvo.confirmadoEm,
                                horarioConfirmacao: salvo.horarioConfirmacao,
                                foraDoPrazo,
                                confirmacaoForaPrazo: foraDoPrazo
                            };
                        });

                        const possuiPendencia = usosHoje.some((uso) =>
                            ['pendente', 'naoConfirmado'].includes(uso.status)
                        );
                        const statusUltimoUso = possuiPendencia
                            ? 'pendente'
                            : (usosHoje.at(-1)?.status ?? historico[0]?.estado ?? null);

                        return { ...item, historico, usosHoje, statusUltimoUso };
                    })
                );
            }

            return salvo;
        } catch (falha) {
            if (falha?.status === 401) onSessaoExpirada?.();
            throw falha;
        } finally {
            operacoesUso.current.delete(chaveDose);
            versaoBusca.current += 1;
        }
    }

    async function excluir(id) {
        try {
            const resultado = await service.remover(id);
            setItens((atuais) =>
                atuais.map((item) =>
                    item.id === String(id)
                        ? { ...item, ativo: false, removido: true, usosHoje: [] }
                        : item
                )
            );
            carregar(undefined, true);
            return resultado;
        } catch (falha) {
            if (falha?.status === 401) onSessaoExpirada?.();
            throw falha;
        }
    }

    const exclusaoDefinitiva = remocao?.removido || remocao?.ativo === false;

    function solicitarRemocao(item) {
        setErroRemocao(null);
        setRemocao(item);
    }

    async function confirmarRemocao() {
        if (!remocao || operacaoRemocao.current) return;

        operacaoRemocao.current = true;
        setRemovendo(true);
        setErroRemocao(null);

        try {
            if (exclusaoDefinitiva) {
                await service.apagarDefinitivamente(remocao.id);
                versaoBusca.current += 1;
                setItens((atuais) => atuais.filter((item) => item.id !== remocao.id));
                setMensagem('Anticoncepcional apagado definitivamente.');
            } else {
                await excluir(remocao.id);
                setMensagem('Anticoncepcional removido com sucesso.');
            }
            setRemocao(null);
        } catch (falha) {
            if (exclusaoDefinitiva && falha?.status === 401) onSessaoExpirada?.();
            setErroRemocao(
                falha?.status === 429
                    ? falha.mensagemUsuario || 'Aguarde um pouco antes de tentar remover novamente.'
                    : 'Ocorreu um erro ao excluir. Verifique sua conexão e tente novamente.'
            );
        } finally {
            operacaoRemocao.current = false;
            setRemovendo(false);
        }
    }

    const propriedadesLista = {
        anticoncepcionais: itens,
        aoCadastrarNovo: () => setTela('cadastro'),
        aoVoltar: inicio ? () => setTela('inicio') : onVoltar,
        carregando,
        erro,
        erroUso,
        aoDispensarErroUso: () => setErroUso(null),
        aoTentarNovamente: () => carregar(undefined, Boolean(itens.length)),
        aoAlternarUso: alternarUso,
        aoSalvarEdicaoHistorico:
            typeof service.corrigirHistorico === 'function' ? salvarEdicaoHistorico : undefined,
        aoEditar: (item) => {
            setSelecionado(item);
            setTela('edicao');
        },
        aoRemover: solicitarRemocao,
        aoApagar: typeof service.apagarDefinitivamente === 'function' ? solicitarRemocao : undefined
    };

    const tituloRemocao = exclusaoDefinitiva
        ? 'Apagar definitivamente?'
        : 'Apagar anticoncepcional';
    const mensagemRemocao = exclusaoDefinitiva
        ? 'O anticoncepcional e seu histórico de uso serão apagados. Essa ação é definitiva.'
        : 'Tem certeza que deseja remover este anticoncepcional? Os alertas programados para ele serão cancelados.';

    return (
        <>
            {tela === 'cadastro' ? (
                <NewContraceptiveScreen
                    onVoltar={() => setTela('lista')}
                    onCadastrar={cadastrar}
                    salvando={salvando}
                />
            ) : tela === 'edicao' ? (
                <EditContraceptiveScreen
                    anticoncepcional={selecionado}
                    aoAtualizar={atualizar}
                    aoExcluir={excluir}
                    aoVoltar={() => setTela('lista')}
                />
            ) : tela === 'inicio' ? (
                <ContraceptiveHomeScreen
                    {...propriedadesLista}
                    aoAbrirLista={() => setTela('lista')}
                    onSelecionarAba={onSelecionarAba}
                />
            ) : (
                <ContraceptiveTrackingScreen {...propriedadesLista} />
            )}
            <SimpleModal
                varianteVisual={erroRemocao || exclusaoDefinitiva ? undefined : 'sairSemSalvar'}
                erroInterno={Boolean(erroRemocao)}
                visivel={Boolean(remocao)}
                aoFechar={removendo ? undefined : () => setRemocao(null)}
                icone={WarningCircleIcon}
                corIcone={
                    exclusaoDefinitiva && !erroRemocao ? tema.cores.marca.primaria : undefined
                }
                fundoIcone={
                    exclusaoDefinitiva && !erroRemocao
                        ? tema.cores.icones.configuracoes.laranja.caixa
                        : undefined
                }
                titulo={erroRemocao ? 'Algo deu errado' : tituloRemocao}
                mensagem={erroRemocao ?? mensagemRemocao}
                acaoPrincipal={{
                    texto: erroRemocao
                        ? 'Tentar novamente'
                        : exclusaoDefinitiva
                          ? 'Apagar'
                          : 'Remover',
                    variante: erroRemocao ? 'preto' : 'verde',
                    aoPressionar: confirmarRemocao,
                    carregando: removendo,
                    desativado: removendo
                }}
                acaoSecundaria={{
                    texto: 'Cancelar',
                    varianteVisual: erroRemocao || exclusaoDefinitiva ? undefined : 'sairSemSalvar',
                    variante: 'branco',
                    aoPressionar: () => setRemocao(null),
                    desativado: removendo
                }}
            />
            <SimpleModal
                visivel={Boolean(mensagem)}
                aoFechar={() => setMensagem(null)}
                icone={Pill}
                titulo={mensagem}
                acaoPrincipal={{
                    texto: 'OK',
                    variante: 'verde',
                    aoPressionar: () => setMensagem(null)
                }}
            />
        </>
    );
}

export { ContraceptiveFlow };
