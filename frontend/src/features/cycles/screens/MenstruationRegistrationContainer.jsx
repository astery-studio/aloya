import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { obterHojeLocal } from '../../calendar/utils/cycleCalendar.utils';
import { selecionarIntervalo } from '../utils/menstruationSelection';
import { MenstruationRegistrationScreen } from './MenstruationRegistrationScreen';

function MenstruationRegistrationContainer({
    calendarService,
    fila,
    onVoltar,
    onSessaoExpirada,
    dataInicial
}) {
    const hoje = obterHojeLocal();
    const [meses, setMeses] = useState([]);
    const [selecao, setSelecao] = useState(() =>
        dataInicial ? selecionarIntervalo([], dataInicial, hoje) : []
    );
    const [salvando, setSalvando] = useState(false);
    const [status, setStatus] = useState();
    const [erro, setErro] = useState();
    const [sucesso, setSucesso] = useState(false);
    useEffect(() => {
        let ativo = true;
        const controle = new AbortController();
        const data = new Date(`${hoje.slice(0, 7)}-01T00:00:00Z`);
        const chaves = Array.from({ length: 12 }, (_, indice) => {
            const mes = new Date(data);
            mes.setUTCMonth(mes.getUTCMonth() - 11 + indice);
            return mes.toISOString().slice(0, 7);
        });
        Promise.all(
            chaves.map(async (mes) => {
                try {
                    return await calendarService.buscarMes({ mes, signal: controle.signal });
                } catch (falha) {
                    if (falha.status === 401) throw falha;
                    return { mes, diasMenstruacao: [], previsao: null };
                }
            })
        )
            .then((dados) => {
                if (ativo) setMeses(dados);
            })
            .catch((falha) => {
                if (ativo) {
                    setErro(falha);
                    onSessaoExpirada?.();
                }
            });
        return () => {
            ativo = false;
            controle.abort();
        };
    }, [calendarService, hoje, onSessaoExpirada]);

    async function sincronizar() {
        setStatus('sincronizando');
        setErro(undefined);
        try {
