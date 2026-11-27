import { useEffect, useState } from 'react';

function useSharedContent(consultar) {
    const [resultado, setResultado] = useState(null);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if (!consultar) return undefined;
        const controle = new AbortController();

        async function carregar() {
            try {
                const dados = await consultar({ signal: controle.signal });
                if (!controle.signal.aborted) setResultado({ consultar, tentativa, dados });
            } catch (erro) {
                if (!controle.signal.aborted && erro?.name !== 'AbortError') {
                    setResultado({ consultar, tentativa, erro: true });
                }
            }
        }

        void carregar();
        return () => controle.abort();
    }, [consultar, tentativa]);

    const atual =
        resultado?.consultar === consultar && resultado?.tentativa === tentativa ? resultado : null;

    return {
        dados: atual?.dados,
        status: !consultar ? 'vazio' : !atual ? 'carregando' : atual.erro ? 'erro' : 'disponivel',
        recarregar: () => setTentativa((anterior) => anterior + 1)
    };
}

export { useSharedContent };
