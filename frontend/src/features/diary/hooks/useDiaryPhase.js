import { useEffect, useState } from 'react';

import { normalizarMes } from '../../calendar/utils/cycleCalendar.utils';

function intervaloContem(intervalo, data) {
    return Boolean(
        intervalo &&
        typeof intervalo.inicio === 'string' &&
        typeof intervalo.fim === 'string' &&
        data >= intervalo.inicio &&
        data <= intervalo.fim
    );
}

function obterFaseDaPrevisao(previsao, data) {
    const periodos = Array.isArray(previsao?.periodos) ? previsao.periodos : [previsao];

    for (const periodo of periodos) {
        if (!periodo || typeof periodo !== 'object') continue;
        if (
            intervaloContem(periodo.faseMenstrual, data) ||
            intervaloContem(periodo.menstruacaoPrevista, data)
        ) {
            return 'menstruacao';
        }
        if (intervaloContem(periodo.faseFolicular, data)) return 'folicular';
        if (periodo.ovulacao === data) return 'ovulacao';
        if (intervaloContem(periodo.faseLutea, data)) return 'lutea';
    }

    return null;
}

function obterFaseDoCalendario(calendario, data) {
    const mes = normalizarMes(calendario);
    const dia = mes?.semanas.flat().find((item) => item?.data === data);
    const previsao = calendario?.calendario?.previsao ?? calendario?.previsao;
    return dia?.tipo ?? obterFaseDaPrevisao(previsao, data);
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
