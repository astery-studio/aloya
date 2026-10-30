import { useRef, useState } from 'react';

import SimpleModal from '../../shared/components/feedback/Modal/SimpleModal';
import { DropIcon, WarningCircleIcon } from '../../shared/components/icons/AppIcons';
import { tema } from '../../shared/theme';
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

function CycleEditFlow({ ciclo, service, onFechar, onAtualizado, onSessaoExpirada }) {
    const inicioOriginal = formatarDataParaCampo(ciclo.dataInicio);
    const fimOriginal = formatarDataParaCampo(ciclo.dataFim);
    const [dataInicio, setDataInicio] = useState(inicioOriginal);
    const [dataFim, setDataFim] = useState(fimOriginal);
    const [painelVisivel, setPainelVisivel] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const acaoAposOcultarPainel = useRef(null);
    const acaoAposOcultarFeedback = useRef(null);
    const alterado = dataInicio !== inicioOriginal || dataFim !== fimOriginal;

    function abrirFeedback(proximoFeedback) {
        acaoAposOcultarPainel.current = () => setFeedback(proximoFeedback);
        setPainelVisivel(false);
    }

    function executarAposOcultarPainel() {
        const acao = acaoAposOcultarPainel.current;
        acaoAposOcultarPainel.current = null;
        acao?.();
    }

    function ocultarFeedback(acaoSeguinte) {
        acaoAposOcultarFeedback.current = acaoSeguinte;
        setFeedback(null);
    }

    function executarAposOcultarFeedback() {
        const acao = acaoAposOcultarFeedback.current;
        acaoAposOcultarFeedback.current = null;
        acao?.();
    }

    function voltarAoPainel() {
        ocultarFeedback(() => setPainelVisivel(true));
    }

    function solicitarFechamento() {
        if (salvando) return;
        if (alterado) abrirFeedback({ tipo: 'saida' });
        else onFechar?.();
    }

    function solicitarSalvamento() {
        const validacao = validarEdicao(dataInicio, dataFim);
        abrirFeedback(
            validacao.inicio ? { tipo: 'confirmacao' } : { tipo: 'validacao', ...validacao }
        );
    }

    async function atualizarTelas() {
        try {
            const atualizado = await onAtualizado?.();
            if (atualizado === false) throw new Error('A tela não foi atualizada.');
            setFeedback({ tipo: 'sucesso' });
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
            await service.editar(ciclo.id, {
                dataInicio: validacao.inicio,
                dataFim: validacao.fim
            });
            await atualizarTelas();
        } catch (falha) {
            if (falha?.status === 401) {
                onSessaoExpirada?.({ mensagem: 'Sua sessão expirou. Entre novamente.' });
                return;
            }
            setFeedback({
                tipo: 'erro',
                titulo:
                    falha?.codigo === 'SOBREPOSICAO_CICLO' ? 'Ciclo existente' : 'Algo deu errado',
                mensagem:
                    falha?.mensagemUsuario ||
                    falha?.message ||
                    'Ocorreu um erro ao atualizar este registro. Tente novamente.'
            });
        } finally {
            setSalvando(false);
        }
    }

    function confirmarSalvamento() {
        const validacao = validarEdicao(dataInicio, dataFim);
        if (!validacao.inicio) return;

        setSalvando(true);
        ocultarFeedback(() => salvar(validacao));
    }

    return (
        <>
            <CycleEditSheet
                visivel={painelVisivel}
                dataInicio={dataInicio}
                dataFim={dataFim}
                alterado={alterado}
                salvando={salvando}
                onAlterarInicio={setDataInicio}
                onAlterarFim={setDataFim}
                onFechar={solicitarFechamento}
                onOcultar={executarAposOcultarPainel}
                onSalvar={solicitarSalvamento}
            />
            <SimpleModal
                visivel={feedback?.tipo === 'confirmacao'}
                aoFechar={voltarAoPainel}
                aoOcultar={executarAposOcultarFeedback}
                icone={WarningCircleIcon}
                corIcone={tema.cores.feedback.erro}
                titulo="Atualizar ciclo"
                mensagem="Esta alteração pode recalcular suas previsões futuras de ciclo. Deseja continuar?"
                acaoPrincipal={{ texto: 'Confirmar', aoPressionar: confirmarSalvamento }}
                acaoSecundaria={{ texto: 'Cancelar', aoPressionar: voltarAoPainel }}
            />
            <SimpleModal
                visivel={feedback?.tipo === 'saida'}
                aoFechar={voltarAoPainel}
                aoOcultar={executarAposOcultarFeedback}
                icone={WarningCircleIcon}
                titulo="Dados não salvos"
                mensagem="Deseja descartar as alterações feitas neste registro?"
                acaoPrincipal={{
                    texto: 'Continuar a editar',
                    aoPressionar: voltarAoPainel
                }}
                acaoSecundaria={{ texto: 'Sair sem salvar', aoPressionar: onFechar }}
            />
            <SimpleModal
                visivel={feedback?.tipo === 'sucesso'}
                aoFechar={onFechar}
                aoOcultar={executarAposOcultarFeedback}
                icone={DropIcon}
                titulo="Ciclo atualizado com sucesso"
                acaoPrincipal={{ texto: 'OK', aoPressionar: onFechar }}
            />
            <SimpleModal
                visivel={['erro', 'validacao', 'atualizacao'].includes(feedback?.tipo)}
                aoFechar={feedback?.tipo === 'atualizacao' ? onFechar : voltarAoPainel}
                aoOcultar={executarAposOcultarFeedback}
                icone={WarningCircleIcon}
                corIcone={tema.cores.feedback.erro}
                titulo={feedback?.titulo}
                mensagem={feedback?.mensagem}
                acaoPrincipal={
                    feedback?.tipo === 'atualizacao'
                        ? { texto: 'Tentar atualizar', aoPressionar: tentarAtualizar }
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
                        ? { texto: 'Fechar', aoPressionar: onFechar }
                        : feedback?.tipo === 'erro'
                          ? {
                                texto: 'Voltar',
                                variante: 'branco',
                                aoPressionar: voltarAoPainel
                            }
                          : undefined
                }
            />
        </>
    );
}

export { CycleEditFlow, converterCampoParaIso, formatarDataParaCampo, validarEdicao };
