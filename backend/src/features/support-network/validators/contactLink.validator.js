import {
    ordenarPermissoesCategoria,
    permissaoCategoriaEhValida
} from '../constants/permissionCategory.constants.js';
import {
    TIPO_VINCULO_CATEGORIA,
    TIPO_VINCULO_INDIVIDUAL,
    TIPOS_VINCULO
} from '../constants/contactLink.constants.js';

const CAMPOS_PERMITIDOS = Object.freeze([
    'tipo',
    'categoriaId',
    'permissoesIndividuais',
    'versao'
]);

function objetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) return false;
    const prototipo = Object.getPrototypeOf(valor);
    return prototipo === Object.prototype || prototipo === null;
}

function inteiroPositivo(valor) {
    return Number.isSafeInteger(valor) && valor > 0;
}

function validarVersao(valor, erros) {
    if (typeof valor !== 'string') {
        erros.push({ campo: 'versao', mensagem: 'A versão do vínculo é obrigatória.' });
        return null;
    }

    const data = new Date(valor);
    if (Number.isNaN(data.getTime()) || data.toISOString() !== valor) {
        erros.push({ campo: 'versao', mensagem: 'A versão do vínculo é inválida.' });
        return null;
    }
    return data;
}

function criarContactLinkValidator() {
    function validarAtualizacao(body) {
        const erros = [];
        if (!objetoSimples(body)) {
            return Object.freeze({
                valido: false,
                erros: Object.freeze([
                    Object.freeze({ campo: 'body', mensagem: 'Dados do vínculo inválidos.' })
                ])
            });
        }

        for (const campo of Object.keys(body)) {
            if (!CAMPOS_PERMITIDOS.includes(campo)) {
                erros.push({ campo, mensagem: 'Campo não permitido.' });
            }
        }

        const tipo = body.tipo;
        if (!TIPOS_VINCULO.includes(tipo)) {
            erros.push({ campo: 'tipo', mensagem: 'Escolha um tipo de vínculo válido.' });
        }

        let categoriaId = null;
        let permissoesIndividuais = null;

        if (tipo === TIPO_VINCULO_CATEGORIA) {
            if (!inteiroPositivo(body.categoriaId)) {
                erros.push({ campo: 'categoriaId', mensagem: 'Escolha uma categoria válida.' });
            } else {
                categoriaId = body.categoriaId;
            }
            if (body.permissoesIndividuais !== undefined) {
                erros.push({
                    campo: 'permissoesIndividuais',
                    mensagem: 'Não envie permissões individuais ao escolher uma categoria.'
                });
            }
        }

        if (tipo === TIPO_VINCULO_INDIVIDUAL) {
            if (
                !Array.isArray(body.permissoesIndividuais) ||
                body.permissoesIndividuais.length === 0
            ) {
                erros.push({
                    campo: 'permissoesIndividuais',
                    mensagem: 'Selecione ao menos um tipo de dado para este contato.'
                });
            } else if (
                body.permissoesIndividuais.some(
                    (permissao) => !permissaoCategoriaEhValida(permissao)
                )
            ) {
                erros.push({
                    campo: 'permissoesIndividuais',
                    mensagem: 'A seleção contém permissões inválidas.'
                });
            } else {
                permissoesIndividuais = ordenarPermissoesCategoria(
                    body.permissoesIndividuais
                );
            }
            if (body.categoriaId !== undefined) {
                erros.push({
                    campo: 'categoriaId',
                    mensagem: 'Não envie categoria ao escolher permissões individuais.'
                });
            }
        }

        const versao = validarVersao(body.versao, erros);
        if (erros.length > 0) {
            return Object.freeze({
                valido: false,
                erros: Object.freeze(erros.map(Object.freeze))
            });
        }

        return Object.freeze({
            valido: true,
            dados: Object.freeze({ tipo, categoriaId, permissoesIndividuais, versao })
        });
    }

    return Object.freeze({ validarAtualizacao });
}

export { criarContactLinkValidator };
