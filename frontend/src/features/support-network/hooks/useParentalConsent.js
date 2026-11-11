import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { MENSAGEM_ERRO_ENVIO } from '../services/parentalConsentService';

const MENSAGEM_ERRO_STATUS =
    'Não foi possível verificar a autorização da Rede de Apoio. Tente novamente.';

const INTERVALO_ATUALIZACAO_CONSENTIMENTO_MS = 2000;

const CODIGOS_SESSAO_INVALIDA = new Set([
    'NAO_AUTENTICADO',
    'TOKEN_INVALIDO',
    'SESSAO_INVALIDA',
    'SESSAO_AUSENTE'
]);

function erroEhSessaoInvalida(erro) {
    return erro?.status === 401 || CODIGOS_SESSAO_INVALIDA.has(erro?.codigo);
}

function criarStatusPendente(statusAtual, emailResponsavelLegal) {
    return Object.freeze({
        ...(statusAtual ?? {}),
        acessoLiberado: false,
        motivo: 'CONSENTIMENTO_NECESSARIO',
        consentimentoNecessario: true,
        emailResponsavelInformado: true,
        emailResponsavelLegal,
        statusConsentimento: 'pendente',
        menorDe16: true
    });
}

function useParentalConsent({ service, onSessaoExpirada } = {}) {
    const [status, setStatus] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState(null);
    const [erroEnvio, setErroEnvio] = useState(null);
    const [resultadoEnvio, setResultadoEnvio] = useState(null);

    const montadoRef = useRef(false);
    const statusRef = useRef(null);
    const requisicaoRef = useRef(null);
    const envioRef = useRef(null);
    const controladorRef = useRef(null);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    const carregar = useCallback(
        ({ silencioso = false } = {}) => {
            if (requisicaoRef.current) return requisicaoRef.current;

            if (typeof service?.consultarStatus !== 'function') {
                setCarregando(false);
                setAtualizando(false);
                setErro(MENSAGEM_ERRO_STATUS);
                return Promise.resolve(false);
            }

            const controlador = new AbortController();
            controladorRef.current = controlador;
            if (!silencioso) setErro(null);

            if (!silencioso) {
                if (statusRef.current) setAtualizando(true);
                else setCarregando(true);
            }

            const requisicao = Promise.resolve()
                .then(() => service.consultarStatus({ signal: controlador.signal }))
                .then((statusRecebido) => {
                    if (!montadoRef.current || controlador.signal.aborted) return false;
                    statusRef.current = statusRecebido;
                    setStatus(statusRecebido);
                    setErro(null);
                    return true;
                })
                .catch((falha) => {
                    if (
                        !montadoRef.current ||
                        controlador.signal.aborted ||
                        falha?.name === 'AbortError'
                    ) {
                        return false;
                    }

                    if (erroEhSessaoInvalida(falha)) {
                        onSessaoExpirada?.({ mensagem: 'Sua sessão expirou. Entre novamente.' });
                    } else if (!silencioso) {
                        setErro(MENSAGEM_ERRO_STATUS);
                    }

                    return false;
                })
                .finally(() => {
                    if (requisicaoRef.current === requisicao) requisicaoRef.current = null;
                    if (controladorRef.current === controlador) controladorRef.current = null;

                    if (montadoRef.current) {
                        setCarregando(false);
                        setAtualizando(false);
                    }
                });

            requisicaoRef.current = requisicao;
            return requisicao;
        },
        [onSessaoExpirada, service]
    );

    useEffect(() => {
        montadoRef.current = true;
        carregar();

        let intervalo = null;

        const pararAtualizacaoAutomatica = () => {
            if (intervalo !== null) {
                clearInterval(intervalo);
                intervalo = null;
            }
        };

        const atualizarEnquantoPendente = () => {
            if (statusRef.current?.acessoLiberado) {
                pararAtualizacaoAutomatica();
                return;
            }

            carregar({ silencioso: true });
        };

        const iniciarAtualizacaoAutomatica = () => {
            if (intervalo === null && !statusRef.current?.acessoLiberado) {
                intervalo = setInterval(
                    atualizarEnquantoPendente,
                    INTERVALO_ATUALIZACAO_CONSENTIMENTO_MS
                );
            }
        };

        if (!['background', 'inactive'].includes(AppState.currentState)) {
            iniciarAtualizacaoAutomatica();
        }

        const assinatura = AppState.addEventListener('change', (proximoEstado) => {
            if (proximoEstado === 'active') {
                atualizarEnquantoPendente();
                iniciarAtualizacaoAutomatica();
            } else {
                pararAtualizacaoAutomatica();
            }
        });

        return () => {
            montadoRef.current = false;
            pararAtualizacaoAutomatica();
            controladorRef.current?.abort();
            assinatura?.remove?.();
            requisicaoRef.current = null;
            envioRef.current = null;
        };
    }, [carregar]);

    const enviar = useCallback(
        (tipo, emailResponsavelLegal = null) => {
            if (envioRef.current) return envioRef.current;

            const operacao = tipo === 'reenviar' ? service?.reenviar : service?.solicitar;

            if (typeof operacao !== 'function') {
                setErroEnvio(MENSAGEM_ERRO_ENVIO);
                return Promise.resolve(false);
            }

            setEnviando(true);
            setErroEnvio(null);
            setResultadoEnvio(null);

            const email = emailResponsavelLegal ?? statusRef.current?.emailResponsavelLegal ?? null;

            const requisicao = Promise.resolve()
                .then(() => operacao.call(service, emailResponsavelLegal))
                .then((resultado) => {
                    if (!montadoRef.current) return false;

                    const novoStatus = criarStatusPendente(statusRef.current, email);
                    statusRef.current = novoStatus;
                    setStatus(novoStatus);
                    setResultadoEnvio(resultado);
                    return true;
                })
                .catch((falha) => {
                    if (!montadoRef.current) return false;

                    if (erroEhSessaoInvalida(falha)) {
                        onSessaoExpirada?.({ mensagem: 'Sua sessão expirou. Entre novamente.' });
                    } else {
                        setErroEnvio(falha?.mensagemUsuario || MENSAGEM_ERRO_ENVIO);
                    }

                    return false;
                })
                .finally(() => {
                    if (envioRef.current === requisicao) envioRef.current = null;
                    if (montadoRef.current) setEnviando(false);
                });

            envioRef.current = requisicao;
            return requisicao;
        },
        [onSessaoExpirada, service]
    );

    const limparFeedback = useCallback(() => {
        setErroEnvio(null);
        setResultadoEnvio(null);
    }, []);

    return {
        status,
        carregando,
        atualizando,
        enviando,
        erro,
        erroEnvio,
        resultadoEnvio,
        atualizarStatus: carregar,
        solicitar: (email) => enviar('solicitar', email),
        reenviar: (email = null) => enviar('reenviar', email),
        limparFeedback
    };
}

export {
    INTERVALO_ATUALIZACAO_CONSENTIMENTO_MS,
    MENSAGEM_ERRO_STATUS,
    criarStatusPendente,
    erroEhSessaoInvalida,
    useParentalConsent
};
