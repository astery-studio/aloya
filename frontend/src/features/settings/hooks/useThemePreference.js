import { useCallback, useEffect, useRef, useState } from 'react';

import { PREFERENCIAS_TEMA, preferenciaTemaEhValida } from '../../../shared/theme/themePreferences';
import { MENSAGEM_ERRO_TEMA } from '../services/themePreferenceService';

const MENSAGEM_ERRO_CARREGAR_TEMA =
    'Não foi possível carregar sua preferência de tema. Tente novamente.';

const MENSAGEM_CONFIGURACAO_TEMA = 'Não foi possível configurar a preferência de tema.';

function serviceEhValido(service) {
    return (
        typeof service?.buscarPreferencia === 'function' &&
        typeof service?.atualizarPreferencia === 'function'
    );
}

function erroFoiCancelamento(erro) {
    return erro?.name === 'AbortError' || erro?.codigo === 'REQUISICAO_CANCELADA';
}

function obterPreferenciaInicial(preferencia) {
    return preferenciaTemaEhValida(preferencia) ? preferencia : PREFERENCIAS_TEMA.automatico;
}

function useThemePreference({
    service,
    autenticado = false,
    preferenciaInicial = PREFERENCIAS_TEMA.automatico
} = {}) {
    const preferenciaInicialSegura = obterPreferenciaInicial(preferenciaInicial);

    const [preferencia, definirPreferencia] = useState(preferenciaInicialSegura);

    const [carregando, definirCarregando] = useState(Boolean(autenticado));

    const [salvando, definirSalvando] = useState(false);

    const [erro, definirErro] = useState(null);

    const montadoRef = useRef(true);
    const autenticadoRef = useRef(autenticado);
    const preferenciaRef = useRef(preferenciaInicialSegura);
    const alteracaoEmAndamentoRef = useRef(false);
    const identificadorBuscaRef = useRef(0);
    const identificadorAlteracaoRef = useRef(0);
    const controladorBuscaRef = useRef(null);

    const atualizarPreferenciaLocal = useCallback((novaPreferencia) => {
        preferenciaRef.current = novaPreferencia;
        definirPreferencia(novaPreferencia);
    }, []);

    useEffect(() => {
        autenticadoRef.current = autenticado;
    }, [autenticado]);

    useEffect(() => {
        montadoRef.current = true;

        return () => {
            montadoRef.current = false;
            identificadorBuscaRef.current += 1;
            identificadorAlteracaoRef.current += 1;
            alteracaoEmAndamentoRef.current = false;
            controladorBuscaRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        if (autenticado || !preferenciaTemaEhValida(preferenciaInicial)) {
            return;
        }

        atualizarPreferenciaLocal(preferenciaInicial);
    }, [autenticado, preferenciaInicial, atualizarPreferenciaLocal]);

    useEffect(() => {
        const identificadorBusca = identificadorBuscaRef.current + 1;

        identificadorBuscaRef.current = identificadorBusca;

        controladorBuscaRef.current?.abort();
        controladorBuscaRef.current = null;

        if (!autenticado) {
            identificadorAlteracaoRef.current += 1;
            alteracaoEmAndamentoRef.current = false;

            atualizarPreferenciaLocal(obterPreferenciaInicial(preferenciaInicial));

            definirCarregando(false);
            definirSalvando(false);
            definirErro(null);

            return undefined;
        }

        if (!serviceEhValido(service)) {
            definirCarregando(false);
            definirSalvando(false);
            definirErro(MENSAGEM_CONFIGURACAO_TEMA);

            return undefined;
        }

        const controlador = new AbortController();

        controladorBuscaRef.current = controlador;
        definirCarregando(true);
        definirErro(null);

        Promise.resolve()
            .then(() =>
                service.buscarPreferencia({
                    signal: controlador.signal
                })
            )
            .then((preferenciaRecebida) => {
                if (
                    !montadoRef.current ||
                    controlador.signal.aborted ||
                    identificadorBusca !== identificadorBuscaRef.current
                ) {
                    return;
                }

                atualizarPreferenciaLocal(preferenciaRecebida);
            })
            .catch((erroRecebido) => {
                if (
                    !montadoRef.current ||
                    controlador.signal.aborted ||
                    erroFoiCancelamento(erroRecebido) ||
                    identificadorBusca !== identificadorBuscaRef.current
                ) {
                    return;
                }

                definirErro(erroRecebido?.mensagemUsuario || MENSAGEM_ERRO_CARREGAR_TEMA);
            })
            .finally(() => {
                if (!montadoRef.current || identificadorBusca !== identificadorBuscaRef.current) {
                    return;
                }

                definirCarregando(false);
            });

        return () => {
            controlador.abort();

            if (controladorBuscaRef.current === controlador) {
                controladorBuscaRef.current = null;
            }
        };
    }, [autenticado, preferenciaInicial, service, atualizarPreferenciaLocal]);

    const alterarPreferencia = useCallback(
        async (novaPreferencia) => {
            if (
                !autenticadoRef.current ||
                !serviceEhValido(service) ||
                !preferenciaTemaEhValida(novaPreferencia)
            ) {
                if (montadoRef.current) {
                    definirErro(MENSAGEM_CONFIGURACAO_TEMA);
                }

                return false;
            }

            if (alteracaoEmAndamentoRef.current) {
                return false;
            }

            const preferenciaAnterior = preferenciaRef.current;

            if (preferenciaAnterior === novaPreferencia) {
                definirErro(null);

                return true;
            }

            const identificadorAlteracao = identificadorAlteracaoRef.current + 1;

            identificadorAlteracaoRef.current = identificadorAlteracao;

            alteracaoEmAndamentoRef.current = true;
            atualizarPreferenciaLocal(novaPreferencia);
            definirSalvando(true);
            definirErro(null);

            try {
                const preferenciaPersistida = await service.atualizarPreferencia(novaPreferencia);

                if (
                    !montadoRef.current ||
                    identificadorAlteracao !== identificadorAlteracaoRef.current ||
                    !autenticadoRef.current
                ) {
                    return false;
                }

                atualizarPreferenciaLocal(preferenciaPersistida);

                return true;
            } catch (erroRecebido) {
                if (
                    montadoRef.current &&
                    identificadorAlteracao === identificadorAlteracaoRef.current &&
                    autenticadoRef.current
                ) {
                    atualizarPreferenciaLocal(preferenciaAnterior);

                    definirErro(erroRecebido?.mensagemUsuario || MENSAGEM_ERRO_TEMA);
                }

                return false;
            } finally {
                if (identificadorAlteracao === identificadorAlteracaoRef.current) {
                    alteracaoEmAndamentoRef.current = false;

                    if (montadoRef.current) {
                        definirSalvando(false);
                    }
                }
            }
        },
        [service, atualizarPreferenciaLocal]
    );

    const limparErro = useCallback(() => {
        definirErro(null);
    }, []);

    return {
        preferencia,
        carregando,
        salvando,
        erro,
        alterarPreferencia,
        limparErro
    };
}

export { MENSAGEM_CONFIGURACAO_TEMA, MENSAGEM_ERRO_CARREGAR_TEMA, useThemePreference };

export default useThemePreference;
