// O identificador apenas separa filas locais. A autorização continua sendo feita pela API.
function obterIdentidadeMenstrual(sessao) {
    try {
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const trecho = sessao.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        let bits = 0;
        let acumulado = 0;
        let texto = '';
        for (const caractere of trecho.replace(/=+$/, '')) {
            const valor = alfabeto.indexOf(caractere);
            if (valor < 0) return null;
            acumulado = (acumulado << 6) | valor;
            bits += 6;
            if (bits >= 8) {
                bits -= 8;
                texto += String.fromCharCode((acumulado >> bits) & 255);
            }
        }
        const id = JSON.parse(texto).sub;
        return /^[1-9]\d*$/.test(String(id)) ? String(id) : null;
    } catch {
        return null;
    }
}
export { obterIdentidadeMenstrual };
