import { useCallback, useEffect, useState } from 'react';

import { obterHojeDiario } from '../utils/diaryDate';
import { prepararFormularioDiario } from '../utils/diaryForm';

const MENSAGEM_SALVAMENTO =
    'Ocorreu um erro ao salvar registro. Verifique sua conexão e tente novamente.';

function useDiaryEntryForm({ ativo, catalogo, service, onCriado, onSessaoExpirada }) {
    const [data, setData] = useState(() => obterHojeDiario());
    const [valores, setValores] = useState({});
    const [erros, setErros] = useState({});
    const [erroSalvamento, setErroSalvamento] = useState(null);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (!ativo) return;
        setData(obterHojeDiario());
        setValores({});
        setErros({});
        setErroSalvamento(null);
        setSalvando(false);
    }, [ativo]);

    const alterarValor = useCallback((categoriaId, valor) => {
        setValores((atuais) => ({ ...atuais, [categoriaId]: valor }));
        setErros((atuais) => {
            if (!atuais[categoriaId] && !atuais.conteudo) return atuais;
            const proximos = { ...atuais };
            delete proximos[categoriaId];
            delete proximos.conteudo;
            return proximos;
        });
    }, []);

    const limparErroSalvamento = useCallback(() => setErroSalvamento(null), []);

    const salvar = useCallback(async () => {
        if (salvando || typeof service?.criarRegistro !== 'function') return false;
        const formulario = prepararFormularioDiario({
            catalogo,
            valores,
            data,
            hoje: obterHojeDiario()
        });
        setErros(formulario.erros);
        if (!formulario.valido) return false;

        setSalvando(true);
        setErroSalvamento(null);
        try {
            const registro = await service.criarRegistro(formulario.dados);
            onCriado?.(registro);
            return true;
        } catch (erro) {
            if (erro?.status === 401) onSessaoExpirada?.();
            setErroSalvamento(MENSAGEM_SALVAMENTO);
            return false;
        } finally {
            setSalvando(false);
        }
    }, [catalogo, data, onCriado, onSessaoExpirada, salvando, service, valores]);

    return {
        data,
        setData,
        valores,
        erros,
        erroSalvamento,
        salvando,
        alterarValor,
        limparErroSalvamento,
        salvar
    };
}

export { MENSAGEM_SALVAMENTO, useDiaryEntryForm };
