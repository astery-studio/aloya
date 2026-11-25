import { useEffect, useRef, useState } from 'react';

export function useNotificationPreferences(service) {
    const [valores, definirValores] = useState(null);
    const [erroLeitura, definirErroLeitura] = useState(null);
    const [tentativaLeitura, definirTentativaLeitura] = useState(0);
    const [erroGravacao, definirErroGravacao] = useState(null);
    const [salvando, definirSalvando] = useState(false);
    const envioAtivo = useRef(false);

    useEffect(() => {
        const controller = new AbortController();
        service.buscar({ signal: controller.signal }).then(
            (resposta) => { if (!controller.signal.aborted) definirValores(resposta); },
            (erro) => { if (!controller.signal.aborted) definirErroLeitura(erro); }
        );
        return () => controller.abort();
    }, [service, tentativaLeitura]);

    function recarregar() {
        definirErroLeitura(null);
        definirTentativaLeitura((numero) => numero + 1);
    }

    async function salvar(alteracao) {
        if (envioAtivo.current) return false;
        if (valores[alteracao.chave] === alteracao.valor) return true;
        envioAtivo.current = true;
        definirSalvando(true);
        try {
            definirValores(await service.atualizar(alteracao));
            definirErroGravacao(null);
            return true;
        } catch (erro) {
            definirErroGravacao({ alteracao, status: erro?.status });
            return false;
        } finally {
            envioAtivo.current = false;
            definirSalvando(false);
        }
    }

    function descartarFalha() {
        if (!envioAtivo.current) definirErroGravacao(null);
    }

    return { valores, erroLeitura, erroGravacao, salvando, salvar, recarregar, descartarFalha };
}
