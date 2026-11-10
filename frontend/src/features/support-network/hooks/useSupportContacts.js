import { useCallback, useEffect, useRef, useState } from 'react';

const MENSAGEM_ERRO_LISTAGEM =
    'Não foi possível carregar sua Rede de Apoio no momento. Tente novamente.';

const MENSAGEM_ERRO_REENVIO = 'Não foi possível reenviar o convite no momento. Tente novamente.';
const MENSAGEM_ERRO_REMOCAO =
    'Ocorreu um erro ao remover contato. Verifique sua conexão e tente novamente.';
const MENSAGEM_ERRO_CANCELAMENTO =
    'Ocorreu um erro ao cancelar seu convite. Verifique sua conexão e tente novamente.';
const MENSAGEM_ERRO_DESATIVACAO =
    'Ocorreu um erro ao desativar contato. Verifique sua conexão e tente novamente.';

const MENSAGEM_SESSAO_EXPIRADA = 'Sua sessão expirou. Entre novamente.';

const CODIGOS_SESSAO_INVALIDA = new Set([
    'NAO_AUTENTICADO',
    'TOKEN_INVALIDO',
    'SESSAO_INVALIDA',
    'SESSAO_AUSENTE'
]);

const RESUMO_VAZIO = Object.freeze({
    total: 0,
    pendentes: 0,
    ativos: 0,
    inativos: 0,
    recusados: 0
});

function erroEhSessaoInvalida(erro) {
    return erro?.status === 401 || CODIGOS_SESSAO_INVALIDA.has(erro?.codigo);
}

function atualizarContatoAposReenvio(contato, convite) {
    if (contato.id !== convite.id) {
        return contato;
    }

    return Object.freeze({
        ...contato,
        status: 'pendente',
        statusRotulo: 'Pendente',
        dataConvite: convite.dataEnvio,
        aguardando: Object.freeze({
            dias: 0,
            atrasado: false,
            rotulo: 'Aguardando há 0 dias'
        }),
        acoes: Object.freeze({
            ...(contato.acoes ?? {}),
            podeAlterarVinculo: false,
            podeRemover: true,
            podeReenviarConvite: true
        })
    });
}

function calcularResumoLocal(contatos) {
    return Object.freeze({
        total: contatos.length,
        pendentes: contatos.filter(({ status }) => status === 'pendente').length,
        ativos: contatos.filter(({ status }) => status === 'ativo').length,
        inativos: contatos.filter(({ status }) => status === 'inativo').length,
        recusados: contatos.filter(({ status }) => status === 'recusado').length
    });
}

function useSupportContacts({ service, onSessaoExpirada } = {}) {
    const [contatos, setContatos] = useState(() => Object.freeze([]));

    const [resumo, setResumo] = useState(RESUMO_VAZIO);

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
    const reenvioRef = useRef(null);
    const acaoContatoRef = useRef(null);

    useEffect(() => {
        contatosRef.current = contatos;
    }, [contatos]);

    const carregar = useCallback(() => {
        if (requisicaoRef.current) {
            return requisicaoRef.current;
        }

        if (typeof service?.listar !== 'function') {
            setCarregando(false);
            setAtualizando(false);
            setErro(MENSAGEM_ERRO_LISTAGEM);

            return Promise.resolve(false);
        }

        const controlador = new AbortController();

        controladorRef.current = controlador;
        setErro(null);

        if (contatosRef.current.length > 0) {
            setAtualizando(true);
        } else {
            setCarregando(true);
        }

        const requisicao = (async () => {
            try {
                const resultado = await service.listar({
                    signal: controlador.signal
                });

                if (!montadoRef.current || controlador.signal.aborted) {
                    return false;
                }

                setContatos(resultado.contatos);
                setResumo(resultado.resumo);
                setErro(null);

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
                    setErro(null);

                    onSessaoExpirada?.({
                        mensagem: MENSAGEM_SESSAO_EXPIRADA
                    });

                    return false;
                }

                setErro(MENSAGEM_ERRO_LISTAGEM);

                return false;
            } finally {
                if (requisicaoRef.current === requisicao) {
                    requisicaoRef.current = null;
                }

                if (controladorRef.current === controlador) {
                    controladorRef.current = null;
                }

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
            reenvioRef.current = null;
            acaoContatoRef.current = null;
        };
    }, [carregar]);

    const reenviarConvite = useCallback(
        (contatoId) => {
            if (reenvioRef.current || typeof service?.reenviarConvite !== 'function') {
                return Promise.resolve(false);
            }

            setErroAcao(null);
            setResultadoAcao(null);
            setContatoEmAndamentoId(contatoId);
            setAcaoEmAndamento('reenviar');

            const requisicao = (async () => {
                try {
                    const resultado = await service.reenviarConvite(contatoId);

                    if (!montadoRef.current) {
                        return false;
                    }

                    setContatos((contatosAtuais) =>
                        Object.freeze(
                            contatosAtuais.map((contato) =>
                                atualizarContatoAposReenvio(contato, resultado.convite)
                            )
                        )
                    );

                    setResultadoAcao(
                        Object.freeze({
                            tipo: 'reenviar',
                            mensagem: resultado.mensagem,
                            contatoId
                        })
                    );

                    return true;
                } catch (falha) {
                    if (!montadoRef.current) {
                        return false;
                    }

                    if (erroEhSessaoInvalida(falha)) {
                        onSessaoExpirada?.({
                            mensagem: MENSAGEM_SESSAO_EXPIRADA
                        });

                        return false;
                    }

                    setErroAcao(MENSAGEM_ERRO_REENVIO);

                    return false;
                } finally {
                    if (reenvioRef.current === requisicao) {
                        reenvioRef.current = null;
                    }

                    if (montadoRef.current) {
                        setContatoEmAndamentoId(null);
                        setAcaoEmAndamento(null);
                    }
                }
            })();

            reenvioRef.current = requisicao;

            return requisicao;
        },
        [onSessaoExpirada, service]
    );

    const limparResultadoAcao = useCallback(() => {
        setErroAcao(null);
        setResultadoAcao(null);
    }, []);

    const executarAcaoContato = useCallback(
        (tipo, contatoId) => {
            if (acaoContatoRef.current) return Promise.resolve(false);

            const contato = contatosRef.current.find(
                (item) => String(item.id) === String(contatoId)
            );
            const convitePendente = contato?.status === 'pendente';
            const metodo =
                tipo === 'desativar' ? service?.desativarContato : service?.removerContato;

            if (typeof metodo !== 'function') return Promise.resolve(false);

            setErroAcao(null);
            setResultadoAcao(null);
            setContatoEmAndamentoId(contatoId);
            setAcaoEmAndamento(tipo);

            const requisicao = (async () => {
                try {
                    const resultado =
                        tipo === 'desativar'
                            ? await metodo.call(service, contatoId)
                            : await metodo.call(service, contatoId, { convitePendente });

                    if (!montadoRef.current) return false;

                    const atualizados =
                        tipo === 'desativar'
                            ? contatosRef.current.map((item) =>
                                  item.id === contatoId
                                      ? Object.freeze({
                                            ...item,
                                            status: 'inativo',
                                            statusRotulo: 'Inativo',
                                            dataDesativacao: new Date().toISOString(),
                                            aguardando: Object.freeze({
                                                dias: 0,
                                                atrasado: false,
                                                rotulo: 'Desativado há 0 dias'
                                            }),
                                            acoes: Object.freeze({
                                                podeAlterarVinculo: false,
                                                podeRemover: true,
                                                podeReenviarConvite: false
                                            })
                                        })
                                      : item
                              )
                            : contatosRef.current.filter((item) => item.id !== contatoId);

                    const congelados = Object.freeze(atualizados);
                    contatosRef.current = congelados;
                    setContatos(congelados);
                    setResumo(calcularResumoLocal(congelados));

                    setResultadoAcao(
                        Object.freeze({
                            tipo,
                            mensagem: resultado.mensagem,
                            contatoId
                        })
                    );
                    return true;
                } catch (falha) {
                    if (!montadoRef.current) return false;

                    if (erroEhSessaoInvalida(falha)) {
                        onSessaoExpirada?.({ mensagem: MENSAGEM_SESSAO_EXPIRADA });
                        return false;
                    }

                    setErroAcao(
                        tipo === 'desativar'
                            ? MENSAGEM_ERRO_DESATIVACAO
                            : convitePendente
                              ? MENSAGEM_ERRO_CANCELAMENTO
                              : MENSAGEM_ERRO_REMOCAO
                    );
                    return false;
                } finally {
                    if (acaoContatoRef.current === requisicao) acaoContatoRef.current = null;
                    if (montadoRef.current) {
                        setContatoEmAndamentoId(null);
                        setAcaoEmAndamento(null);
                    }
                }
            })();

            acaoContatoRef.current = requisicao;
            return requisicao;
        },
        [onSessaoExpirada, service]
    );

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
        desativarContato: (contatoId) => executarAcaoContato('desativar', contatoId),
        reenviarConvite,
        removerContato: (contatoId) => executarAcaoContato('remover', contatoId),
        limparResultadoAcao
    };
}

export {
    MENSAGEM_ERRO_LISTAGEM,
    MENSAGEM_ERRO_CANCELAMENTO,
    MENSAGEM_ERRO_DESATIVACAO,
    MENSAGEM_ERRO_REMOCAO,
    MENSAGEM_ERRO_REENVIO,
    MENSAGEM_SESSAO_EXPIRADA,
    RESUMO_VAZIO,
    atualizarContatoAposReenvio,
    calcularResumoLocal,
    erroEhSessaoInvalida,
    useSupportContacts
};
