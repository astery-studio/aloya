import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { obterHojeLocal } from '../../calendar/utils/cycleCalendar.utils';

function useMenstruationSync({ fila, ativo }) {
    const [status, setStatus] = useState();
    const [erro, setErro] = useState();
    const [revisao, setRevisao] = useState(0);
    const ocupado = useRef(false);
    const sincronizar = useCallback(async () => {
        if (!ativo || !fila || ocupado.current) return;
        ocupado.current = true;
        let possuiPendentes = false;
        try {
            const pendentes = await fila.listar();
            if (!pendentes.length) {
                setStatus('sincronizado');
                return;
            }
            possuiPendentes = true;
            setErro(undefined);
            setStatus('sincronizando');
            await fila.sincronizar();
            setStatus('sincronizado');
            setRevisao((valor) => valor + 1);
        } catch (falha) {
            setStatus(possuiPendentes ? 'falha' : undefined);
            setErro(falha);
        } finally {
            ocupado.current = false;
        }
    }, [ativo, fila]);
    useEffect(() => {
        if (!ativo || !fila) return;
        void sincronizar();
        const assinatura = AppState.addEventListener('change', (estado) => {
            if (estado === 'active') void sincronizar();
        });
        // Nova tentativa enquanto o app está aberto, inclusive após a conexão voltar.
        const temporizador = setInterval(() => {
            if (AppState.currentState === 'active') void sincronizar();
        }, 15000);
        return () => {
            clearInterval(temporizador);
            assinatura?.remove?.();
        };
    }, [ativo, fila, sincronizar]);
    const registrarHoje = useCallback(async () => {
        if (!ativo || !fila) return;
        const hoje = obterHojeLocal();
        try {
            setErro(undefined);
            await fila.adicionar(hoje, hoje);
            setStatus('pendente');
            setRevisao((valor) => valor + 1);
            await sincronizar();
        } catch (falha) {
            setStatus(undefined);
            setErro(falha);
        }
    }, [ativo, fila, sincronizar]);
    return { status, erro, revisao, sincronizar, registrarHoje };
}
export { useMenstruationSync };
