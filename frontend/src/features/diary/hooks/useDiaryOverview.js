// Busca a agregação personalizada da fase e descarta respostas obsoletas.
import { useEffect, useState } from 'react';

function useDiaryOverview({ fase, chaveAtualizacao, service, onSessaoExpirada } = {}) {
    const [resumo, setResumo] = useState(null);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (!fase || typeof service?.buscarResumo !== 'function') {
            setResumo(null);
            setCarregando(false);
            return undefined;
        }
        const controle = new AbortController();
        setCarregando(true);
        service
            .buscarResumo(fase, { signal: controle.signal })
            .then((resultado) => {
                if (!controle.signal.aborted) setResumo(resultado);
            })
            .catch((erro) => {
                if (controle.signal.aborted || erro?.name === 'AbortError') return;
                if (erro?.status === 401) onSessaoExpirada?.();
                setResumo(null);
            })
            .finally(() => {
                if (!controle.signal.aborted) setCarregando(false);
            });
        return () => controle.abort();
    }, [chaveAtualizacao, fase, onSessaoExpirada, service]);

    return { resumo, carregando };
}

export { useDiaryOverview };
