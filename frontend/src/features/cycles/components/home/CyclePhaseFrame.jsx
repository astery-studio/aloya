import Svg, { Path } from 'react-native-svg';

const TAMANHO_MOLDURA = 260;
const CENTRO_MOLDURA = TAMANHO_MOLDURA / 2;
const RAIO_MOLDURA = 113;
const COR_SEGMENTO_INATIVO = '#D8D4CC';
const ANGULO_GAP_MAXIMO = 2.5;

const CORES_DAS_FASES = Object.freeze({
    menstrual: '#C85A44',
    folicular: '#2C4C3B',
    ovulatoria: '#4A758E',
    lutea: '#D68C3A'
});

function limitarNumero(valor, minimo, maximo) {
    return Math.min(Math.max(valor, minimo), maximo);
}

function normalizarInteiroPositivo(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) && numero > 0 ? Math.trunc(numero) : 0;
}

function pontoNoCirculo(anguloEmGraus) {
    const anguloEmRadianos = ((anguloEmGraus - 90) * Math.PI) / 180;
    return {
        x: CENTRO_MOLDURA + RAIO_MOLDURA * Math.cos(anguloEmRadianos),
        y: CENTRO_MOLDURA + RAIO_MOLDURA * Math.sin(anguloEmRadianos)
    };
}

function descreverArco(anguloInicial, anguloFinal) {
    const inicio = pontoNoCirculo(anguloInicial);
    const fim = pontoNoCirculo(anguloFinal);
    return `M${inicio.x.toFixed(3)} ${inicio.y.toFixed(3)} A${RAIO_MOLDURA} ${RAIO_MOLDURA} 0 0 1 ${fim.x.toFixed(3)} ${fim.y.toFixed(3)}`;
}

function criarSegmentosDaMoldura({ fase, duracaoCiclo, diaCiclo }) {
    const quantidadeDeSegmentos = normalizarInteiroPositivo(duracaoCiclo);
    const corAtiva = CORES_DAS_FASES[fase];

    if (!quantidadeDeSegmentos || !corAtiva) return [];

    const segmentosAtivos = limitarNumero(
        normalizarInteiroPositivo(diaCiclo),
        0,
        quantidadeDeSegmentos
    );
    const passoAngular = 360 / quantidadeDeSegmentos;
    const anguloDoGap = Math.min(ANGULO_GAP_MAXIMO, passoAngular * 0.25);

    return Array.from({ length: quantidadeDeSegmentos }, (_, indice) => ({
        d: descreverArco(
            indice * passoAngular + anguloDoGap / 2,
            (indice + 1) * passoAngular - anguloDoGap / 2
        ),
        cor: indice < segmentosAtivos ? corAtiva : COR_SEGMENTO_INATIVO
    }));
}

function CyclePhaseFrame({ fase, duracaoCiclo, diaCiclo }) {
    const segmentos = criarSegmentosDaMoldura({ fase, duracaoCiclo, diaCiclo });

    if (!segmentos.length) return null;

    return (
        <Svg
            pointerEvents="none"
            testID="cycle-phase-frame"
            width={TAMANHO_MOLDURA}
            height={TAMANHO_MOLDURA}
            viewBox="0 0 260 260"
            fill="none"
        >
            {segmentos.map((segmento, indice) => (
                <Path
                    key={indice}
                    testID="cycle-phase-frame-segment"
                    d={segmento.d}
                    stroke={segmento.cor}
                    strokeWidth={2}
                    strokeLinecap="round"
                />
            ))}
        </Svg>
    );
}

export {
    CORES_DAS_FASES,
    COR_SEGMENTO_INATIVO,
    criarSegmentosDaMoldura,
    CyclePhaseFrame,
    TAMANHO_MOLDURA
};
