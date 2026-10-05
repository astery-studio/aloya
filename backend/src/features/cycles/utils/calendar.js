const DIA_EM_MS = 86_400_000;

function preencherDoisDigitos(valor) {
    return String(valor).padStart(2, '0');
}

function validarTextoData(texto) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        throw new TypeError('Data de calendário inválida.');
    }

    const [ano, mes, dia] = texto.split('-').map(Number);
    if (ano < 1900) {
        throw new TypeError('Data de calendário inválida.');
    }

    const data = new Date(Date.UTC(ano, mes - 1, dia));
    const correspondeAoTexto = data.getUTCFullYear() === ano
        && data.getUTCMonth() === mes - 1
        && data.getUTCDate() === dia;

    if (!correspondeAoTexto) {
        throw new TypeError('Data de calendário inválida.');
    }

    return texto;
}

function formatarData(valor) {
    if (typeof valor === 'string') {
        return validarTextoData(valor);
    }

    if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) {
        throw new TypeError('Data de calendário inválida.');
    }

    const ano = valor.getUTCFullYear();
    const mes = valor.getUTCMonth() + 1;
    const dia = valor.getUTCDate();

    return validarTextoData(
        `${ano}-${preencherDoisDigitos(mes)}-${preencherDoisDigitos(dia)}`
    );
}

function ehDataCalendarioValida(valor) {
    try {
        formatarData(valor);
        return true;
    } catch {
        return false;
    }
}

function paraDataCalendario(valor) {
    const [ano, mes, dia] = formatarData(valor).split('-').map(Number);
    return new Date(Date.UTC(ano, mes - 1, dia));
}

function adicionarDias(valor, quantidade) {
    if (!Number.isSafeInteger(quantidade)) {
        throw new TypeError('Quantidade de dias inválida.');
    }

    const data = paraDataCalendario(valor);
    data.setUTCDate(data.getUTCDate() + quantidade);
    return formatarData(data);
}

function diferencaDias(inicio, fim) {
    return Math.round(
        (paraDataCalendario(fim) - paraDataCalendario(inicio)) / DIA_EM_MS
    );
}

export {
    adicionarDias,
    diferencaDias,
    ehDataCalendarioValida,
    formatarData,
    paraDataCalendario
};
