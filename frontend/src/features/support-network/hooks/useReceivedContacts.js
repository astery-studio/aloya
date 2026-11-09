import { useCallback, useEffect, useRef, useState } from 'react';

const MENSAGEM_ERRO_LISTAGEM =
    'Não foi possível carregar sua Rede de Apoio no momento. Tente novamente.';
const MENSAGEM_ERRO_RESPOSTA = 'Não foi possível responder ao convite no momento. Tente novamente.';
const MENSAGEM_SESSAO_EXPIRADA = 'Sua sessão expirou. Entre novamente.';
const CODIGOS_SESSAO_INVALIDA = new Set([
    'NAO_AUTENTICADO',
    'TOKEN_INVALIDO',
    'SESSAO_INVALIDA',
    'SESSAO_AUSENTE'
]);

function erroEhSessaoInvalida(erro) {
    return erro?.status === 401 || CODIGOS_SESSAO_INVALIDA.has(erro?.codigo);
}

function atualizarContatoAceito(contato) {
    return Object.freeze({
        ...contato,
        status: 'ativo',
        statusRotulo: 'Ativo',
        aguardando: null,
        acoes: Object.freeze({
            ...(contato.acoes ?? {}),
            podeAceitar: false,
            podeRecusar: false,
            podeAbrirResumo: true
        })
    });
}

function useReceivedContacts({ service, onSessaoExpirada } = {}) {
    const [contatos, setContatos] = useState(() => Object.freeze([]));
    const [resumo, setResumo] = useState(() =>
        Object.freeze({ total: 0, pendentes: 0, ativos: 0 })
    );
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState(null);
    const [erroAcao, setErroAcao] = useState(null);
    const [resultadoAcao, setResultadoAcao] = useState(null);
    const [contatoEmAndamentoId, setContatoEmAndamentoId] = useState(null);
    const [acaoEmAndamento, setAcaoEmAndamento] = useState(null);

    const montadoRef = useRef(false);
    const contatosRef = useRef([]);
    const requisicaoRef = useRef(null);
    const controladorRef = useRef(null);
    const respostaRef = useRef(null);

    useEffect(() => {
        contatosRef.current = contatos;
    }, [contatos]);

    const carregar = useCallback(() => {
        if (requisicaoRef.current) return requisicaoRef.current;

        if (typeof service?.listarRecebidos !== 'function') {
            setCarregando(false);
            setAtualizando(false);
            setErro(MENSAGEM_ERRO_LISTAGEM);
            return Promise.resolve(false);
        }

        const controlador = new AbortController();
        controladorRef.current = controlador;
        setErro(null);

        if (contatosRef.current.length > 0) setAtualizando(true);
        else setCarregando(true);

        const requisicao = (async () => {
            try {
                const resultado = await service.listarRecebidos({
                    signal: controlador.signal
                });

                if (!montadoRef.current || controlador.signal.aborted) return false;

                setContatos(resultado.contatos);
                setResumo(resultado.resumo);
                return true;
            } catch (falha) {
                if (
                    !montadoRef.current ||
                    controlador.signal.aborted ||
                    falha?.name === 'AbortError'
                ) {
                    return false;
                }

                if (erroEhSessaoInvalida(falha)) {
                    onSessaoExpirada?.({ mensagem: MENSAGEM_SESSAO_EXPIRADA });
                    return false;
                }

                setErro(MENSAGEM_ERRO_LISTAGEM);
                return false;
            } finally {
                if (requisicaoRef.current === requisicao) requisicaoRef.current = null;
                if (controladorRef.current === controlador) controladorRef.current = null;
                if (montadoRef.current) {
                    setCarregando(false);
                    setAtualizando(false);
                }
            }
        })();

        requisicaoRef.current = requisicao;
        return requisicao;
    }, [onSessaoExpirada, service]);

    useEffect(() => {
        montadoRef.current = true;
        carregar();

        return () => {
            montadoRef.current = false;
            controladorRef.current?.abort();
            controladorRef.current = null;
            requisicaoRef.current = null;
            respostaRef.current = null;
        };
    }, [carregar]);

    const responder = useCallback(
        (conviteId, acao) => {
            if (respostaRef.current || typeof service?.responderConvite !== 'function') {
                return Promise.resolve(false);
            }

            setErroAcao(null);
            setResultadoAcao(null);
            setContatoEmAndamentoId(conviteId);
            setAcaoEmAndamento(acao);

            const requisicao = (async () => {
                try {
                    const resultado = await service.responderConvite(conviteId, acao);
                    if (!montadoRef.current) return false;

                    if (acao === 'aceitar') {
                        setContatos((atuais) =>
                            Object.freeze(
                                atuais.map((contato) =>
                                    contato.id === conviteId
                                        ? atualizarContatoAceito(contato)
                                        : contato
                                )
                            )
                        );
                        setResumo((atual) =>
                            Object.freeze({
                                total: atual.total,
                                pendentes: Math.max(0, atual.pendentes - 1),
                                ativos: atual.ativos + 1
                            })
                        );
                    } else {
                        setContatos((atuais) =>
                            Object.freeze(atuais.filter(({ id }) => id !== conviteId))
                        );
                        setResumo((atual) =>
                            Object.freeze({
                                total: Math.max(0, atual.total - 1),
                                pendentes: Math.max(0, atual.pendentes - 1),
                                ativos: atual.ativos
                            })
                        );
                    }

                    setResultadoAcao(resultado);
                    return true;
                } catch (falha) {
                    if (!montadoRef.current) return false;

                    if (erroEhSessaoInvalida(falha)) {
                        onSessaoExpirada?.({ mensagem: MENSAGEM_SESSAO_EXPIRADA });
                        return false;
                    }

                    setErroAcao(MENSAGEM_ERRO_RESPOSTA);
                    return false;
                } finally {
                    if (respostaRef.current === requisicao) respostaRef.current = null;
                    if (montadoRef.current) {
                        setContatoEmAndamentoId(null);
                        setAcaoEmAndamento(null);
                    }
                }
            })();

            respostaRef.current = requisicao;
            return requisicao;
        },
        [onSessaoExpirada, service]
    );

    const limparResultado = useCallback(() => {
        setErroAcao(null);
        setResultadoAcao(null);
    }, []);

    return {
        contatos,
        resumo,
        carregando,
        atualizando,
        erro,
        erroAcao,
        resultadoAcao,
        contatoEmAndamentoId,
        acaoEmAndamento,
        tentarNovamente: carregar,
        atualizarLista: carregar,
        responder,
        limparResultado
    };
}

export {
    MENSAGEM_ERRO_LISTAGEM,
    MENSAGEM_ERRO_RESPOSTA,
    atualizarContatoAceito,
    erroEhSessaoInvalida,
    useReceivedContacts
};
