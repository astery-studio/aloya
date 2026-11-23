import { useCallback, useEffect, useMemo, useState } from 'react';

import { gruposPermissoes } from '../constants/permissionOptions';

function obterIdsCategoriasAtivas(catalogo) {
    return new Set(
        (catalogo?.macrocategorias ?? []).flatMap((macro) =>
            (macro.categorias ?? [])
                .filter((categoria) => categoria.ativaEfetiva)
                .map((categoria) => categoria.id)
        )
    );
}

function filtrarGruposPorCatalogo(grupos, catalogo) {
    const categoriasAtivas = obterIdsCategoriasAtivas(catalogo);

    return grupos
        .map((grupo) => ({
            ...grupo,
            permissoes: grupo.permissoes.filter((permissao) =>
                categoriasAtivas.has(permissao.id.split('.').at(-1))
            )
        }))
        .filter((grupo) => grupo.permissoes.length > 0);
}

function useVisibleDiaryPermissionGroups({ diaryService, onSessaoExpirada } = {}) {
    const possuiServico = typeof diaryService?.buscarCatalogo === 'function';
    const [catalogo, setCatalogo] = useState(null);
    const [carregando, setCarregando] = useState(possuiServico);
    const [erro, setErro] = useState(false);
    const [revisao, setRevisao] = useState(0);

    useEffect(() => {
        if (!possuiServico) return undefined;

        const controle = new AbortController();
        setCarregando(true);
        setErro(false);

        diaryService
            .buscarCatalogo({ signal: controle.signal })
            .then((resposta) => setCatalogo(resposta))
            .catch((falha) => {
                if (falha?.name === 'AbortError') return;
                if (falha?.status === 401) onSessaoExpirada?.();
                setCatalogo(null);
                setErro(true);
            })
            .finally(() => {
                if (!controle.signal.aborted) setCarregando(false);
            });

        return () => controle.abort();
    }, [diaryService, onSessaoExpirada, possuiServico, revisao]);

    const tentarNovamente = useCallback(() => setRevisao((valor) => valor + 1), []);
    const grupos = useMemo(() => {
        if (!possuiServico) return gruposPermissoes;
        return catalogo ? filtrarGruposPorCatalogo(gruposPermissoes, catalogo) : [];
    }, [catalogo, possuiServico]);

    return { grupos, carregando, erro, tentarNovamente };
}

export { filtrarGruposPorCatalogo, obterIdsCategoriasAtivas, useVisibleDiaryPermissionGroups };
