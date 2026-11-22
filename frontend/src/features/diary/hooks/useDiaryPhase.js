import { useEffect, useState } from 'react';

import { normalizarMes } from '../../calendar/utils/cycleCalendar.utils';

function obterFaseDoCalendario(calendario, data) {
    const mes = normalizarMes(calendario);
    const dia = mes?.semanas.flat().find((item) => item?.data === data);
    return dia?.tipo ?? null;
}

function useDiaryPhase({ ativo, data, service, onSessaoExpirada }) {
    const [fase, setFase] = useState(null);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        if (!ativo || !/^\d{4}-\d{2}-\d{2}$/u.test(data) || !service?.buscarMes) {
            setFase(null);
            setCarregando(false);
            return undefined;
        }

        const controle = new AbortController();
        setFase(null);
        setCarregando(true);
        service
            .buscarMes({ mes: data.slice(0, 7), signal: controle.signal })
            .then((calendario) => setFase(obterFaseDoCalendario(calendario, data)))
            .catch((erro) => {
                if (erro?.name === 'AbortError') return;
                if (erro?.status === 401) onSessaoExpirada?.();
                setFase(null);
            })
            .finally(() => {
                if (!controle.signal.aborted) setCarregando(false);
            });

        return () => controle.abort();
    }, [ativo, data, onSessaoExpirada, service]);

    return { fase, carregando };
}

export { obterFaseDoCalendario, useDiaryPhase };
