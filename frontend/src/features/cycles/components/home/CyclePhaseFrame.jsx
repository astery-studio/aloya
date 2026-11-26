import Svg, { Path } from 'react-native-svg';

const TAMANHO_MOLDURA = 260;
const COR_SEGMENTO_INATIVO = '#D8D4CC';

const CONFIGURACAO_DA_MOLDURA = Object.freeze({
    menstrual: Object.freeze({ cor: '#C85A44', segmentosAtivos: 5 }),
    folicular: Object.freeze({ cor: '#2C4C3B', segmentosAtivos: 8 }),
    ovulatoria: Object.freeze({ cor: '#4A758E', segmentosAtivos: 12 }),
    lutea: Object.freeze({ cor: '#D68C3A', segmentosAtivos: 16 })
});

const SEGMENTOS = Object.freeze([
    'M132.458 17.3607C142.067 17.5705 151.609 19.0088 160.852 21.6406',
    'M165.549 23.0895C174.67 26.1217 183.364 30.3085 191.422 35.5478',
    'M195.482 38.3168C203.303 43.9029 210.377 50.4668 216.532 57.8485',
    'M219.597 61.6923C225.424 69.3351 230.249 77.6922 233.955 86.5598',
    'M235.752 91.1357C239.067 100.157 241.214 109.566 242.141 119.132',
    'M242.509 124.033C243.018 133.631 242.297 143.254 240.363 152.669',
    'M239.269 157.46C236.927 166.782 233.401 175.765 228.778 184.191',
    'M226.32 188.448C221.334 196.665 215.317 204.21 208.416 210.899',
    'M204.814 214.243C197.627 220.625 189.654 226.061 181.087 230.419',
    'M176.658 232.551C167.91 236.531 158.689 239.376 149.218 241.016',
    'M144.358 241.748C134.825 242.973 125.175 242.973 115.642 241.748',
    'M110.782 241.016C101.311 239.376 92.0898 236.531 83.3416 232.551',
    'M78.9128 230.419C70.3464 226.061 62.3729 220.625 55.1864 214.243',
    'M51.5839 210.899C44.6828 204.21 38.666 196.665 33.6801 188.448',
    'M31.2217 184.191C26.5989 175.765 23.0732 166.782 20.7307 157.46',
    'M19.6372 152.669C17.7032 143.254 16.9819 133.631 17.4908 124.033',
    'M17.8591 119.132C18.7859 109.566 20.9329 100.157 24.2479 91.1357',
    'M26.0448 86.5598C29.7505 77.6922 34.5756 69.3351 40.4026 61.6923',
    'M43.4677 57.8485C49.6225 50.4668 56.6965 43.9029 64.5175 38.3168',
    'M68.5779 35.5478C76.6355 30.3085 85.3304 26.1217 94.4508 23.0895',
    'M99.1481 21.6406C108.391 19.0088 117.933 17.5705 127.542 17.3607'
]);

function obterCorDoSegmento(fase, indice) {
    const configuracao = CONFIGURACAO_DA_MOLDURA[fase];

    if (!configuracao || indice >= configuracao.segmentosAtivos) {
        return COR_SEGMENTO_INATIVO;
    }

    return configuracao.cor;
}

function CyclePhaseFrame({ fase }) {
    const configuracao = CONFIGURACAO_DA_MOLDURA[fase];

    if (!configuracao) return null;

    return (
        <Svg
            pointerEvents="none"
            testID="cycle-phase-frame"
            width={TAMANHO_MOLDURA}
            height={TAMANHO_MOLDURA}
            viewBox="0 0 260 260"
            fill="none"
        >
            {SEGMENTOS.map((segmento, indice) => (
                <Path
                    key={segmento}
                    testID="cycle-phase-frame-segment"
                    d={segmento}
                    stroke={obterCorDoSegmento(fase, indice)}
                    strokeWidth={2}
                    strokeLinecap="round"
                />
            ))}
        </Svg>
    );
}

export {
    CONFIGURACAO_DA_MOLDURA,
    COR_SEGMENTO_INATIVO,
    CyclePhaseFrame,
    obterCorDoSegmento,
    SEGMENTOS,
    TAMANHO_MOLDURA
};
