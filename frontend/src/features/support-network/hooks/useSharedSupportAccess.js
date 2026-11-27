import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { criarConsultasCompartilhadas } from '../services/sharedSupportService';

const INTERVALO_ACESSO_MS = 5000;
const ACESSO_VAZIO = Object.freeze({ status: 'vazio' });

function chavePermissoes(permissoes) {
    return [...permissoes].sort().join(',');
}

function useSharedSupportAccess({ service, vinculoId, onSessaoExpirada }) {
    const [acesso, setAcesso] = useState({ status: 'carregando' });
    const versao = useRef(0);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        if (vinculoId == null) return undefined;

        let controle;
        let ativo = true;

        async function verificar() {
            if (!ativo || controle) return;
            const consulta = new AbortController();
            controle = consulta;
            const versaoConsulta = versao.current;
            try {
                const { dados, permissoes } = await service.consultar(vinculoId, '', {
                    signal: consulta.signal
                });
                if (!ativo || versaoConsulta !== versao.current) return;
                const assinatura = chavePermissoes(permissoes);
                setAcesso((atual) =>
                    atual.assinatura === assinatura && atual.nomeTitular === dados.nomeTitular
                        ? atual
                        : {
                              status: 'disponivel',
                              assinatura,
                              nomeTitular: dados.nomeTitular,
                              permissoes
                          }
                );
            } catch (erro) {
                if (!ativo || versaoConsulta !== versao.current) return;
                if (erro?.status === 401) onSessaoExpirada?.();
                setAcesso({ status: erro?.status === 403 ? 'vazio' : 'erro' });
            } finally {
                controle = null;
            }
        }

        void verificar();
        const intervalo = setInterval(() => {
            if (!AppState.currentState || AppState.currentState === 'active') void verificar();
        }, INTERVALO_ACESSO_MS);
        const assinatura = AppState.addEventListener('change', (estado) => {
            if (estado === 'active') void verificar();
        });

        return () => {
            ativo = false;
            clearInterval(intervalo);
            assinatura.remove();
            controle?.abort();
        };
    }, [onSessaoExpirada, service, tentativa, vinculoId]);

    const bloquearDados = useCallback(() => {
        versao.current += 1;
        setAcesso({ status: 'vazio' });
        setTentativa((anterior) => anterior + 1);
    }, []);

    const assinaturaAtual = acesso.assinatura;
    const consultar = useCallback(
        async (recurso, opcoes) => {
            const versaoConsulta = versao.current;
            try {
                const { dados, permissoes } = await service.consultar(vinculoId, recurso, opcoes);
                if (versaoConsulta !== versao.current || opcoes.signal?.aborted) {
                    throw Object.assign(new Error('Consulta substituída.'), { name: 'AbortError' });
                }
                if (chavePermissoes(permissoes) !== assinaturaAtual) {
                    bloquearDados();
                    throw Object.assign(new Error('Permissões atualizadas.'), {
                        name: 'AbortError'
                    });
                }
                return dados;
            } catch (erro) {
                if (versaoConsulta === versao.current && !opcoes.signal?.aborted) {
                    if (erro?.status === 403) bloquearDados();
                    if (erro?.status === 401) onSessaoExpirada?.();
                }
                throw erro;
            }
        },
        [assinaturaAtual, bloquearDados, onSessaoExpirada, service, vinculoId]
    );

    const consultas = useMemo(() => criarConsultasCompartilhadas(consultar), [consultar]);

    return {
        acesso: vinculoId == null ? ACESSO_VAZIO : acesso,
        consultas,
        recarregar: () => setTentativa((anterior) => anterior + 1)
    };
}

export { useSharedSupportAccess };
