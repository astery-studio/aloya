// Coordena confirmação, envio único, retentativa e feedback da exclusão do Diário.
import { useCallback, useEffect, useRef, useState } from 'react';

import { sessaoInvalida } from './useDiaryHistory';

const MENSAGEM_ERRO =
    'Ocorreu um erro ao excluir registro. Verifique sua conexão e tente novamente.';

// Verifica se o resumo possui id e versão suficientes para solicitar exclusão segura.
function registroPodeSerExcluido(registro) {
    return (
        registro &&
        typeof registro === 'object' &&
        Number.isSafeInteger(registro.id) &&
        registro.id > 0 &&
        Number.isSafeInteger(registro.versao) &&
        registro.versao >= 0
    );
}

// Recebe o serviço autenticado e retorna os estados e ações do fluxo de exclusão.
function useDeleteDiaryEntry({ service, onExcluido, onSessaoExpirada } = {}) {
    const [registro, setRegistro] = useState(null);
    const [excluindo, setExcluindo] = useState(false);
    const [erro, setErro] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const montado = useRef(false);
    const registroRef = useRef(null);
    const controleRef = useRef(null);
    const requisicaoRef = useRef(null);

    useEffect(() => {
        montado.current = true;
        return () => {
            montado.current = false;
            controleRef.current?.abort();
            requisicaoRef.current = null;
        };
    }, []);

    const solicitar = useCallback((item) => {
        if (requisicaoRef.current || !registroPodeSerExcluido(item)) return false;
        registroRef.current = item;
        setRegistro(item);
        setErro(false);
        setSucesso(false);
        return true;
    }, []);

    const cancelar = useCallback(() => {
        if (requisicaoRef.current) return false;
        registroRef.current = null;
        setRegistro(null);
        setErro(false);
        return true;
    }, []);

    const confirmar = useCallback(() => {
        const alvo = registroRef.current;
        if (
            requisicaoRef.current ||
            !registroPodeSerExcluido(alvo) ||
            typeof service?.excluirRegistro !== 'function'
        ) {
            return requisicaoRef.current ?? Promise.resolve(false);
        }
        const controle = new AbortController();
        controleRef.current = controle;
        setExcluindo(true);
        setErro(false);

        const requisicao = (async () => {
            try {
                await service.excluirRegistro(alvo.id, alvo.versao, { signal: controle.signal });
                if (!montado.current || controle.signal.aborted) return false;
                registroRef.current = null;
                setRegistro(null);
                setSucesso(true);
                onExcluido?.(alvo);
                return true;
            } catch (falha) {
                if (!montado.current || controle.signal.aborted || falha?.name === 'AbortError') {
                    return false;
                }
                if (sessaoInvalida(falha)) {
                    registroRef.current = null;
                    setRegistro(null);
                    onSessaoExpirada?.({ mensagem: 'Sua sessão expirou. Entre novamente.' });
                    return false;
                }
                setRegistro(null);
                setErro(true);
                return false;
            } finally {
                requisicaoRef.current = null;
                controleRef.current = null;
                if (montado.current) setExcluindo(false);
            }
        })();
        requisicaoRef.current = requisicao;
        return requisicao;
    }, [onExcluido, onSessaoExpirada, service]);

    const tentarNovamente = useCallback(() => {
        setErro(false);
        return confirmar();
    }, [confirmar]);

    const fecharErro = useCallback(() => {
        setErro(false);
        registroRef.current = null;
    }, []);

    const concluirSucesso = useCallback(() => setSucesso(false), []);

    return {
        registro,
        confirmacaoVisivel: registro !== null,
        excluindo,
        erro,
        mensagemErro: MENSAGEM_ERRO,
        sucesso,
        solicitar,
        cancelar,
        confirmar,
        tentarNovamente,
        fecharErro,
        concluirSucesso
    };
}

export { registroPodeSerExcluido, useDeleteDiaryEntry };
