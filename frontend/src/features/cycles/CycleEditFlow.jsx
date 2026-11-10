import { useCallback, useEffect, useRef, useState } from 'react';

import SimpleModal from '../../shared/components/feedback/Modal/SimpleModal';
import { useTheme } from '../../shared/hooks/useTheme';
import { diasDoRegistro, mesesParaEdicao, contarEpisodios } from './utils/cycleEditSelection';
import { IconeAlerta, IconeSucesso } from './components/CycleRemovalFeedbackModal';
import { obterPeriodo } from './utils/cycleRemovalPresentation';
import { CycleEditSheet } from './components/CycleEditSheet/CycleEditSheet';

function formatarDataParaCampo(dataIso) {
    if (!dataIso) return '';
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
}

function converterCampoParaIso(valor, opcional = false) {
    if (opcional && valor === '') return null;
    const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
    if (!partes) return undefined;
    const [, dia, mes, ano] = partes;
    const data = new Date(Date.UTC(Number(ano), Number(mes) - 1, Number(dia)));
    const valido =
        data.getUTCFullYear() === Number(ano) &&
        data.getUTCMonth() === Number(mes) - 1 &&
        data.getUTCDate() === Number(dia);
    return valido ? `${ano}-${mes}-${dia}` : undefined;
}

function dataAtualIso() {
    const hoje = new Date();
    return [
        String(hoje.getFullYear()).padStart(4, '0'),
        String(hoje.getMonth() + 1).padStart(2, '0'),
        String(hoje.getDate()).padStart(2, '0')
    ].join('-');
}

function validarEdicao(dataInicio, dataFim) {
    const inicio = converterCampoParaIso(dataInicio);
    const fim = converterCampoParaIso(dataFim, true);
    if (!inicio || fim === undefined) {
        return {
            titulo: 'Data incorreta',
            mensagem: 'Informe datas válidas no formato DD/MM/AAAA.'
        };
    }
    if (inicio > dataAtualIso() || (fim && fim > dataAtualIso())) {
        return {
            titulo: 'Data no futuro',
            mensagem: 'Não é possível registrar menstruação em uma data futura.'
        };
    }
    if (fim && inicio > fim) {
        return {
            titulo: 'Data incorreta',
            mensagem: 'A data de início não pode ser posterior à data de término.'
        };
    }
    return { inicio, fim };
}

function IconeConfirmacaoEdicao({ color }) {
    const tema = useTheme();
    return <IconeAlerta cor={tema.escuro ? color : undefined} fundoTransparente={tema.escuro} />;
}
function IconeErroEdicao() {
    return <IconeAlerta erro />;
}

function CycleEditFlow({ ciclo, service, onFechar, onAtualizado, onSessaoExpirada }) {
    const [registro, setRegistro] = useState(ciclo);
    const [originais, setOriginais] = useState(() => diasDoRegistro(ciclo));
    const [dias, setDias] = useState(() => diasDoRegistro(ciclo));
    const [carregando, setCarregando] = useState(false);
    const [painelVisivel, setPainelVisivel] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const acaoAposOcultarPainel = useRef(null);
    const acaoAposOcultarFeedback = useRef(null);
    const montado = useRef(true);
    const confirmarOutrosCiclos = useRef(false);
    const cicloFoiRemovido = useRef(false);
    const salvo = useRef(false);
    const finalizado = useRef(false);
    const painelAtual = useRef(painelVisivel);
    painelAtual.current = painelVisivel;
    const alterado = JSON.stringify(dias) !== JSON.stringify(originais);

    const carregarRegistro = useCallback(async () => {
        if (salvo.current || finalizado.current || typeof service.buscar !== 'function') return;
        setCarregando(true);
        try {
            const atual = await service.buscar(ciclo.id);
            if (!montado.current || salvo.current || finalizado.current) return;
            setRegistro(atual);
            const datas = diasDoRegistro(atual);
            setOriginais(datas);
            setDias(datas);
            return true;
        } catch (falha) {
            if (!montado.current || salvo.current || finalizado.current) return;
            if (falha?.status === 401) {
                onSessaoExpirada?.();
                return;
            }
            const erroCarregamento = {
                tipo: 'carregamento',
                titulo: 'Algo deu errado',
                mensagem: 'Ocorreu um erro ao atualizar este registro. Tente novamente.'
            };
            if (painelAtual.current) {
                acaoAposOcultarPainel.current = () => setFeedback(erroCarregamento);
                setPainelVisivel(false);
            } else setFeedback(erroCarregamento);
            return false;
        } finally {
            if (montado.current) setCarregando(false);
        }
    }, [ciclo.id, service, onSessaoExpirada]);
    useEffect(() => {
        montado.current = true;
        void carregarRegistro();
        return () => {
            montado.current = false;
        };
    }, [carregarRegistro]);

    function alternarDia({ data }) {
        if (salvando || carregando) return;
        if (data > dataAtualIso()) {
            abrirFeedback({
                tipo: 'validacao',
                titulo: 'Data no futuro',
                mensagem: 'Não é possível registrar menstruação em uma data futura.'
            });
            return;
        }
        const proximos = dias.includes(data)
            ? dias.filter((dia) => dia !== data)
            : [...dias, data].sort();
        setDias(proximos);
    }

    function abrirFeedback(proximoFeedback) {
        acaoAposOcultarPainel.current = () => setFeedback(proximoFeedback);
        setPainelVisivel(false);
    }

    function executarAposOcultarPainel() {
        if (finalizado.current) return;
        const acao = acaoAposOcultarPainel.current;
        acaoAposOcultarPainel.current = null;
        acao?.();
    }

    function ocultarFeedback(acaoSeguinte) {
        acaoAposOcultarFeedback.current = acaoSeguinte;
        setFeedback(null);
    }

    function executarAposOcultarFeedback() {
        if (finalizado.current) return;
        const acao = acaoAposOcultarFeedback.current;
        acaoAposOcultarFeedback.current = null;
        acao?.();
    }

    function fecharFluxo() {
        if (finalizado.current) return;
        finalizado.current = true;
        acaoAposOcultarFeedback.current = null;
        acaoAposOcultarPainel.current = null;
        setFeedback(null);
        setPainelVisivel(false);
        onFechar?.();
    }
    function voltarAoPainel() {
        if (salvo.current || finalizado.current) {
            fecharFluxo();
            return;
        }
        ocultarFeedback(() => {
            if (!salvo.current && !finalizado.current) setPainelVisivel(true);
        });
    }

    function solicitarFechamento() {
        if (salvando) return;
        if (alterado) abrirFeedback({ tipo: 'saida' });
        else fecharFluxo();
    }

    function solicitarSalvamento() {
        if (!alterado || salvando || carregando) return;
        abrirFeedback({ tipo: dias.length ? 'confirmacao' : 'exclusao' });
    }

    async function atualizarTelas() {
        try {
            const atualizado = await onAtualizado?.();
            if (atualizado === false) throw new Error('A tela não foi atualizada.');
            setFeedback({ tipo: cicloFoiRemovido.current ? 'sucesso-excluir' : 'sucesso' });
        } catch {
            setFeedback({
                tipo: 'atualizacao',
                titulo: 'Registro salvo',
                mensagem:
                    'As alterações foram salvas, mas não foi possível atualizar a tela. Tente atualizar novamente.'
            });
        }
    }

    function tentarAtualizar() {
        setSalvando(true);
        ocultarFeedback(async () => {
            await atualizarTelas();
            setSalvando(false);
        });
    }

    async function salvar(validacao) {
        try {
            const resultado = await service.editar(ciclo.id, {
                dias: validacao.dias,
                ...(validacao.confirmarOutrosCiclos ? { confirmarOutrosCiclos: true } : {})
            });
            salvo.current = true;
            cicloFoiRemovido.current = resultado === null;
            await atualizarTelas();
        } catch (falha) {
            if (falha?.status === 401) {
                onSessaoExpirada?.({ mensagem: 'Sua sessão expirou. Entre novamente.' });
                return;
            }
            if (
                falha?.codigo === 'CONFIRMAR_ALTERACAO_OUTROS_CICLOS' &&
                Array.isArray(falha.detalhes)
            ) {
                const unioes = falha.detalhes.filter((periodo) => periodo.acao === 'unir');
                const restauracoes = falha.detalhes.filter((periodo) => periodo.acao !== 'unir');
                const descreverPeriodo = (periodo) =>
                    `${formatarDataParaCampo(periodo.dataInicio)} a ${periodo.dataFim ? formatarDataParaCampo(periodo.dataFim) : 'em andamento'}`;
                const mensagens = [];
                if (unioes.length)
                    mensagens.push(
                        `Os períodos ${unioes.map(descreverPeriodo).join('; ')} serão unidos à seleção, pois há no máximo 2 dias de pausa entre os sangramentos. Os dias registrados serão preservados em um único ciclo para cada grupo contínuo.`
                    );
                if (restauracoes.length)
                    mensagens.push(
                        `Os seguintes dias serão restaurados em outros ciclos: ${restauracoes.map((periodo) => `${periodo.dias.map(formatarDataParaCampo).join(', ')} no período de ${descreverPeriodo(periodo)}`).join('; ')}. Esses dias permanecerão associados aos respectivos ciclos.`
                    );
                const datasOutrosCiclos = new Set(restauracoes.flatMap((periodo) => periodo.dias));
                const excluiAtual =
                    !unioes.length && validacao.dias.every((dia) => datasOutrosCiclos.has(dia));
                if (excluiAtual)
                    mensagens.push('O ciclo em edição ficará sem dias e será excluído.');
                mensagens.push(
                    'As demais alterações da seleção serão salvas e as previsões serão recalculadas. Deseja continuar?'
                );
                setFeedback({
                    tipo: 'outros-ciclos',
                    titulo: unioes.length ? 'Unir ciclos' : 'Alterar outro ciclo',
                    mensagem: mensagens.join(' ')
                });
                return;
            }
            const conflito = falha?.codigo === 'SOBREPOSICAO_CICLO';
            const periodo = falha?.detalhes;
            const intervalo = periodo?.dataInicio
                ? ` (${formatarDataParaCampo(periodo.dataInicio)} a ${periodo.dataFim ? formatarDataParaCampo(periodo.dataFim) : 'em andamento'})`
                : '';
            setFeedback({
                tipo: conflito ? 'validacao' : 'erro',
                titulo: conflito ? 'Ciclo existente' : 'Algo deu errado',
                mensagem: conflito
                    ? `O período informado se sobrepõe a outro ciclo já registrado${intervalo}. Ajuste as datas ou edite o outro ciclo em vez deste.`
                    : 'Ocorreu um erro ao atualizar este registro. Tente novamente.'
            });
        } finally {
            setSalvando(false);
        }
    }

    function confirmarSalvamento() {
        if (feedback?.tipo === 'outros-ciclos') confirmarOutrosCiclos.current = true;
        else if (feedback?.tipo !== 'erro') confirmarOutrosCiclos.current = false;
        const validacao = { dias: [...dias], confirmarOutrosCiclos: confirmarOutrosCiclos.current };

        setSalvando(true);
        ocultarFeedback(() => salvar(validacao));
    }

    return (
        <>
            <CycleEditSheet
                visivel={painelVisivel}
                meses={mesesParaEdicao(registro, dias)}
                mesInicial={registro.dataInicio.slice(0, 7)}
                carregando={carregando}
                alterado={alterado}
                salvando={salvando}
                onAlternarDia={alternarDia}
                onFechar={solicitarFechamento}
                onOcultar={executarAposOcultarPainel}
                onSalvar={solicitarSalvamento}
            />
            <SimpleModal
                varianteVisual="confirmacaoCiclo"
                visivel={['confirmacao', 'exclusao', 'outros-ciclos'].includes(feedback?.tipo)}
                aoFechar={voltarAoPainel}
                aoOcultar={executarAposOcultarFeedback}
                icone={IconeConfirmacaoEdicao}
                fundoIcone="transparent"
                titulo={
                    feedback?.tipo === 'exclusao'
                        ? 'Apagar ciclo'
                        : feedback?.tipo === 'outros-ciclos'
                          ? (feedback.titulo ?? 'Alterar outro ciclo')
                          : 'Atualizar ciclo'
                }
                mensagem={
                    feedback?.tipo === 'outros-ciclos'
                        ? feedback.mensagem
                        : feedback?.tipo === 'exclusao'
                          ? `Tem certeza que deseja excluir todo o período de menstruação de ${obterPeriodo(registro)} do seu histórico? Esta ação não pode ser desfeita e recalculará suas previsões futuras.`
                          : contarEpisodios(dias) > 1
                            ? `A seleção será salva em ${contarEpisodios(dias)} ciclos separados, pois há intervalos de 3 dias ou mais sem sangramento. Suas previsões serão recalculadas. Deseja continuar?`
                            : 'Esta alteração pode recalcular suas previsões futuras de ciclo. Deseja continuar?'
                }
                acaoPrincipal={{
                    texto: feedback?.tipo === 'exclusao' ? 'Apagar' : 'Confirmar',
                    aoPressionar: confirmarSalvamento
                }}
                acaoSecundaria={{ texto: 'Cancelar', aoPressionar: voltarAoPainel }}
            />
            <SimpleModal
                visivel={feedback?.tipo === 'saida'}
                aoFechar={voltarAoPainel}
                aoOcultar={executarAposOcultarFeedback}
                icone={IconeConfirmacaoEdicao}
                fundoIcone="transparent"
                titulo="Dados não salvos"
                mensagem="Deseja descartar as alterações feitas neste registro?"
                acaoPrincipal={{
                    texto: 'Continuar a editar',
                    aoPressionar: voltarAoPainel
                }}
                acaoSecundaria={{
                    texto: 'Sair sem salvar',
                    varianteVisual: 'sairSemSalvar',
                    aoPressionar: fecharFluxo
                }}
            />
            <SimpleModal
                varianteVisual="sucessoCiclo"
                visivel={['sucesso', 'sucesso-excluir'].includes(feedback?.tipo)}
                aoFechar={fecharFluxo}
                aoOcultar={executarAposOcultarFeedback}
                icone={IconeSucesso}
                fundoIcone="transparent"
                titulo={
                    feedback?.tipo === 'sucesso-excluir'
                        ? 'Ciclo excluído com sucesso'
                        : 'Ciclo atualizado com sucesso'
                }
                acaoPrincipal={{ texto: 'OK', aoPressionar: fecharFluxo }}
            />
            <SimpleModal
                erroInterno={['erro', 'carregamento'].includes(feedback?.tipo)}
                visivel={['erro', 'validacao', 'atualizacao', 'carregamento'].includes(
                    feedback?.tipo
                )}
                aoFechar={
                    ['atualizacao', 'carregamento'].includes(feedback?.tipo)
                        ? fecharFluxo
                        : voltarAoPainel
                }

                aoOcultar={executarAposOcultarFeedback}
                icone={feedback?.tipo === 'validacao' ? IconeConfirmacaoEdicao : IconeErroEdicao}
                fundoIcone="transparent"
                titulo={feedback?.titulo}
                mensagem={feedback?.mensagem}
                acaoPrincipal={
                    feedback?.tipo === 'atualizacao'
                        ? { texto: 'Tentar atualizar', aoPressionar: tentarAtualizar }
                        : feedback?.tipo === 'carregamento'
                          ? {
                                texto: 'Tentar novamente',
                                variante: 'preto',
                                aoPressionar: () =>
                                    ocultarFeedback(async () => {
                                        const carregou = await carregarRegistro();
                                        if (carregou && montado.current) setPainelVisivel(true);
                                    })
                            }
                          : feedback?.tipo === 'erro'
                            ? {
                                  texto: 'Tentar novamente',
                                  variante: 'preto',
                                  aoPressionar: confirmarSalvamento
                              }
                            : { texto: 'OK', aoPressionar: voltarAoPainel }
                }
                acaoSecundaria={
                    feedback?.tipo === 'atualizacao'
                        ? { texto: 'Fechar', aoPressionar: fecharFluxo }
                        : feedback?.tipo === 'erro'
                          ? {
                                texto: 'Voltar',
                                variante: 'branco',
                                aoPressionar: voltarAoPainel
                            }
                          : feedback?.tipo === 'carregamento'
                            ? { texto: 'Voltar', variante: 'branco', aoPressionar: fecharFluxo }
                            : undefined
                }
            />
        </>
    );
}

export { CycleEditFlow, converterCampoParaIso, formatarDataParaCampo, validarEdicao };
