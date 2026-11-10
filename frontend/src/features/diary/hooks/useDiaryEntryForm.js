import { useCallback, useEffect, useState } from 'react';

import { obterHojeDiario } from '../utils/diaryDate';
import { prepararFormularioDiario } from '../utils/diaryForm';

const MENSAGEM_SALVAMENTO = 'Não foi possível salvar o registro. Tente novamente.';

function useDiaryEntryForm({ ativo, catalogo, service, onCriado, onSessaoExpirada }) {
    const [data, setData] = useState(() => obterHojeDiario());
    const [valores, setValores] = useState({});
    const [erros, setErros] = useState({});
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (!ativo) return;
        setData(obterHojeDiario());
        setValores({});
        setErros({});
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
        try {
            const registro = await service.criarRegistro(formulario.dados);
            onCriado?.(registro);
            return true;
        } catch (erro) {
            if (erro?.status === 401) onSessaoExpirada?.();
            setErros({ geral: erro?.mensagemUsuario ?? MENSAGEM_SALVAMENTO });
            return false;
        } finally {
            setSalvando(false);
        }
    }, [catalogo, data, onCriado, onSessaoExpirada, salvando, service, valores]);

    return { data, setData, valores, erros, salvando, alterarValor, salvar };
}

export { MENSAGEM_SALVAMENTO, useDiaryEntryForm };
