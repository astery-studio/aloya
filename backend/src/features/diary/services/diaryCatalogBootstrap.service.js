import { CATALOGO_DIARIO } from '../catalog/diary.catalog.js';

const IDS_MACROS = new Set(CATALOGO_DIARIO.map((macro) => macro.id));
const IDS_CATEGORIAS = new Set(
    CATALOGO_DIARIO.flatMap((macro) => macro.categorias.map((categoria) => categoria.id))
);
const OPCOES = new Map(
    CATALOGO_DIARIO.flatMap((macro) =>
        macro.categorias.flatMap((categoria) =>
            categoria.opcoes.map((opcao) => [
                opcao.id,
                {
                    categoriaId: categoria.id,
                    grupo: opcao.grupo,
                    nome: opcao.nome,
                    ordem: opcao.ordem
                }
            ])
        )
    )
);

function criarDiaryCatalogBootstrap({ prisma } = {}) {
    if (typeof prisma?.$transaction !== 'function') {
        throw new TypeError('Não foi possível configurar o catálogo do Diário.');
    }

    let sincronizacao;

    async function catalogoJaSincronizado() {
        if (
            typeof prisma.macrocategoriaDiario?.findMany !== 'function' ||
            typeof prisma.categoriaDiario?.findMany !== 'function' ||
            typeof prisma.opcaoDiario?.findMany !== 'function'
        ) {
            return false;
        }

        const [macros, categorias, opcoes] = await Promise.all([
            prisma.macrocategoriaDiario.findMany({ select: { id: true } }),
            prisma.categoriaDiario.findMany({ select: { id: true } }),
            prisma.opcaoDiario.findMany({
                select: { id: true, categoriaId: true, grupo: true, nome: true, ordem: true }
            })
        ]);
        const macrosAtuais = new Set(macros.map(({ id }) => id));
        const categoriasAtuais = new Set(categorias.map(({ id }) => id));
        const opcoesAtuais = new Map(opcoes.map((opcao) => [opcao.id, opcao]));

        return (
            [...IDS_MACROS].every((id) => macrosAtuais.has(id)) &&
            [...IDS_CATEGORIAS].every((id) => categoriasAtuais.has(id)) &&
            [...OPCOES].every(([id, esperada]) => {
                const atual = opcoesAtuais.get(id);
                return (
                    atual?.categoriaId === esperada.categoriaId &&
                    atual?.grupo === esperada.grupo &&
                    atual?.nome === esperada.nome &&
                    atual?.ordem === esperada.ordem
                );
            })
        );
    }

    async function executar() {
        if (await catalogoJaSincronizado()) return;

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
