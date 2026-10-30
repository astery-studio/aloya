import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { parametrosSaoIguais, validarParametrosCiclo } from '../utils/cycleParametersValidation';
import { cycleParametersReducer, estadoInicial } from './cycleParametersState';

function useCycleParameters({ service, onSessaoExpirada, onAtualizados } = {}) {
    const [estado, dispatch] = useReducer(cycleParametersReducer, estadoInicial);

    const carregar = useCallback(
        async (signal) => {
            dispatch({ tipo: 'CARREGAR' });
            try {
                const parametros = await service.buscar({ signal });
                dispatch({ tipo: 'CARREGADO', parametros });
            } catch (erro) {
                if (erro?.name === 'AbortError') return;
                if (erro?.status === 401) onSessaoExpirada?.();
                else dispatch({ tipo: 'FALHA_CARREGAMENTO' });
            }
        },
        [onSessaoExpirada, service]
    );

    useEffect(() => {
        const controlador = new AbortController();
        carregar(controlador.signal);
        return () => controlador.abort();
    }, [carregar]);

    const erros = useMemo(() => validarParametrosCiclo(estado.valores ?? {}), [estado.valores]);
    const alterado = !parametrosSaoIguais(estado.valores, estado.valoresIniciais);
    const podeSalvar = alterado && Object.keys(erros).length === 0 && !estado.salvando;

    function alterar(campo, valor) {
        dispatch({ tipo: 'ALTERAR', campo, valor });
    }

    async function salvar() {
        if (!podeSalvar) return;
        dispatch({ tipo: 'SALVAR' });
        try {
            const parametros = await service.atualizar(estado.valores);
            dispatch({ tipo: 'SALVO', parametros });
            onAtualizados?.(parametros);
        } catch (erro) {
            if (erro?.status === 401) {
                onSessaoExpirada?.();
                return;
            }
            dispatch({
                tipo: 'FALHA_SALVAMENTO',
                mensagem: erro?.mensagemUsuario || 'Não foi possível atualizar os parâmetros.'
            });
        }
    }

    return {
        ...estado,
        erros,
        alterado,
        podeSalvar,
        alterar,
        salvar,
        tentarNovamente: () => carregar(),
        fecharSucesso: () => dispatch({ tipo: 'FECHAR_SUCESSO' }),
        fecharErro: () => dispatch({ tipo: 'FECHAR_ERRO' })
    };
}

export { useCycleParameters };
