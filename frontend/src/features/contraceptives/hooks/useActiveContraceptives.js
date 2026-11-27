import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useActiveContraceptives({ ativo, service, onSessaoExpirada, atualizarAoRetomar }) {
    const [metodos, definirMetodos] = useState(null);
    const [falhou, definirFalhou] = useState(false);
    const [tentativa, definirTentativa] = useState(0);

    useEffect(() => {
        if (!ativo || !service?.listar) return;

        const controle = new AbortController();
        service.listar({ signal: controle.signal }).then(
            (resposta) => {
                if (controle.signal.aborted) return;
                if (!Array.isArray(resposta)) {
                    definirFalhou(true);
                    return;
                }
                definirMetodos(
                    resposta.filter((metodo) => metodo.ativo !== false && !metodo.removido)
                );
            },
            (erro) => {
                if (controle.signal.aborted) return;
                if (erro?.status === 401) onSessaoExpirada?.();
                definirFalhou(true);
            }
        );
        return () => controle.abort();
    }, [ativo, onSessaoExpirada, service, tentativa]);

    const recarregar = useCallback(() => {
        definirMetodos(null);
        definirFalhou(false);
        definirTentativa((atual) => atual + 1);
    }, []);

    useEffect(() => {
        if (!ativo || !atualizarAoRetomar) return;

        const assinatura = AppState.addEventListener('change', (estado) => {
            if (estado === 'active') recarregar();
        });
        return () => assinatura.remove();
    }, [ativo, atualizarAoRetomar, recarregar]);

    return { metodos, falhou, recarregar };
}
