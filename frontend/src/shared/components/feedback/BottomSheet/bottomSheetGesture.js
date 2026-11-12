const DISTANCIA_MINIMA_ARRASTE = 5;
const DISTANCIA_FECHAMENTO = 64;
const VELOCIDADE_FECHAMENTO = 0.5;

function deveIniciarArraste({ dx = 0, dy = 0 } = {}, bloqueado = false) {
    return !bloqueado && dy > DISTANCIA_MINIMA_ARRASTE && Math.abs(dy) > Math.abs(dx);
}

function deveFecharPorArraste({ dy = 0, vy = 0 } = {}) {
    return dy >= DISTANCIA_FECHAMENTO || vy >= VELOCIDADE_FECHAMENTO;
}

export { deveFecharPorArraste, deveIniciarArraste };
