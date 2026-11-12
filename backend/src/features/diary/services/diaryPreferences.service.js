import { AppError } from '../../../shared/errors/AppError.js';
import { CATALOGO_DIARIO } from '../catalog/diary.catalog.js';
import {
    incrementarVersao,
    traduzirErroPreferencias,
    validarUsuarioPreferencias
} from './diaryPreferences.shared.js';

const MACROS = new Set(CATALOGO_DIARIO.map(({ id }) => id));
const CATEGORIAS = new Set(
    CATALOGO_DIARIO.flatMap(({ categorias }) => categorias.map(({ id }) => id))
);
const CATEGORIAS_POR_MACRO = new Map(
    CATALOGO_DIARIO.map((macro) => [macro.id, macro.categorias.map((categoria) => categoria.id)])
);

function criarDiaryPreferencesService({ prisma, bootstrap } = {}) {
    if (typeof prisma?.$transaction !== 'function' || typeof bootstrap?.garantir !== 'function') {
        throw new TypeError('Não foi possível configurar as preferências do Diário.');
    }

    async function atualizar({ usuarioId, tipo, id, ativa, versao }) {
        validarUsuarioPreferencias(usuarioId);
        if (!['macrocategoria', 'categoria'].includes(tipo)) {
            throw new TypeError('Tipo de preferência inválido.');
        }
        const idsPermitidos = tipo === 'macrocategoria' ? MACROS : CATEGORIAS;
        if (!idsPermitidos.has(id)) {
            throw new AppError(
                'Item do catálogo não encontrado.',
                404,
                'ITEM_CATALOGO_NAO_ENCONTRADO'
            );
        }

        await bootstrap.garantir();

        try {
            return await prisma.$transaction(async (tx) => {
                await incrementarVersao(tx, usuarioId, versao);

                if (tipo === 'macrocategoria') {
                    await tx.preferenciaMacrocategoriaDiario.upsert({
                        where: { usuarioId_macrocategoriaId: { usuarioId, macrocategoriaId: id } },
                        create: { usuarioId, macrocategoriaId: id, ativa },
                        update: { ativa }
                    });
                    if (ativa) {
                        await tx.preferenciaCategoriaDiario.updateMany({
                            where: {
                                usuarioId,
                                categoriaId: { in: CATEGORIAS_POR_MACRO.get(id) ?? [] }
                            },
                            data: { ativa: true }
                        });
                    }
                } else {
                    await tx.preferenciaCategoriaDiario.upsert({
                        where: { usuarioId_categoriaId: { usuarioId, categoriaId: id } },
                        create: { usuarioId, categoriaId: id, ativa },
                        update: { ativa }
                    });
                }

                return { id, ativa, versao: versao + 1 };
            });
        } catch (erro) {
            throw traduzirErroPreferencias(erro);
        }
    }

    async function atualizarLote({ usuarioId, versao, macrocategorias, categorias }) {
        validarUsuarioPreferencias(usuarioId);
        await bootstrap.garantir();
        try {
            return await prisma.$transaction(async (tx) => {
                await incrementarVersao(tx, usuarioId, versao);
                for (const item of macrocategorias) {
                    await tx.preferenciaMacrocategoriaDiario.upsert({
                        where: {
                            usuarioId_macrocategoriaId: {
                                usuarioId,
                                macrocategoriaId: item.id
                            }
                        },
                        create: { usuarioId, macrocategoriaId: item.id, ativa: item.ativa },
                        update: { ativa: item.ativa }
                    });
                }
                for (const item of categorias) {
                    await tx.preferenciaCategoriaDiario.upsert({
                        where: { usuarioId_categoriaId: { usuarioId, categoriaId: item.id } },
                        create: { usuarioId, categoriaId: item.id, ativa: item.ativa },
                        update: { ativa: item.ativa }
                    });
                }
                return { versao: versao + 1 };
            });
        } catch (erro) {
            throw traduzirErroPreferencias(erro);
        }
    }

    return { atualizar, atualizarLote };
}

export { criarDiaryPreferencesService };
