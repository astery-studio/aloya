import { useCallback, useEffect, useRef, useState } from 'react';

const MENSAGEM_ERRO =
    'Ocorreu um erro ao gerenciar categorias. Verifique sua conexão e tente novamente.';

function obterEstadoPreferencia(catalogo, { tipo, id }) {
    const macros = catalogo?.macrocategorias ?? [];
    if (tipo === 'macrocategoria') {
        return macros.find((macro) => macro.id === id)?.ativa;
    }
    for (const macro of macros) {
        const categoria = macro.categorias.find((item) => item.id === id);
        if (categoria) return categoria.ativaIndividual;
    }
    return undefined;
}

function aplicarPreferencia(catalogo, { tipo, id, ativa }) {
    if (!catalogo) return catalogo;
    return {
        ...catalogo,
        macrocategorias: catalogo.macrocategorias.map((macro) => {
            if (tipo === 'macrocategoria' && macro.id === id) {
                return {
                    ...macro,
                    ativa,
                    categorias: macro.categorias.map((categoria) => ({
                        ...categoria,
                        ...(ativa ? { ativaIndividual: true } : {}),
                        ativaEfetiva: ativa
                    }))
                };
            }
            if (tipo !== 'categoria') return macro;
            return {
                ...macro,
                categorias: macro.categorias.map((categoria) =>
                    categoria.id === id
                        ? {
                              ...categoria,
                              ativaIndividual: ativa,
                              ativaEfetiva: macro.ativa && ativa
                          }
                        : categoria
                )
            };
        })
    };
}

function useDiaryCategoryPreferences({ ativo = true, service, onSessaoExpirada }) {
    const [catalogo, setCatalogo] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(null);
    const [erro, setErro] = useState(null);
    const catalogoAtual = useRef(null);
    const salvamentoAtual = useRef(false);
    const controleAtual = useRef(null);
    const ultimaTentativa = useRef(null);

    const definirCatalogo = useCallback((valor) => {
        catalogoAtual.current = valor;
        setCatalogo(valor);
    }, []);

    const carregar = useCallback(async () => {
        if (!ativo || typeof service?.buscarCatalogo !== 'function') return false;
        controleAtual.current?.abort();
        const controle = new AbortController();
        controleAtual.current = controle;
        setCarregando(true);
        setErro(null);
        try {
            const resposta = await service.buscarCatalogo({ signal: controle.signal });
            definirCatalogo(resposta);
            ultimaTentativa.current = null;
            return true;
        } catch (falha) {
            if (falha?.name === 'AbortError') return false;
            if (falha?.status === 401) onSessaoExpirada?.();
            setErro(MENSAGEM_ERRO);
            return false;
        } finally {
            if (controleAtual.current === controle) controleAtual.current = null;
            setCarregando(false);
        }
    }, [ativo, definirCatalogo, onSessaoExpirada, service]);

    useEffect(() => {
        if (!ativo) {
            controleAtual.current?.abort();
            definirCatalogo(null);
            setCarregando(false);
            setErro(null);
            return undefined;
        }
        carregar();
        return () => controleAtual.current?.abort();
    }, [ativo, carregar, definirCatalogo]);

    const persistir = useCallback(
        async (tentativa) => {
            const base = catalogoAtual.current;
            const metodo =
                tentativa.tipo === 'macrocategoria'
                    ? service?.atualizarMacrocategoria
                    : service?.atualizarCategoria;
            if (!base || salvamentoAtual.current || typeof metodo !== 'function') return false;

            salvamentoAtual.current = true;
            ultimaTentativa.current = tentativa;
            setSalvando(`${tentativa.tipo}:${tentativa.id}`);
            setErro(null);
            definirCatalogo(aplicarPreferencia(base, tentativa));

            let estadoParaReverter = base;
            try {
                let resposta;
                try {
                    resposta = await metodo(tentativa.id, tentativa.ativa, base.versao);
                } catch (falha) {
                    if (falha?.status !== 409) throw falha;
                    const sincronizado = await service.buscarCatalogo();
                    estadoParaReverter = sincronizado;
                    if (obterEstadoPreferencia(sincronizado, tentativa) === tentativa.ativa) {
                        resposta = sincronizado;
                    } else {
                        definirCatalogo(aplicarPreferencia(sincronizado, tentativa));
                        resposta = await metodo(tentativa.id, tentativa.ativa, sincronizado.versao);
                    }
                }
                definirCatalogo(resposta);
                ultimaTentativa.current = null;
                return true;
            } catch (falha) {
                definirCatalogo(estadoParaReverter);
                if (falha?.status === 401) onSessaoExpirada?.();
                setErro(MENSAGEM_ERRO);
                return false;
            } finally {
                salvamentoAtual.current = false;
                setSalvando(null);
            }
        },
        [definirCatalogo, onSessaoExpirada, service]
    );

    const alterarMacrocategoria = useCallback(
        (id, ativa) => persistir({ tipo: 'macrocategoria', id, ativa }),
        [persistir]
    );
    const alterarCategoria = useCallback(
        (id, ativa) => persistir({ tipo: 'categoria', id, ativa }),
        [persistir]
    );
    const tentarNovamente = useCallback(() => {
        const tentativa = ultimaTentativa.current;
        return tentativa ? persistir(tentativa) : carregar();
    }, [carregar, persistir]);
    const fecharErro = useCallback(() => setErro(null), []);

    return {
        catalogo,
        carregando,
        salvando,
        erro,
        erroCarregamento: Boolean(erro && !catalogo),
        alterarMacrocategoria,
        alterarCategoria,
        tentarNovamente,
        fecharErro
    };
}

export { MENSAGEM_ERRO, aplicarPreferencia, obterEstadoPreferencia, useDiaryCategoryPreferences };
