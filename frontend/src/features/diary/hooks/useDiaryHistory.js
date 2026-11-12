// Controla carregamento, cursor, deduplicação e atualização local do histórico do Diário.
import { useCallback, useEffect, useRef, useState } from 'react';

const MENSAGEM_ERRO = 'Não foi possível carregar seu histórico do Diário. Tente novamente.';
const MENSAGEM_ERRO_PAGINACAO = 'Não foi possível carregar mais registros.';

// Identifica falhas que exigem encerrar a sessão sem revelar detalhes técnicos.
function sessaoInvalida(erro) {
    return erro?.status === 401 || erro?.codigo === 'SESSAO_AUSENTE';
}

// Mescla páginas por id e devolve os registros em ordem cronológica decrescente.
function mesclarRegistros(atuais, novos) {
    const porId = new Map(atuais.map((registro) => [registro.id, registro]));
    for (const registro of novos) porId.set(registro.id, registro);
    return [...porId.values()].sort(
        (primeiro, segundo) => segundo.data.localeCompare(primeiro.data) || segundo.id - primeiro.id
    );
}

// Recebe o serviço autenticado e retorna o estado e as ações paginadas do histórico.
function useDiaryHistory({ service, onSessaoExpirada } = {}) {
    const [registros, setRegistros] = useState([]);
    const [proximoCursor, setProximoCursor] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [erro, setErro] = useState(null);
    const [erroCarregarMais, setErroCarregarMais] = useState(null);
    const montado = useRef(false);
    const registrosRef = useRef([]);
    const cursorRef = useRef(null);
    const controleInicial = useRef(null);
    const controlePagina = useRef(null);
    const requisicaoInicial = useRef(null);
    const requisicaoPagina = useRef(null);
    const revisao = useRef(0);

    const atualizarRegistros = useCallback((valor) => {
        const proximos = typeof valor === 'function' ? valor(registrosRef.current) : valor;
        registrosRef.current = proximos;
        setRegistros(proximos);
        return proximos;
    }, []);

    const atualizarCursor = useCallback((cursor) => {
        cursorRef.current = cursor;
        setProximoCursor(cursor);
    }, []);

    const carregar = useCallback(() => {
        if (requisicaoInicial.current) return requisicaoInicial.current;
        if (typeof service?.listarHistorico !== 'function') {
            setCarregando(false);
            setAtualizando(false);
            setErro(MENSAGEM_ERRO);
            return Promise.resolve(false);
        }

        controleInicial.current?.abort();
        controlePagina.current?.abort();
        const controle = new AbortController();
        const versao = ++revisao.current;
        controleInicial.current = controle;
        setErro(null);
        setErroCarregarMais(null);
        if (registrosRef.current.length) setAtualizando(true);
        else setCarregando(true);

        const requisicao = (async () => {
            try {
                const pagina = await service.listarHistorico({ signal: controle.signal });
                if (!montado.current || controle.signal.aborted || versao !== revisao.current) {
                    return false;
                }
                atualizarRegistros([...pagina.itens]);
                atualizarCursor(pagina.proximoCursor);
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
                if (requisicaoInicial.current === requisicao) requisicaoInicial.current = null;
                if (controleInicial.current === controle) controleInicial.current = null;
                if (montado.current) {
                    setCarregando(false);
                    setAtualizando(false);
                }
            }
        })();
        requisicaoInicial.current = requisicao;
        return requisicao;
    }, [atualizarCursor, atualizarRegistros, onSessaoExpirada, service]);

    const carregarMais = useCallback(() => {
        const cursor = cursorRef.current;
        if (
            !cursor ||
            requisicaoInicial.current ||
            requisicaoPagina.current ||
            typeof service?.listarHistorico !== 'function'
        ) {
            return requisicaoPagina.current ?? Promise.resolve(false);
        }
        const controle = new AbortController();
        const versao = revisao.current;
        controlePagina.current = controle;
        setCarregandoMais(true);
        setErroCarregarMais(null);

        const requisicao = (async () => {
            try {
                const pagina = await service.listarHistorico({ cursor, signal: controle.signal });
                if (!montado.current || controle.signal.aborted || versao !== revisao.current) {
                    return false;
                }
                atualizarRegistros((atuais) => mesclarRegistros(atuais, pagina.itens));
                atualizarCursor(pagina.proximoCursor);
                return true;
            } catch (falha) {
                if (!montado.current || controle.signal.aborted || falha?.name === 'AbortError') {
                    return false;
                }
                if (sessaoInvalida(falha)) {
                    onSessaoExpirada?.({ mensagem: 'Sua sessão expirou. Entre novamente.' });
                    return false;
                }
                setErroCarregarMais(MENSAGEM_ERRO_PAGINACAO);
                return false;
            } finally {
                if (requisicaoPagina.current === requisicao) requisicaoPagina.current = null;
                if (controlePagina.current === controle) controlePagina.current = null;
                if (montado.current) setCarregandoMais(false);
            }
        })();
        requisicaoPagina.current = requisicao;
        return requisicao;
    }, [atualizarCursor, atualizarRegistros, onSessaoExpirada, service]);

    useEffect(() => {
        montado.current = true;
        carregar();
        return () => {
            montado.current = false;
            revisao.current += 1;
            controleInicial.current?.abort();
            controlePagina.current?.abort();
            controleInicial.current = null;
            controlePagina.current = null;
            requisicaoInicial.current = null;
            requisicaoPagina.current = null;
        };
    }, [carregar]);

    const removerLocalmente = useCallback(
        (id) => {
            atualizarRegistros((atuais) => atuais.filter((registro) => registro.id !== id));
        },
        [atualizarRegistros]
    );

    const obterRegistrosAtuais = useCallback(() => registrosRef.current, []);

    return {
        registros,
        carregando,
        atualizando,
        carregandoMais,
        erro,
        erroCarregarMais,
        temMais: proximoCursor !== null,
        recarregar: carregar,
        carregarMais,
        tentarCarregarMais: carregarMais,
        obterRegistrosAtuais,
        removerLocalmente
    };
}

export { mesclarRegistros, sessaoInvalida, useDiaryHistory };
