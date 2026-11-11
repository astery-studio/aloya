import { CATALOGO_DIARIO } from '../catalog/diary.catalog.js';

function criarDiaryCatalogBootstrap({ prisma } = {}) {
    if (typeof prisma?.$transaction !== 'function') {
        throw new TypeError('Não foi possível configurar o catálogo do Diário.');
    }

    let sincronizacao;

    async function executar() {
        await prisma.$transaction(async (tx) => {
            for (const macro of CATALOGO_DIARIO) {
                await tx.macrocategoriaDiario.upsert({
                    where: { id: macro.id },
                    create: {
                        id: macro.id,
                        nome: macro.nome,
                        nomeCompacto: macro.nomeCompacto ?? null,
                        ordem: macro.ordem,
                        sensivel: macro.sensivel
                    },
                    update: {}
                });

                for (const categoria of macro.categorias) {
                    await tx.categoriaDiario.upsert({
                        where: { id: categoria.id },
                        create: {
                            id: categoria.id,
                            macrocategoriaId: macro.id,
                            nome: categoria.nome,
                            ordem: categoria.ordem,
                            tipoValor: categoria.tipoValor,
                            sensivel: categoria.sensivel
                        },
                        update: {}
                    });

                    await tx.opcaoDiario.updateMany({
                        where: { categoriaId: categoria.id },
                        data: { ordem: { increment: 100000 } }
                    });

                    for (const opcao of categoria.opcoes) {
                        await tx.opcaoDiario.upsert({
                            where: { id: opcao.id },
                            create: {
                                id: opcao.id,
                                categoriaId: categoria.id,
                                grupo: opcao.grupo,
                                nome: opcao.nome,
                                ordem: opcao.ordem
                            },
                            update: {
                                grupo: opcao.grupo,
                                nome: opcao.nome,
                                ordem: opcao.ordem
                            }
                        });
                    }
                }
            }
        });
    }

    async function garantir() {
        sincronizacao ??= executar().catch((erro) => {
            sincronizacao = null;
            throw erro;
        });
        return sincronizacao;
    }

    return { garantir };
}

export { criarDiaryCatalogBootstrap };
