import { AppError } from '../../../shared/errors/AppError.js';
import { ordenarPermissoesCategoria } from '../constants/permissionCategory.constants.js';

function negarAcessoCompartilhado() {
    throw new AppError('Você não tem acesso a estes dados.', 403, 'ACESSO_COMPARTILHADO_NEGADO');
}

function lerIdCompartilhado(valor) {
    if (!/^[1-9]\d*$/.test(String(valor)) || Number(valor) > 2147483647) {
        negarAcessoCompartilhado();
    }
    return Number(valor);
}

function criarSharedSupportAccess({ prisma }) {
    async function consultar(contatoId, vinculoId) {
        const vinculo = await prisma.vinculoRedeApoio.findFirst({
            where: { id: lerIdCompartilhado(vinculoId), contatoId, status: 'ativo' },
            select: {
                titularId: true,
                titular: { select: { nome: true } },
                categoriaId: true,
                categoria: { select: { conjuntoDadosVisiveis: true } },
                permissoesIndividuais: true
            }
        });

        if (!vinculo) negarAcessoCompartilhado();
        const origem =
            vinculo.categoriaId == null
                ? vinculo.permissoesIndividuais
                : vinculo.categoria?.conjuntoDadosVisiveis;

        return {
            titularId: vinculo.titularId,
            nomeTitular: vinculo.titular.nome,
            permissoes: ordenarPermissoesCategoria(Array.isArray(origem) ? origem : [])
        };
    }

    async function consultarDados({ contatoId, vinculoId, permissao }, buscar) {
        const acesso = await consultar(lerIdCompartilhado(contatoId), vinculoId);
        if (permissao && !acesso.permissoes.includes(permissao)) negarAcessoCompartilhado();

        const dados = await buscar(acesso);
        // Uma autorização alterada durante a leitura invalida a resposta inteira.
        const vigente = await consultar(Number(contatoId), vinculoId);
        if (
            vigente.titularId !== acesso.titularId ||
            vigente.permissoes.join(',') !== acesso.permissoes.join(',')
        ) {
            negarAcessoCompartilhado();
        }

        return { permissoes: vigente.permissoes, dados };
    }

    return { consultarDados };
}

export { criarSharedSupportAccess, lerIdCompartilhado, negarAcessoCompartilhado };
