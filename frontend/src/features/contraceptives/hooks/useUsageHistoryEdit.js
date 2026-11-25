import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { estadoRegistroUso } from '../utils/usageHistory';

const estadosEditaveis = ['confirmado', 'foraDoPrazo'];

function useUsageHistoryEdit(registros, aoSalvarEdicaoHistorico) {
    const [sessao, setSessao] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const envio = useRef(false);
    const hoje = new Date();
    const data = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    const hora = `${String(hoje.getHours()).padStart(2, '0')}:${String(hoje.getMinutes()).padStart(2, '0')}`;
    const editaveis = registros.filter((registro) =>
        registro.id && registro.confirmadoEm && estadosEditaveis.includes(estadoRegistroUso(registro))
        && (registro.data < data || (registro.data === data && registro.horarioProgramado <= hora))
    );
    const alvo = editaveis.find((registro) => registro.id === sessao?.id);
    const opcoes = alvo ? estadosEditaveis : [];
    const alterado = Boolean(alvo && sessao.opcao !== sessao.original);
    const podeSalvar = alterado && opcoes.includes(sessao.opcao);
    const ocorrenciasDoDia = editaveis.filter((registro) => registro.data === sessao?.data);

    function sairDoAlvo(acao) {
        if (envio.current) return;
        if (!alterado) return acao();
        Alert.alert('Descartar alteração?', 'A edição do histórico ainda não foi salva.', [
            { text: 'Continuar editando', style: 'cancel' },
            { text: 'Descartar', style: 'destructive', onPress: acao }
        ]);
    }

    function selecionar(registro) {
        if (registro.id === sessao?.id) return;
        const original = estadoRegistroUso(registro);
        sairDoAlvo(() => setSessao({ data: registro.data, id: registro.id, original, opcao: original }));
    }

    function selecionarData(dataSelecionada) {
        if (dataSelecionada === sessao?.data) return;
        const ocorrencias = editaveis.filter((registro) => registro.data === dataSelecionada);
        if (ocorrencias.length === 1) return selecionar(ocorrencias[0]);
        sairDoAlvo(() => setSessao({ data: dataSelecionada }));
    }

    async function salvar() {
        if (!podeSalvar || envio.current) return;
        envio.current = true;
        setSalvando(true);
        try {
            await aoSalvarEdicaoHistorico(alvo, { estado: sessao.opcao });
            setSessao(null);
        } catch {
            setSessao((atual) => ({ ...atual, erro: 'Não foi possível salvar. Tente novamente.' }));
        } finally {
            envio.current = false;
            setSalvando(false);
        }
    }

    return {
        sessao, setSessao, salvando, editaveis, alvo, opcoes, alterado, podeSalvar, ocorrenciasDoDia,
        sairDoAlvo, selecionar, selecionarData, salvar
    };
}

export { useUsageHistoryEdit };
