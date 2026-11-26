import { useEffect, useState } from 'react';

function useDiaryRecordForDate({ date, service, onSessionExpired } = {}) {
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!date || typeof service?.listarHistorico !== 'function') {
            setRecord(null);
            setLoading(false);
            return undefined;
        }
        const controller = new AbortController();
        setLoading(true);
        service
            .listarHistorico({
                limite: 1,
                filtros: { dataInicio: date, dataFim: date },
                signal: controller.signal
            })
            .then(async ({ itens }) => {
                const summary = itens.find((item) => item.data === date);
                if (!summary || typeof service?.buscarDetalhe !== 'function') return null;
                return service.buscarDetalhe(summary.id, { signal: controller.signal });
            })
            .then((detail) => {
                if (!controller.signal.aborted) setRecord(detail);
            })
            .catch((error) => {
                if (controller.signal.aborted || error?.name === 'AbortError') return;
                if (error?.status === 401) onSessionExpired?.();
                setRecord(null);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [date, onSessionExpired, service]);

    return { record, loading };
}

export { useDiaryRecordForDate };
