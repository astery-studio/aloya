import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

function useSharedContent(consultar, { intervaloAtualizacaoMs } = {}) {
    const [resultado, setResultado] = useState(null);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if (!consultar) return undefined;
        const controle = new AbortController();
        let consultando = false;
        let possuiDados = false;

        async function carregar() {
            if (consultando || controle.signal.aborted) return;
            consultando = true;
            try {
                const dados = await consultar({ signal: controle.signal });
                if (controle.signal.aborted) return;
                possuiDados = true;
                setResultado({ consultar, tentativa, dados });
            } catch (erro) {
                if (!controle.signal.aborted && !possuiDados && erro?.name !== 'AbortError') {
                    setResultado({ consultar, tentativa, erro: true });
                }
            } finally {
                consultando = false;
            }
        }

        void carregar();
        if (!intervaloAtualizacaoMs) return () => controle.abort();

        const intervalo = setInterval(() => {
            if (!AppState.currentState || AppState.currentState === 'active') void carregar();
        }, intervaloAtualizacaoMs);
        const assinatura = AppState.addEventListener('change', (estado) => {
            if (estado === 'active') void carregar();
        });
        return () => {
            clearInterval(intervalo);
            assinatura.remove();
            controle.abort();
        };
    }, [consultar, intervaloAtualizacaoMs, tentativa]);

    const atual =
        resultado?.consultar === consultar && resultado?.tentativa === tentativa ? resultado : null;

    return {
        dados: atual?.dados,
        status: !consultar ? 'vazio' : !atual ? 'carregando' : atual.erro ? 'erro' : 'disponivel',
        recarregar: () => setTentativa((anterior) => anterior + 1)
    };
}

export { useSharedContent };
