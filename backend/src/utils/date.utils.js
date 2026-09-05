function criarDataValida(dataTexto) {

    //Se o que chegou não for um texto, ele já devolve nulo e cancela.
    if (typeof dataTexto !== 'string') {
        return null;
    }

    //Força que o texto tenha estritamente o formato "4 números - 2 números - 2 números" (YYYY-MM-DD).
    //obs: O backend utiliza o padrão internacional ISO 8601 pois ele evita ambiguidades regionais, permite ordenação cronológica direta e é o formato nativo esperado pelo banco
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataTexto)) {
        return null;
    }
}