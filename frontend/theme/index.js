import { cores } from './colors'
import { espacamentos, espacamentosLayout } from './spacing'
import { fontFamilies, typography } from './typography'
import { radius } from './radius'
import { shadows } from './shadows'

const tema = Object.freeze({
    cores,
    espacamentos,
    espacamentosLayout,
    typography,
    radius,
    shadows
});

export {
    cores,
    espacamentos,
    espacamentosLayout,
    fontFamilies,
    typography,
    radius,
    shadows,
    tema
};
/**
 * Expõe os tokens visuais por um ponto único de importação.
 */
