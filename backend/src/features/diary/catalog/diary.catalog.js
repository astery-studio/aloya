import { cicloESangramento } from './macro.cycle.js';
import { corpoESintomas } from './macro.physical.js';
import { emocional } from './macro.emotional.js';
import { energiaESono } from './macro.energy.js';
import { vidaIntimaESocial } from './macro.intimate.js';
import { saudeEAcompanhamento } from './macro.health.js';
import { normalizarMacrocategoria } from './catalog.builder.js';

const CATALOGO_DIARIO = [
    cicloESangramento,
    corpoESintomas,
    emocional,
    energiaESono,
    vidaIntimaESocial,
    saudeEAcompanhamento
].map(normalizarMacrocategoria);

export { CATALOGO_DIARIO };
