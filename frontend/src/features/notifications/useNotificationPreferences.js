import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export function useNotificationPreferences(service, { atualizarAoRetomar = false } = {}) {
    const [valores, definirValores] = useState(null);
    const [erroLeitura, definirErroLeitura] = useState(null);
    const [tentativaLeitura, definirTentativaLeitura] = useState(0);
    const [erroGravacao, definirErroGravacao] = useState(null);
    const [salvando, definirSalvando] = useState(false);

    const envioAtivo = useRef(false);

    useEffect(() => {
        const controller = new AbortController();

        service.buscar({ signal: controller.signal }).then(
            (resposta) => {
                if (!controller.signal.aborted) definirValores(resposta);
            },
            (erro) => {
                if (!controller.signal.aborted) definirErroLeitura(erro);
            }
        );

        return () => controller.abort();
    }, [service, tentativaLeitura]);

    const recarregar = useCallback(() => {
        if (envioAtivo.current) return;
        definirValores(null);
        definirErroLeitura(null);
        definirTentativaLeitura((numero) => numero + 1);
    }, []);

    useEffect(() => {
        if (!atualizarAoRetomar) return;

        const inscricao = AppState.addEventListener('change', (estado) => {
            if (estado === 'active') recarregar();
        });
        return () => inscricao.remove();
    }, [atualizarAoRetomar, recarregar]);

    async function salvar(alteracao) {
        if (envioAtivo.current || !valores) return false;
        if (typeof alteracao.valor !== 'boolean' && valores[alteracao.chave] === alteracao.valor) return true;

        envioAtivo.current = true;
        definirSalvando(true);

        try {
            definirValores(await service.atualizar(alteracao));
            definirErroGravacao(null);
            return true;
        } catch (erro) {
            if (erro?.codigo === 'PREFERENCIA_NOTIFICACAO_SEM_ACESSO') {
                definirErroGravacao(null);
                envioAtivo.current = false;
                recarregar();
            } else {
                definirErroGravacao({ alteracao, status: erro?.status });
            }
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
