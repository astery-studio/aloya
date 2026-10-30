import { obterIdentidadeMenstrual } from './menstruationIdentity';

function criarCycleRegistrationService({ requisicaoAutenticada }) {
    return Object.freeze({
        registrar({ inicio, fim, chave, signal, identidade }) {
            return requisicaoAutenticada({
                caminho: '/api/cycles/registrations',
                metodo: 'POST',
                corpo: inicio === fim ? { data: inicio } : { dataInicio: inicio, dataFim: fim },
                chaveIdempotencia: chave,
                ...(identidade
                    ? {
                          validarCredencial: (sessao) =>
                              obterIdentidadeMenstrual(sessao) === identidade
                      }
                    : {}),
                signal
            });
        }
    });
}
export { criarCycleRegistrationService };
