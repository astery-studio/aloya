import {
    ACOES_RESPOSTA_CONVITE,
    ordenarPermissoesCategoria,
    permissaoCategoriaEhValida,
    permissoesDaCategoria
} from '../constants/contactInvitation.constants.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const TAMANHO_MAXIMO_EMAIL = 254;
const CAMPOS_CONSULTA = Object.freeze(['email']);
const CAMPOS_CONVITE = Object.freeze(['email', 'categoriaId', 'permissoesIndividuais']);
const CAMPOS_RESPOSTA = Object.freeze(['acao']);

function erro(campo, mensagem) {
    return { campo, mensagem };
}

function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
        return false;
    }

    const prototipo = Object.getPrototypeOf(valor);
    return prototipo === Object.prototype || prototipo === null;
}

function validarEmail(emailRecebido, erros) {
    const email = typeof emailRecebido === 'string' ? emailRecebido.trim().toLowerCase() : '';

    if (!EMAIL_REGEX.test(email) || email.length > TAMANHO_MAXIMO_EMAIL) {
        erros.push(erro('email', 'Informe um e-mail válido.'));
    }

    return email;
}

function validarCampos(body, permitidos, erros) {
    const camposDesconhecidos = Object.keys(body).filter((campo) => !permitidos.includes(campo));

    if (camposDesconhecidos.length > 0) {
        erros.push(erro('dados', 'A requisição contém campos não permitidos.'));
    }
}

function validarCategoriaId(categoriaId, erros) {
    if (categoriaId === undefined) {
        return null;
    }

    if (!Number.isSafeInteger(categoriaId) || categoriaId <= 0) {
        erros.push(erro('categoriaId', 'Selecione uma categoria válida.'));
        return null;
    }

    return categoriaId;
}

function validarPermissoesIndividuais(permissoes, erros) {
    if (permissoes === undefined) {
        return null;
    }

    if (
        !Array.isArray(permissoes) ||
        permissoes.length === 0 ||
        permissoes.length > permissoesDaCategoria.length ||
        permissoes.some((permissao) => !permissaoCategoriaEhValida(permissao))
    ) {
        erros.push(
            erro(
                'permissoesIndividuais',
                'Selecione ao menos um tipo de dado para o contato visualizar.'
            )
        );
        return [];
    }

    return ordenarPermissoesCategoria(permissoes);
}

function respostaCorpoInvalido() {
    return {
        valido: false,
        erros: [erro('dados', 'O corpo da requisição deve ser um objeto JSON.')],
        dados: {}
    };
}

function validarConsultaEmail(body) {
    if (!ehObjetoSimples(body)) {
        return respostaCorpoInvalido();
    }

    const erros = [];
    validarCampos(body, CAMPOS_CONSULTA, erros);
    const email = validarEmail(body.email, erros);

    return { valido: erros.length === 0, erros, dados: { email } };
}

function validarCriacaoConvite(body) {
    if (!ehObjetoSimples(body)) {
        return respostaCorpoInvalido();
    }

    const erros = [];
    validarCampos(body, CAMPOS_CONVITE, erros);

    const email = validarEmail(body.email, erros);
    const categoriaId = validarCategoriaId(body.categoriaId, erros);
    const permissoesIndividuais = validarPermissoesIndividuais(body.permissoesIndividuais, erros);
    const informouCategoria = body.categoriaId !== undefined;
    const informouPermissoes = body.permissoesIndividuais !== undefined;

    if (informouCategoria === informouPermissoes) {
        erros.push(
            erro(
                'permissao',
                'Escolha uma categoria ou defina permissões individuais para o contato.'
            )
        );
    }

    return {
        valido: erros.length === 0,
        erros,
        dados: { email, categoriaId, permissoesIndividuais }
    };
}

function validarTokenConvite(token) {
    const valido =
        typeof token === 'string' &&
        token.length >= 32 &&
        token.length <= 256 &&
        /^[A-Za-z0-9_-]+$/.test(token);

    return {
        valido,
        erros: valido ? [] : [erro('token', 'Este convite não está mais disponível.')],
        dados: { token: valido ? token : null }
    };
}

function validarRespostaConvite(body) {
    if (!ehObjetoSimples(body)) return respostaCorpoInvalido();

    const erros = [];
    validarCampos(body, CAMPOS_RESPOSTA, erros);
    const acao = typeof body.acao === 'string' ? body.acao.trim().toLowerCase() : '';

    if (!ACOES_RESPOSTA_CONVITE.includes(acao)) {
        erros.push(erro('acao', 'Escolha aceitar ou recusar o convite.'));
    }

    return { valido: erros.length === 0, erros, dados: { acao } };
}

function criarContactInvitationValidator() {
    return Object.freeze({
        validarConsultaEmail,
        validarCriacaoConvite,
        validarRespostaConvite,
        validarTokenConvite
    });
}

export {
    criarContactInvitationValidator,
    validarConsultaEmail,
    validarCriacaoConvite,
    validarRespostaConvite,
    validarTokenConvite
};
