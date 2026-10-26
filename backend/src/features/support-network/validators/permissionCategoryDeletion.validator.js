const ACOES_EXCLUSAO_CATEGORIA = Object.freeze({
    removerAcesso: 'remover_acesso',
    manterAcessoIndividual: 'manter_acesso_individual'
});

const ACOES_PERMITIDAS = new Set(Object.values(ACOES_EXCLUSAO_CATEGORIA));
const CAMPOS_PERMITIDOS = Object.freeze(['atualizadoEm', 'decisoes']);
const CAMPOS_DECISAO_PERMITIDOS = Object.freeze(['vinculoId', 'acao']);

function criarErro(campo, mensagem) {
    return { campo, mensagem };
}

function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) {
        return false;
    }

    const prototipo = Object.getPrototypeOf(valor);

    return prototipo === Object.prototype || prototipo === null;
}

function validarAtualizadoEm(valor, erros) {
    if (typeof valor !== 'string') {
        erros.push(criarErro('atualizadoEm', 'A versão da categoria é inválida.'));
        return null;
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime()) || data.toISOString() !== valor) {
        erros.push(criarErro('atualizadoEm', 'A versão da categoria é inválida.'));
        return null;
    }

    return data;
}

function validarDecisoes(valor, erros) {
    if (!Array.isArray(valor)) {
        erros.push(
            criarErro('decisoes', 'Informe uma decisão para cada contato vinculado à categoria.')
        );
        return [];
    }

    const idsEncontrados = new Set();
    const decisoes = [];

    valor.forEach((decisao, indice) => {
        const campo = `decisoes[${indice}]`;

        if (!ehObjetoSimples(decisao)) {
            erros.push(criarErro(campo, 'A decisão informada é inválida.'));
            return;
        }

        const camposDesconhecidos = Object.keys(decisao).filter(
            (chave) => !CAMPOS_DECISAO_PERMITIDOS.includes(chave)
        );

        if (camposDesconhecidos.length > 0) {
            erros.push(criarErro(campo, 'A decisão contém campos não permitidos.'));
            return;
        }

        if (!Number.isSafeInteger(decisao.vinculoId) || decisao.vinculoId <= 0) {
            erros.push(criarErro(`${campo}.vinculoId`, 'O vínculo informado é inválido.'));
            return;
        }

        if (idsEncontrados.has(decisao.vinculoId)) {
            erros.push(
                criarErro(`${campo}.vinculoId`, 'Cada contato deve possuir somente uma decisão.')
            );
            return;
        }

        if (!ACOES_PERMITIDAS.has(decisao.acao)) {
            erros.push(criarErro(`${campo}.acao`, 'A decisão informada é inválida.'));
            return;
        }

        idsEncontrados.add(decisao.vinculoId);
        decisoes.push({
            vinculoId: decisao.vinculoId,
            acao: decisao.acao
        });
    });

    return decisoes;
}

function validarExclusaoCategoria(body) {
    if (!ehObjetoSimples(body)) {
        return {
            valido: false,
            erros: [criarErro('dados', 'O corpo da requisição deve ser um objeto JSON.')],
            dados: {}
        };
    }

    const erros = [];
    const camposDesconhecidos = Object.keys(body).filter(
        (campo) => !CAMPOS_PERMITIDOS.includes(campo)
    );

    if (camposDesconhecidos.length > 0) {
        erros.push(criarErro('dados', 'A requisição contém campos não permitidos.'));
    }

    const atualizadoEm = validarAtualizadoEm(body.atualizadoEm, erros);
    const decisoes = validarDecisoes(body.decisoes, erros);

    return {
        valido: erros.length === 0,
        erros,
        dados: {
            atualizadoEm,
            decisoes
        }
    };
}

function criarPermissionCategoryDeletionValidator() {
    return {
        validarExclusaoCategoria
    };
}

export {
    ACOES_EXCLUSAO_CATEGORIA,
    criarPermissionCategoryDeletionValidator,
    validarExclusaoCategoria
};
