import { useCallback, useEffect, useRef, useState } from 'react';

const MENSAGEM_ERRO = 'Não foi possível carregar o Diário. Tente novamente.';

function useDiaryCatalog({ ativo, service, onSessaoExpirada }) {
    const [catalogo, setCatalogo] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const requisicao = useRef(0);
    const controleAtual = useRef(null);

    const carregar = useCallback(() => {
        if (!ativo || typeof service?.buscarCatalogo !== 'function') return undefined;
        controleAtual.current?.abort();
        const controle = new AbortController();
        controleAtual.current = controle;
        const id = requisicao.current + 1;
        requisicao.current = id;
        setCarregando(true);
        setErro(null);

        service
            .buscarCatalogo({ signal: controle.signal })
            .then((resposta) => {
                if (requisicao.current === id) setCatalogo(resposta);
            })
            .catch((falha) => {
                if (falha?.name === 'AbortError' || requisicao.current !== id) return;
                if (falha?.status === 401) onSessaoExpirada?.();
                setErro(falha?.mensagemUsuario ?? MENSAGEM_ERRO);
            })
            .finally(() => {
                if (requisicao.current === id) setCarregando(false);
                if (controleAtual.current === controle) controleAtual.current = null;
            });
    }, [ativo, onSessaoExpirada, service]);

    useEffect(() => {
        if (!ativo) {
            controleAtual.current?.abort();
            controleAtual.current = null;
            requisicao.current += 1;
            setCatalogo(null);
            setErro(null);
            setCarregando(false);
            return undefined;
        }
        carregar();
        return () => controleAtual.current?.abort();
    }, [ativo, carregar]);

    return { catalogo, carregando, erro, recarregar: carregar };
}

export { MENSAGEM_ERRO, useDiaryCatalog };
