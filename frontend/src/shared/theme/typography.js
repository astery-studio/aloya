/**
 * Define famílias e estilos tipográficos baseados na fonte DM Sans.
 */
const fontFamilies = {
    regular: 'DMSans_400Regular',
    medium: 'DMSans_500Medium',
    semibold: 'DMSans_600SemiBold',
    bold: 'DMSans_700Bold'
};

const typography = {
    h1: {
        fontFamily: fontFamilies.bold,
        fontSize: 28,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 33.6
    },

    h2: {
        fontFamily: fontFamilies.bold,
        fontSize: 22,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 28.6
    },

    bodyLarge: {
        fontFamily: fontFamilies.medium,
        fontSize: 18,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 27
    },

    bodyDefault: {
        fontFamily: fontFamilies.regular,
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 24
    },

    caption: {
        fontFamily: fontFamilies.medium,
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: 19.6
    },

    micro: {
        fontFamily: fontFamilies.bold,
        fontSize: 12,
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: 15.6,
        letterSpacing: 0.24
    },

    labelCompact: {
        fontFamily: fontFamilies.medium,
        fontSize: 11,
        lineHeight: 16
    },

    numberCompact: {
        fontFamily: fontFamilies.medium,
        fontSize: 17,
        lineHeight: 26
    },

    numberCompactStrong: {
        fontFamily: fontFamilies.bold,
        fontSize: 17,
        lineHeight: 26
    }
};

export {
    fontFamilies,
    typography
};
