// Busca detalhes somente quando solicitados e os remove da memória ao fechar.
import { useCallback, useEffect, useRef, useState } from 'react';

import { sessaoInvalida } from './useDiaryHistory';

const MENSAGEM_ERRO = 'Não foi possível carregar este registro. Tente novamente.';

// Recebe o serviço autenticado e retorna estado e ações do detalhe selecionado.
function useDiaryRecordDetails({ service, onSessaoExpirada } = {}) {
    const [resumoSelecionado, setResumoSelecionado] = useState(null);
    const [registro, setRegistro] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const montado = useRef(false);
    const selecionadoRef = useRef(null);
    const controleRef = useRef(null);
    const revisao = useRef(0);

    useEffect(() => {
        montado.current = true;
        return () => {
            montado.current = false;
            revisao.current += 1;
            controleRef.current?.abort();
        };
    }, []);

    const buscar = useCallback(
        async (resumo) => {
            if (
                !resumo ||
                !Number.isSafeInteger(resumo.id) ||
                resumo.id <= 0 ||
                typeof service?.buscarDetalhe !== 'function'
            ) {
                return false;
            }
            controleRef.current?.abort();
            const controle = new AbortController();
            const versao = ++revisao.current;
            controleRef.current = controle;
            selecionadoRef.current = resumo;
            setResumoSelecionado(resumo);
            setRegistro(null);
            setErro(null);
            setCarregando(true);

            try {
                const detalhe = await service.buscarDetalhe(resumo.id, { signal: controle.signal });
                if (!montado.current || controle.signal.aborted || versao !== revisao.current) {
                    return false;
                }
                setRegistro(detalhe);
                return true;
            } catch (falha) {
                if (!montado.current || controle.signal.aborted || falha?.name === 'AbortError') {
                    return false;
                }
                if (sessaoInvalida(falha)) {
                    onSessaoExpirada?.({ mensagem: 'Sua sessão expirou. Entre novamente.' });
                    return false;
                }
                setErro(MENSAGEM_ERRO);
                return false;
            } finally {
                if (controleRef.current === controle) controleRef.current = null;
                if (montado.current && versao === revisao.current) setCarregando(false);
            }
        },
        [onSessaoExpirada, service]
    );

    const fechar = useCallback(() => {
        revisao.current += 1;
        controleRef.current?.abort();
        controleRef.current = null;
        selecionadoRef.current = null;
        setResumoSelecionado(null);
        setRegistro(null);
        setErro(null);
        setCarregando(false);
    }, []);

    const abrirDetalhe = useCallback((detalhe) => {
        if (!detalhe || !Number.isSafeInteger(detalhe.id) || !Array.isArray(detalhe.categorias)) {
            return false;
        }
        revisao.current += 1;
        controleRef.current?.abort();
        controleRef.current = null;
        selecionadoRef.current = detalhe;
        setResumoSelecionado(detalhe);
        setRegistro(detalhe);
        setErro(null);
        setCarregando(false);
        return true;
    }, []);

    const tentarNovamente = useCallback(() => {
        return selecionadoRef.current ? buscar(selecionadoRef.current) : Promise.resolve(false);
    }, [buscar]);

    return {
        visivel: resumoSelecionado !== null,
        resumoSelecionado,
        registro,
        carregando,
        erro,
        abrir: buscar,
        abrirDetalhe,
        fechar,
        tentarNovamente
    };
}

export { useDiaryRecordDetails };
