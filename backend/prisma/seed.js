import { CATALOGO_DIARIO } from '../src/features/diary/catalog/diary.catalog.js';
import { prisma } from '../src/shared/config/prisma.js';

async function popularCatalogoDiario() {
    for (const macro of CATALOGO_DIARIO) {
        const dadosMacro = {
            nome: macro.nome,
            nomeCompacto: macro.nomeCompacto ?? null,
            ordem: macro.ordem,
            sensivel: macro.sensivel
        };

        await prisma.macrocategoriaDiario.upsert({
            where: { id: macro.id },
            create: { id: macro.id, ...dadosMacro },
            update: dadosMacro
        });

        for (const categoria of macro.categorias) {
            const dadosCategoria = {
                macrocategoriaId: macro.id,
                nome: categoria.nome,
                ordem: categoria.ordem,
                tipoValor: categoria.tipoValor,
                sensivel: categoria.sensivel
            };

            await prisma.categoriaDiario.upsert({
                where: { id: categoria.id },
                create: { id: categoria.id, ...dadosCategoria },
                update: dadosCategoria
            });

            for (const opcao of categoria.opcoes) {
                const dadosOpcao = {
                    categoriaId: categoria.id,
                    grupo: opcao.grupo,
                    nome: opcao.nome,
                    ordem: opcao.ordem
                };

                await prisma.opcaoDiario.upsert({
                    where: { id: opcao.id },
                    create: { id: opcao.id, ...dadosOpcao },
                    update: dadosOpcao
                });
            }
        }
    }
}

popularCatalogoDiario()
    .then(() => console.info('Catálogo do Diário atualizado.'))
    .catch((erro) => {
        console.error('Não foi possível atualizar o catálogo do Diário.', erro.name);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
