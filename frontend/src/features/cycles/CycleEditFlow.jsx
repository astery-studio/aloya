import { useState } from 'react';

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
    const alterado = dataInicio !== inicioOriginal || dataFim !== fimOriginal;

    function solicitarFechamento() {
        if (salvando) return;
        if (alterado) setFeedback({ tipo: 'saida' });
        else onFechar?.();
    }

    function solicitarSalvamento() {
        const validacao = validarEdicao(dataInicio, dataFim);
        setFeedback(
            validacao.inicio ? { tipo: 'confirmacao' } : { tipo: 'validacao', ...validacao }
        );
    }

    async function confirmarSalvamento() {
        const validacao = validarEdicao(dataInicio, dataFim);
        if (!validacao.inicio) return;
        setFeedback(null);
        setSalvando(true);
        try {
            await service.editar(ciclo.id, {
                dataInicio: validacao.inicio,
                dataFim: validacao.fim
            });
            setPainelVisivel(false);
            setFeedback({ tipo: 'sucesso' });
            await onAtualizado?.();
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

    return (
        <>
            <CycleEditSheet
                visivel={painelVisivel}
                dataInicio={dataInicio}
                dataFim={dataFim}

