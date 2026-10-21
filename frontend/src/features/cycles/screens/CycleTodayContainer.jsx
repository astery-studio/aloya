import { useCallback, useEffect, useRef, useState } from 'react';
import { CycleTodayScreen } from './CycleTodayScreen';

function CycleTodayContainer({ service, onSessaoExpirada, ...acoes }) {
    const [previsao, setPrevisao] = useState(null);
    const [dataSelecionada, setDataSelecionada] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);
    const controlador = useRef(null);

    const carregar = useCallback(async () => {
        controlador.current?.abort();
        const atual = new AbortController();
        controlador.current = atual;
        setCarregando(true);
        setErro(false);
        try {
            const resultado = await service.buscar({ signal: atual.signal });
            setPrevisao(resultado);
            setDataSelecionada(resultado.dataReferencia || null);
        } catch (falha) {
            if (falha?.name === 'AbortError') return;
            if (falha?.status === 401) onSessaoExpirada?.();
            else setErro(true);
        } finally {
            if (controlador.current === atual) setCarregando(false);
        }
    }, [onSessaoExpirada, service]);

    useEffect(() => {
        const atual = new AbortController();
        controlador.current = atual;

        service.buscar({ signal: atual.signal }).then((resultado) => {
            setPrevisao(resultado);
            setDataSelecionada(resultado.dataReferencia || null);
        }).catch((falha) => {
            if (falha?.name === 'AbortError') return;
            if (falha?.status === 401) onSessaoExpirada?.();
            else setErro(true);
        }).finally(() => {
            if (controlador.current === atual) setCarregando(false);
        });

        return () => atual.abort();
    }, [onSessaoExpirada, service]);

    return <CycleTodayScreen {...acoes} previsao={previsao} carregando={carregando} erro={erro} dataSelecionada={dataSelecionada} aoSelecionarData={setDataSelecionada} aoTentarNovamente={carregar} />;
}

export { CycleTodayContainer };
