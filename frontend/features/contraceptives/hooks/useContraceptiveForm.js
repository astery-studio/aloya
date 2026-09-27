import { useMemo, useState } from 'react';
import { criarAnticoncepcional } from '../../../domain/contraceptive/Contraceptive';
import { obterFrequencia } from '../constants/contraceptiveOptions';
import { dataIsoHoje, validarAnticoncepcional } from '../utils/contraceptiveValidation';

const inicial = Object.freeze({ nome: '', tipo: '', frequenciaId: '', horarios: [], intensidadeAlerta: '', dataValidade: '', dataPrimeiroUso: '' });

function useContraceptiveForm(onSubmit) {
    const [dados, setDados] = useState(inicial);
    const [painel, setPainel] = useState(null);
    const [alerta, setAlerta] = useState(null);
    const hoje = useMemo(dataIsoHoje, []);
    const frequencia = obterFrequencia(dados.tipo, dados.frequenciaId);

    function alterar(campo, valor) {
        setDados((atual) => ({ ...atual, [campo]: valor }));
        setAlerta(null);
    }
    function selecionarTipo(tipo) {
        setDados((atual) => ({ ...atual, tipo, frequenciaId: '', horarios: [], dataValidade: '', dataPrimeiroUso: '' }));
        setPainel(null);
    }
    function selecionarFrequencia(frequenciaId) {
        setDados((atual) => ({ ...atual, frequenciaId, dataPrimeiroUso: '' }));
        setPainel(null);
    }
    async function enviar() {
        const mensagem = validarAnticoncepcional(dados, hoje);
        if (mensagem) {
            const titulo = mensagem.includes('nome') ? 'Nome não informado'
                : mensagem.includes('horário') ? 'Horário não informado' : 'Revise os dados';
            setAlerta({ tipo: 'validacao', titulo, mensagem });
            return;
        }
        try {
            const intensidadeAlerta = dados.intensidadeAlerta || 'critico';
            await onSubmit?.(criarAnticoncepcional({ ...dados, intensidadeAlerta }, frequencia));
        } catch {
            setAlerta({ tipo: 'rede', titulo: 'Não foi possível salvar', mensagem: 'Verifique sua conexão e tente novamente.' });
        }
    }

    return {
        dados, painel, alerta, hoje, enviar, alterar, selecionarTipo, selecionarFrequencia,
        abrir: setPainel, fecharPainel: () => setPainel(null), fecharAlerta: () => setAlerta(null),
        permiteMultiplos: dados.tipo === 'pilula',
        exigePrimeiroUso: Boolean(frequencia?.diasPausa && !frequencia.continuo)
    };
}

export { useContraceptiveForm };
