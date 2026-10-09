//Valida a paginação do histórico e impede parâmetros malformados de chegarem ao banco.
import {AppError} from '../../shared/errors/AppError.js';

const LIMITE_PADRAO = 20;
const LIMITE_MAXIMO = 50;
const TAMANHO_MAXIMO_CURSOR = 256;
const PARAMETROS_PERMITIDOS = Object.freeze([
    'limit',
    'cursor'
]);

//Cria o erro controlado usado para parâmetros inválidos do histórico.
function criarErro(mensagem, codigo) {
    return new AppError(mensagem, 400, codigo);
}

//Confere se o valor contém uma data UTC exata no formato gerado por toISOString.
function normalizarDataDoCursor(valor) {
    if (typeof valor !== 'string') {
        return null;
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime()) || data.toISOString() !== valor) {
        return null;
    }

    return data;
}

//Confere se o identificador do cursor é um inteiro positivo seguro.
function normalizarIdDoCursor(valor) {
    if (!Number.isSafeInteger(valor) || valor <= 0) {
        return null;
    }

    return valor;
}

//Transforma os dados do último ciclo em um cursor opaco para a próxima página.
function criarCursorHistorico({dataInicio, id} = {}) {
    if (!(dataInicio instanceof Date) || Number.isNaN(dataInicio.getTime())) {
        throw new TypeError('A data de início do cursor é inválida.');
    }

    const idSeguro = normalizarIdDoCursor(id);

    if (idSeguro === null) {
        throw new TypeError('O identificador do cursor é inválido.');
    }

    const conteudo = JSON.stringify({
        v: 1,
        dataInicio: dataInicio.toISOString(),
        id: idSeguro
    });

    return Buffer.from(conteudo, 'utf8').toString('base64url');
}

//Decodifica e valida o cursor sem confiar no conteúdo enviado pela pessoa usuária.
function decodificarCursorHistorico(valor) {
    if (
        typeof valor !== 'string'
        || !valor
        || valor.length > TAMANHO_MAXIMO_CURSOR
        || !/^[A-Za-z0-9_-]+$/.test(valor)
    ) {
        throw criarErro(
            'O cursor informado é inválido.',
            'CURSOR_HISTORICO_INVALIDO'
        );
    }

    try {
        const conteudo = Buffer.from(valor, 'base64url').toString('utf8');
        const cursorCanonico = Buffer.from(conteudo, 'utf8').toString('base64url');

        if (cursorCanonico !== valor) {
            throw new Error('Cursor não canônico.');
        }

        const dados = JSON.parse(conteudo);
        const chaves = dados && typeof dados === 'object' && !Array.isArray(dados)
            ? Object.keys(dados)
            : [];

        if (
            chaves.length !== 3
            || !chaves.includes('v')
            || !chaves.includes('dataInicio')
            || !chaves.includes('id')
            || dados.v !== 1
        ) {
            throw new Error('Estrutura do cursor inválida.');
        }

        const dataInicio = normalizarDataDoCursor(dados.dataInicio);
        const id = normalizarIdDoCursor(dados.id);

        if (!dataInicio || id === null) {
            throw new Error('Dados do cursor inválidos.');
        }

        return {
            dataInicio,
            id
        };
    } catch (erro) {
        if (erro instanceof AppError) {
            throw erro;
        }

        throw criarErro(
            'O cursor informado é inválido.',
            'CURSOR_HISTORICO_INVALIDO'
        );
    }
}

//Normaliza o limite recebido na query e aplica o máximo permitido pela API.
function normalizarLimite(valor) {
    if (valor === undefined) {
        return LIMITE_PADRAO;
    }

    if (
        typeof valor !== 'string'
        || !/^[1-9]\d{0,2}$/.test(valor)
    ) {
        throw criarErro(
            `O limite deve ser um número inteiro entre 1 e ${LIMITE_MAXIMO}.`,
            'LIMITE_HISTORICO_INVALIDO'
        );
    }

    const limite = Number(valor);

    if (limite > LIMITE_MAXIMO) {
        throw criarErro(
            `O limite deve ser um número inteiro entre 1 e ${LIMITE_MAXIMO}.`,
            'LIMITE_HISTORICO_INVALIDO'
        );
    }

    return limite;
}

//Valida somente os parâmetros aceitos pelo endpoint de histórico.
function validarConsultaHistorico(consulta = {}) {
    if (
        consulta === null
        || typeof consulta !== 'object'
        || Array.isArray(consulta)
    ) {
        throw criarErro(
            'Os parâmetros da consulta são inválidos.',
            'CONSULTA_HISTORICO_INVALIDA'
        );
    }

    const parametrosRecebidos = Object.keys(consulta);
    const parametroDesconhecido = parametrosRecebidos.find(
        parametro => !PARAMETROS_PERMITIDOS.includes(parametro)
    );

    if (parametroDesconhecido) {
        throw criarErro(
            `O parâmetro "${parametroDesconhecido}" não é permitido.`,
            'PARAMETRO_HISTORICO_DESCONHECIDO'
        );
    }

    const possuiLimite = Object.prototype.hasOwnProperty.call(consulta, 'limit');
    const possuiCursor = Object.prototype.hasOwnProperty.call(consulta, 'cursor');

    return {
        limite: normalizarLimite(possuiLimite ? consulta.limit : undefined),
        cursor: possuiCursor && consulta.cursor !== undefined
            ? decodificarCursorHistorico(consulta.cursor)
            : null
    };
}

export {
    LIMITE_MAXIMO,
    LIMITE_PADRAO,
    criarCursorHistorico,
    decodificarCursorHistorico,
    validarConsultaHistorico
};