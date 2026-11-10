import { criarErro, validarTitular } from './supportContact.service.js';
import {
    TIPO_VINCULO_CATEGORIA,
    TIPO_VINCULO_INDIVIDUAL
} from '../constants/contactLink.constants.js';
import {
    corContatoEhValida,
    iconeContatoEhValido
} from '../constants/contactAppearance.constants.js';

const comparadorNomes = new Intl.Collator('pt-BR', {
    numeric: true,
    sensitivity: 'base'
});

function compararCategorias(primeira, segunda) {
    const porNome = comparadorNomes.compare(primeira.nome, segunda.nome);
    return porNome !== 0 ? porNome : primeira.id - segunda.id;
}

function criarErroContatoIndisponivel() {
    return criarErro(
        'Este contato ativo não está disponível para alteração.',
        404,
        'CONTATO_ATIVO_NAO_ENCONTRADO'
    );
}

function copiarPermissoes(permissoes) {
    return Array.isArray(permissoes) ? [...permissoes] : [];
}

function apresentarCategoria(categoria) {
    return Object.freeze({
        id: categoria.id,
        nome: categoria.nome,
        permissoes: Object.freeze(copiarPermissoes(categoria.conjuntoDadosVisiveis))
    });
}

function apresentarConfiguracao(vinculo, categorias) {
    const porCategoria = vinculo.categoria !== null;
    const permissoesAtuais = porCategoria
        ? vinculo.categoria.conjuntoDadosVisiveis
        : vinculo.permissoesIndividuais;

    return Object.freeze({
        contato: Object.freeze({
            id: vinculo.id,
            nome: vinculo.contato.nome,
            email: vinculo.emailConvidado,
            iconeId: iconeContatoEhValido(vinculo.iconeId) ? vinculo.iconeId : 'pessoa',
            corId: corContatoEhValida(vinculo.corId) ? vinculo.corId : 'branco'
        }),
        vinculoAtual: Object.freeze({
            tipo: porCategoria ? TIPO_VINCULO_CATEGORIA : TIPO_VINCULO_INDIVIDUAL,
            categoria: porCategoria ? apresentarCategoria(vinculo.categoria) : null,
            permissoes: Object.freeze(copiarPermissoes(permissoesAtuais))
        }),
        proximoVinculo: Object.freeze(
            porCategoria
                ? {
                      tipo: TIPO_VINCULO_INDIVIDUAL,
                      permissoesPreenchidas: Object.freeze([]),
                      categorias: Object.freeze(categorias.map(apresentarCategoria))
                  }
                : {
                      tipo: TIPO_VINCULO_CATEGORIA,
                      permissoesPreenchidas: Object.freeze([]),
                      categorias: Object.freeze(categorias.map(apresentarCategoria))
                  }
        ),
        versao: vinculo.atualizadoEm.toISOString()
    });
}

function permissoesIguais(primeiras, segundas) {
    return JSON.stringify(primeiras) === JSON.stringify(segundas);
}

function criarContactLinkService({ prisma, now = () => new Date() } = {}) {
    async function consultar({ titularId, papel, contatoId } = {}) {
        validarTitular(titularId, papel);
        if (
            !Number.isSafeInteger(contatoId) ||
            contatoId <= 0 ||
            typeof prisma?.vinculoRedeApoio?.findFirst !== 'function' ||
            typeof prisma?.categoriaPermissao?.findMany !== 'function'
        ) {
            throw new TypeError('Não foi possível consultar o vínculo deste contato.');
        }

        const vinculo = await prisma.vinculoRedeApoio.findFirst({
            where: { id: contatoId, titularId, status: 'ativo' },
            select: {
                id: true,
                emailConvidado: true,
                iconeId: true,
                corId: true,
                permissoesIndividuais: true,
                atualizadoEm: true,
                contato: { select: { nome: true } },
                categoria: {
                    select: {
                        id: true,
                        nome: true,
                        conjuntoDadosVisiveis: true
                    }
                }
            }
        });
        if (!vinculo?.contato) throw criarErroContatoIndisponivel();

        const categorias = await prisma.categoriaPermissao.findMany({
            where: { titularId },
            select: {
                id: true,
                nome: true,
                conjuntoDadosVisiveis: true
            },
            orderBy: [{ nomeNormalizado: 'asc' }, { id: 'asc' }]
        });

        if (!Array.isArray(categorias)) {
            throw new TypeError('A listagem de categorias disponíveis é inválida.');
        }

        return apresentarConfiguracao(vinculo, [...categorias].sort(compararCategorias));
    }

    async function atualizar({
        titularId,
        papel,
        contatoId,
        tipo,
        categoriaId,
        permissoesIndividuais,
        iconeId,
        corId,
        versao
    } = {}) {
        validarTitular(titularId, papel);
        if (
            !Number.isSafeInteger(contatoId) ||
            contatoId <= 0 ||
            !(versao instanceof Date) ||
            Number.isNaN(versao.getTime()) ||
            typeof prisma?.$transaction !== 'function' ||
            typeof now !== 'function'
        ) {
            throw new TypeError('Não foi possível atualizar o vínculo deste contato.');
        }

        return prisma.$transaction(async (tx) => {
            const atual = await tx.vinculoRedeApoio.findFirst({
                where: { id: contatoId, titularId, status: 'ativo' },
                select: {
                    id: true,
                    contatoId: true,
                    emailConvidado: true,
                    iconeId: true,
                    corId: true,
                    permissoesIndividuais: true,
                    atualizadoEm: true,
                    contato: { select: { nome: true } },
                    categoria: {
                        select: {
                            id: true,
                            nome: true,
                            conjuntoDadosVisiveis: true
                        }
                    }
                }
            });
            if (!atual?.contatoId || !atual.contato) throw criarErroContatoIndisponivel();

            if (atual.atualizadoEm.getTime() !== versao.getTime()) {
                throw criarErro(
                    'O vínculo foi alterado. Recarregue os dados e tente novamente.',
                    409,
                    'VINCULO_DESATUALIZADO'
                );
            }

            let categoriaDestino = null;
            let dadosAtualizacao;
            let vinculoAlterado = false;

            const iconeAtual = iconeContatoEhValido(atual.iconeId) ? atual.iconeId : 'pessoa';
            const corAtual = corContatoEhValida(atual.corId) ? atual.corId : 'branco';
            const proximoIconeId = iconeId ?? iconeAtual;
            const proximoCorId = corId ?? corAtual;

            if (!iconeContatoEhValido(proximoIconeId) || !corContatoEhValida(proximoCorId)) {
                throw criarErro(
                    'A aparência selecionada não está disponível.',
                    422,
                    'APARENCIA_CONTATO_INVALIDA'
                );
            }

            const aparenciaAlterada = proximoIconeId !== iconeAtual || proximoCorId !== corAtual;

            if (atual.categoria) {
                if (tipo === TIPO_VINCULO_CATEGORIA) {
                    if (categoriaId === atual.categoria.id) {
                        dadosAtualizacao = {
                            categoriaId: atual.categoria.id,
                            permissoesIndividuais: []
                        };
                    } else {
                        categoriaDestino = await tx.categoriaPermissao.findFirst({
                            where: { id: categoriaId, titularId },
                            select: {
                                id: true,
                                nome: true,
                                conjuntoDadosVisiveis: true
                            }
                        });
                        if (!categoriaDestino) {
                            throw criarErro(
                                'A categoria selecionada não está disponível.',
                                404,
                                'CATEGORIA_NAO_ENCONTRADA'
                            );
                        }
                        vinculoAlterado = true;
                        dadosAtualizacao = {
                            categoriaId: categoriaDestino.id,
                            permissoesIndividuais: []
                        };
                    }
                } else if (tipo !== TIPO_VINCULO_INDIVIDUAL) {
                    throw criarErro(
                        'Escolha permissões individuais diferentes das atuais.',
                        422,
                        'TIPO_VINCULO_DESTINO_INVALIDO'
                    );
                } else if (
                    permissoesIguais(atual.categoria.conjuntoDadosVisiveis, permissoesIndividuais)
                ) {
                    throw criarErro(
                        'Altere ao menos uma permissão antes de salvar.',
                        422,
                        'VINCULO_SEM_ALTERACAO'
                    );
                } else {
                    vinculoAlterado = true;
                    dadosAtualizacao = {
                        categoriaId: null,
                        permissoesIndividuais
                    };
                }
            } else {
                if (tipo === TIPO_VINCULO_INDIVIDUAL) {
                    if (!permissoesIguais(atual.permissoesIndividuais, permissoesIndividuais)) {
                        throw criarErro(
                            'Escolha uma categoria para alterar o vínculo.',
                            422,
                            'TIPO_VINCULO_DESTINO_INVALIDO'
                        );
                    }
                    dadosAtualizacao = {
                        categoriaId: null,
                        permissoesIndividuais: atual.permissoesIndividuais
                    };
                } else if (tipo !== TIPO_VINCULO_CATEGORIA) {
                    throw criarErro(
                        'Escolha uma categoria para alterar o vínculo.',
                        422,
                        'TIPO_VINCULO_DESTINO_INVALIDO'
                    );
                } else {
                    categoriaDestino = await tx.categoriaPermissao.findFirst({
                        where: { id: categoriaId, titularId },
                        select: {
                            id: true,
                            nome: true,
                            conjuntoDadosVisiveis: true
                        }
                    });
                    if (!categoriaDestino) {
                        throw criarErro(
                            'A categoria selecionada não está disponível.',
                            404,
                            'CATEGORIA_NAO_ENCONTRADA'
                        );
                    }
                    vinculoAlterado = true;
                    dadosAtualizacao = {
                        categoriaId: categoriaDestino.id,
                        permissoesIndividuais: []
                    };
                }
            }

            if (!vinculoAlterado && !aparenciaAlterada) {
                throw criarErro(
                    'Altere o vínculo, o ícone ou a cor antes de salvar.',
                    422,
                    'VINCULO_SEM_ALTERACAO'
                );
            }

            if (iconeId !== undefined) {
                dadosAtualizacao.iconeId = proximoIconeId;
                dadosAtualizacao.corId = proximoCorId;
            }

            const atualizacao = await tx.vinculoRedeApoio.updateMany({
                where: {
                    id: contatoId,
                    titularId,
                    contatoId: atual.contatoId,
                    status: 'ativo',
                    atualizadoEm: versao
                },
                data: dadosAtualizacao
            });
            if (atualizacao.count !== 1) {
                throw criarErro(
                    'O vínculo foi alterado. Recarregue os dados e tente novamente.',
                    409,
                    'VINCULO_DESATUALIZADO'
                );
            }

            if (vinculoAlterado) {
                await tx.notificacao.create({
                    data: {
                        usuarioId: atual.contatoId,
                        tipoOrigem: 'rede_apoio',
                        origemId: atual.id,
                        dataHoraProgramada: now(),
                        statusEnvio: 'agendada'
                    }
                });
            }

            const categoriaResultado =
                tipo === TIPO_VINCULO_CATEGORIA ? (categoriaDestino ?? atual.categoria) : null;

            return Object.freeze({
                contatoId: atual.id,
                tipo,
                categoria: categoriaResultado ? apresentarCategoria(categoriaResultado) : null,
                permissoes:
                    tipo === TIPO_VINCULO_CATEGORIA
                        ? Object.freeze(copiarPermissoes(categoriaResultado.conjuntoDadosVisiveis))
                        : Object.freeze(copiarPermissoes(permissoesIndividuais)),
                iconeId: proximoIconeId,
                corId: proximoCorId
            });
        });
    }

    return Object.freeze({ atualizar, consultar });
}

export {
    apresentarConfiguracao,
    criarContactLinkService,
    criarErroContatoIndisponivel,
    permissoesIguais
};
