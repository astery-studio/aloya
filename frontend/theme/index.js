import { cores } from './colors'
import { espacamentos, espacamentosLayout } from './spacing'
import { fontFamilies, typography } from '../src/shared/theme/typography'
import { radius } from '../src/shared/theme/radius'
import { shadows } from '../src/shared/theme/shadows'

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