import { useRef, useState } from 'react';
import { estadoRegistroUso } from '../utils/usageHistory';

const estadosEditaveis = ['confirmado', 'foraDoPrazo', 'naoUsei'];

function useUsageHistoryEdit(
    registros,
    aoSalvarEdicaoHistorico,
    horarios,
    usoUnicoPorDia,
    usosHoje,
    inicioMedicacao,
    aoMudarRodape
) {
    const [sessao, setSessao] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [popup, setPopup] = useState(null);
    const envio = useRef(false);

    const hoje = new Date();
    const data = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    const hora = `${String(hoje.getHours()).padStart(2, '0')}:${String(hoje.getMinutes()).padStart(2, '0')}`;
    const editaveis = registros.filter(
        (registro) =>
            registro.id &&
            (registro.data < data ||
                (registro.data === data && (usoUnicoPorDia || registro.horarioProgramado <= hora)))
    );
    const horariosHoje = usoUnicoPorDia
        ? usosHoje
              .filter((uso) => uso.data === data)
              .map((uso) => uso.horario)
              .slice(0, 1)
        : [];

    function horariosParaNovoRegistro(dia) {
        if (!dia || dia > data || (inicioMedicacao && dia < inicioMedicacao)) return [];
        return dia === data ? horariosHoje : horarios;
    }

    function podeCriarOcorrencia(dia) {
        return horariosParaNovoRegistro(dia).length > 0;
    }

    function ocorrenciasEm(dia) {
        const ocorrencias = editaveis.filter((registro) => registro.data === dia);
        if (usoUnicoPorDia && ocorrencias.length) return ocorrencias;

        const existentes = new Set(ocorrencias.map((registro) => registro.horarioProgramado));
        return [
            ...ocorrencias,
            ...horariosParaNovoRegistro(dia)
                .filter((horario) => !existentes.has(horario))
                .map((horario) => ({
                    id: `novo-${horario}`,
                    novo: true,
                    data: dia,
                    horarioProgramado: horario
                }))
        ];
    }

    const ocorrenciasDoDia = ocorrenciasEm(sessao?.data);
    const alvo = ocorrenciasDoDia.find((registro) => registro.id === sessao?.id);
    const opcoes = alvo ? estadosEditaveis : [];
    const alterado = Boolean(alvo && sessao.opcao !== sessao.original);
    const podeSalvar = alterado && opcoes.includes(sessao.opcao);

    function sairDoAlvo(acao) {
        if (envio.current) return;
        if (!alterado) return acao();
        setPopup({ tipo: 'descarte', aoConfirmar: acao });
    }

    function selecionar(registro) {
        if (registro.id === sessao?.id && registro.data === sessao.data) return;
        const original = estadoRegistroUso(registro);
        sairDoAlvo(() => {
            if (!sessao || Boolean(alvo?.novo) !== Boolean(registro.novo)) aoMudarRodape?.();
            setSessao({ data: registro.data, id: registro.id, original, opcao: original });
        });
    }

    function selecionarData(dataSelecionada) {
        if (envio.current || dataSelecionada === sessao?.data) return;
        const ocorrencias = ocorrenciasEm(dataSelecionada);
        if (!ocorrencias.length) return;
        if (ocorrencias.length === 1) return selecionar(ocorrencias[0]);
        sairDoAlvo(() => setSessao({ data: dataSelecionada }));
    }

    async function persistir(alteracao) {
        if (!alvo || envio.current) return;
        envio.current = true;
        setSalvando(true);
        try {
            await aoSalvarEdicaoHistorico(alvo, alteracao);
            aoMudarRodape?.();
            setSessao(null);
        } catch (falha) {
            const mensagemLimite =
                falha?.status === 429
                    ? falha.mensagemUsuario ||
                      'Muitas alterações em pouco tempo. Aguarde e tente novamente.'
                    : null;

            if (alteracao.apagar) {
                setPopup({ tipo: 'erroExclusao', mensagem: mensagemLimite });
            } else {
                setSessao((atual) => ({
                    ...atual,
                    erro: mensagemLimite ?? 'Não foi possível salvar. Tente novamente.'
                }));
            }
        } finally {
            envio.current = false;
            setSalvando(false);
        }
    }

    function salvar() {
        if (podeSalvar) return persistir({ estado: sessao.opcao });
    }

    function solicitarExclusao() {
        if (!alvo || alvo.novo || envio.current) return;
        setPopup({ tipo: 'exclusao', aoConfirmar: () => persistir({ apagar: true }) });
    }

    return {
        sessao,
        setSessao,
        salvando,
        editaveis,
        alvo,
        opcoes,
        alterado,
        podeSalvar,
        ocorrenciasDoDia,
        podeCriarOcorrencia,
        sairDoAlvo,
        selecionar,
        selecionarData,
        salvar,
        solicitarExclusao,
        popup,
        fecharPopup: () => setPopup(null)
    };
}

export { useUsageHistoryEdit };
