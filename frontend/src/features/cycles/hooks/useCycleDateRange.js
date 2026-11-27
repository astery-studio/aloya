import { useMemo, useState } from 'react';
import { criarDiasDaFaixa } from '../utils/cyclePresentation';

const DIAS_POR_PAGINA = 14;
const FAIXA_INICIAL = { deslocamentoInicial: -3, quantidade: 16 };

function useCycleDateRange({ dataBase, fases, duracaoCiclo, faseAtual }) {
    const [faixa, setFaixa] = useState(null);
    const { deslocamentoInicial, quantidade } =
        faixa && faixa.dataBase === dataBase ? faixa : FAIXA_INICIAL;
    const dias = useMemo(() => {
        if (!dataBase) return [];
        const faixaAtual = criarDiasDaFaixa(
            dataBase,
            fases,
            deslocamentoInicial,
            quantidade,
            duracaoCiclo
        );
        return faseAtual
            ? faixaAtual.map((dia) => (dia.hoje ? { ...dia, fase: faseAtual } : dia))
            : faixaAtual;
    }, [dataBase, fases, deslocamentoInicial, quantidade, duracaoCiclo, faseAtual]);

    function carregarDias(direcao) {
        setFaixa((atual) => {
            const base = atual && atual.dataBase === dataBase ? atual : FAIXA_INICIAL;
            return {
                dataBase,
                deslocamentoInicial:
                    direcao === 'anteriores'
                        ? base.deslocamentoInicial - DIAS_POR_PAGINA
                        : base.deslocamentoInicial,
                quantidade: base.quantidade + DIAS_POR_PAGINA
            };
        });
    }

    return { dias, carregarDias };
}

export { useCycleDateRange };
