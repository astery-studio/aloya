import { detectarA3 } from './thermal.a3.js';
import { detectarA4R } from './thermal.a4r.js';
import {
    CONFIGURACOES_TERMICAS_CAUSAIS,
    CONFIGURACOES_TERMICAS_RETROSPECTIVAS
} from './thermal.config.js';
import { detectarPadraoTermico } from './thermal.engine.js';

function executarMatrizTermica(medicoes, contexto = {}) {
    if (contexto.execucaoHabilitada === false) return [];
    const resultados = CONFIGURACOES_TERMICAS_CAUSAIS.filter(
        ({ execucaoHabilitada }) => execucaoHabilitada
    ).map((config) => ({ config, resultado: detectarPadraoTermico(medicoes, config) }));
    if (!contexto.cicloConcluido) return resultados;

    for (const config of CONFIGURACOES_TERMICAS_RETROSPECTIVAS) {
        const resultado =
            config.variante === 'A3'
                ? detectarA3(medicoes, config, contexto)
                : detectarA4R(medicoes, config, contexto);
        resultados.push({ config, resultado });
    }
    return resultados;
}

export { executarMatrizTermica };
