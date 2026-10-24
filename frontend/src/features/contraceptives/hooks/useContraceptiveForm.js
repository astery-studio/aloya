//Controla os dados, validações, painéis e estados dos formulários de cadastro e edição.
import { useMemo, useState } from 'react';
import { obterFrequencia } from '../constants/contraceptiveOptions';
import { criarAnticoncepcional } from '../domain/Contraceptive';
import { dataIsoHoje, validarAnticoncepcional } from '../utils/contraceptiveValidation';

const camposEditaveis = new Set([
    'nome',
    'tipo',
    'frequenciaId',
    'horarios',
    'intensidadeAlerta',
    'dataValidade',
    'dataPrimeiroUso'
]);

const dadosVazios = Object.freeze({
    id: null,
    nome: '',
    tipo: '',
    frequenciaId: '',
    horarios: Object.freeze([]),
    intensidadeAlerta: '',
    dataValidade: '',
    dataPrimeiroUso: ''
});

//Recebe um anticoncepcional opcional e retorna os dados usados para iniciar o formulário.
function criarDadosIniciais(anticoncepcional) {
    if (!anticoncepcional || typeof anticoncepcional !== 'object') {
        return {
            ...dadosVazios,
            horarios: []
        };
    }

    return {
        id: anticoncepcional.id ?? null,
        nome: anticoncepcional.nome ?? '',
        tipo: anticoncepcional.tipo ?? '',
        frequenciaId: anticoncepcional.programacao?.frequenciaId ?? '',
        horarios: [...(anticoncepcional.programacao?.horarios ?? [])],
        intensidadeAlerta: anticoncepcional.intensidadeAlerta ?? 'critico',
        dataValidade: anticoncepcional.dataValidade ?? '',
        dataPrimeiroUso: anticoncepcional.programacao?.dataPrimeiroUso ?? ''
    };
}

//Recebe os dados do formulário e retorna apenas o conteúdo relevante para comparação.
function normalizarParaComparacao(dados) {
    const ehDiu = dados.tipo === 'diu_hormonal';

    return {
        nome: typeof dados.nome === 'string' ? dados.nome.trim() : '',
        tipo: dados.tipo,
        frequenciaId: ehDiu ? null : dados.frequenciaId || null,
        horarios: ehDiu ? [] : [...(dados.horarios ?? [])].sort(),
        intensidadeAlerta: dados.intensidadeAlerta || 'critico',
        dataValidade: ehDiu ? dados.dataValidade || null : null,
        dataPrimeiroUso: ehDiu ? null : dados.dataPrimeiroUso || null
    };
}

//Recebe dois estados do formulário e informa se possuem o mesmo conteúdo real.
function dadosSaoIguais(primeiro, segundo) {
    return JSON.stringify(normalizarParaComparacao(primeiro)) === JSON.stringify(normalizarParaComparacao(segundo));
}

//Recebe a ação de envio e um registro opcional e retorna o controle completo do formulário.
function useContraceptiveForm(onSubmit, anticoncepcionalInicial = null) {
    const [dadosOriginais] = useState(() => criarDadosIniciais(anticoncepcionalInicial));
    const [dados, setDados] = useState(() => criarDadosIniciais(anticoncepcionalInicial));
    const [painel, setPainel] = useState(null);
    const [alerta, setAlerta] = useState(null);
    const hoje = useMemo(() => dataIsoHoje(), []);
    const frequencia = obterFrequencia(dados.tipo, dados.frequenciaId);
    const modoEdicao = dadosOriginais.id !== null;
    const possuiAlteracoes = modoEdicao && !dadosSaoIguais(dados, dadosOriginais);
    const podeEnviar = typeof onSubmit === 'function' && (!modoEdicao || possuiAlteracoes);

    //Recebe um campo permitido e atualiza somente esse valor.
    function alterar(campo, valor) {
        if (!camposEditaveis.has(campo)) return false;

        const valorSeguro = campo === 'horarios' && Array.isArray(valor) ? [...valor] : valor;

        setDados((atual) => ({
            ...atual,
            [campo]: valorSeguro
        }));

        setAlerta(null);
        return true;
    }

    //Recebe um tipo e limpa frequência e horários somente quando o tipo realmente muda.
    function selecionarTipo(tipo) {
        setDados((atual) => {
            if (atual.tipo === tipo) return atual;

            return {
                ...atual,
                tipo,
                frequenciaId: '',
                horarios: [],
                dataValidade: '',
                dataPrimeiroUso: ''
            };
        });

        setAlerta(null);
        setPainel(null);
    }

    //Recebe uma frequência e limpa a data inicial somente quando a frequência muda.
    function selecionarFrequencia(frequenciaId) {
        setDados((atual) => {
            if (atual.frequenciaId === frequenciaId) return atual;

            return {
                ...atual,
                frequenciaId,
                dataPrimeiroUso: ''
            };
        });

        setAlerta(null);
        setPainel(null);
    }

    //Valida e envia o formulário, preservando os dados preenchidos quando ocorre uma falha.
    async function enviar() {
        if (!podeEnviar) return false;

        const mensagem = validarAnticoncepcional(dados, hoje);

        if (mensagem) {
            const titulo = mensagem.includes('nome')
                ? 'Nome não informado'
                : mensagem.includes('horário')
                    ? 'Horário não informado'
                    : 'Revise os dados';

            setAlerta({
                tipo: 'validacao',
                titulo,
                mensagem
            });

            return false;
        }

        try {
            const intensidadeAlerta = dados.intensidadeAlerta || 'critico';
            const anticoncepcional = criarAnticoncepcional({
                ...dados,
                intensidadeAlerta
            }, frequencia);

            await onSubmit(anticoncepcional);
            return true;
        } catch {
            setAlerta({
                tipo: 'rede',
                titulo: modoEdicao ? 'Algo deu errado' : 'Não foi possível salvar',
                mensagem: modoEdicao
                    ? 'Ocorreu um erro ao atualizar. Verifique sua conexão e tente novamente.'
                    : 'Verifique sua conexão e tente novamente.'
            });

            return false;
        }
    }

    return {
        dados,
        painel,
        alerta,
        hoje,
        modoEdicao,
        possuiAlteracoes,
        podeEnviar,
        enviar,
        alterar,
        selecionarTipo,
        selecionarFrequencia,
        abrir: setPainel,
        fecharPainel: () => setPainel(null),
        fecharAlerta: () => setAlerta(null),
        permiteMultiplos: dados.tipo === 'pilula',
        exigePrimeiroUso: Boolean(frequencia?.diasPausa && !frequencia.continuo)
    };
}

export {
    criarDadosIniciais,
    dadosSaoIguais,
    normalizarParaComparacao,
    useContraceptiveForm
};
