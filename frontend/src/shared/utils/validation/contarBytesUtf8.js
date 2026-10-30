// Conta o tamanho da senha com a mesma codificação usada pelo backend.
export function contarBytesUtf8(texto) {
    let total = 0;
    for (const caractere of texto) {
        const codigo = caractere.codePointAt(0);
        if (codigo <= 0x7f) total += 1;
        else if (codigo <= 0x7ff) total += 2;
        else if (codigo <= 0xffff) total += 3;
        else total += 4;
    }
    return total;
}
