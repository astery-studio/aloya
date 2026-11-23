function ehMenorDe16(dataNascimento, hoje = new Date()) {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataNascimento ?? '');

    if (!partes) return false;

    const nascimento = new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));

    if (Number.isNaN(nascimento.getTime()) || nascimento > hoje) return false;

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const aniversarioAindaNaoOcorreu =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

    if (aniversarioAindaNaoOcorreu) idade -= 1;

    return idade < 16;
}

export { ehMenorDe16 };
