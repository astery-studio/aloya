import { AppError } from '../../../shared/errors/AppError.js';
import { diferencaDias } from '../../cycles/utils/calendar.js';
import { apresentarDetalheRegistro } from '../presenters/diaryEntry.presenter.js';
import { obterCategoriasAtivas } from './diaryActiveCategories.js';

function criarDiaryDetailService({ prisma } = {}) {
    if (
        !prisma?.registroDiario?.findFirst ||
        !prisma?.registroCiclo?.findFirst ||
        !prisma?.registroCiclo?.count ||
        !prisma?.preferenciaMacrocategoriaDiario?.findMany ||
        !prisma?.preferenciaCategoriaDiario?.findMany
    ) {
        throw new TypeError('Não foi possível configurar o detalhe do Diário.');
    }

    async function buscarContextoCiclo(usuarioId, dataRegistro) {
        const ciclo = await prisma.registroCiclo.findFirst({
            where: { usuarioId, dataInicio: { lte: dataRegistro } },
            orderBy: [{ dataInicio: 'desc' }, { id: 'desc' }],
            select: { dataInicio: true }
        });
        if (!ciclo) return null;
        const numero = await prisma.registroCiclo.count({
            where: { usuarioId, dataInicio: { lte: ciclo.dataInicio } }
        });
        const dia = diferencaDias(ciclo.dataInicio, dataRegistro) + 1;
        return Number.isSafeInteger(numero) && numero > 0 && dia > 0 ? { dia, numero } : null;
    }

    async function buscar(usuarioId, registroId) {
        const [preferenciasMacro, preferenciasCategoria] = await Promise.all([
            prisma.preferenciaMacrocategoriaDiario.findMany({ where: { usuarioId } }),
            prisma.preferenciaCategoriaDiario.findMany({ where: { usuarioId } })
        ]);
        const categoriasAtivas = obterCategoriasAtivas(preferenciasMacro, preferenciasCategoria);
        const registro = await prisma.registroDiario.findFirst({
            where: {
                id: registroId,
                usuarioId,
                categorias: { some: { categoriaId: { in: [...categoriasAtivas] } } }
            },
            include: {
                categorias: {
                    where: { categoriaId: { in: [...categoriasAtivas] } },
                    include: { opcoes: true, medicaoTemperatura: true }
                }
            }
        });
        if (!registro) {
            throw new AppError('Registro não encontrado.', 404, 'REGISTRO_DIARIO_NAO_ENCONTRADO');
        }
        const ciclo = await buscarContextoCiclo(usuarioId, registro.dataRegistro);
        return apresentarDetalheRegistro(registro, ciclo, categoriasAtivas);
    }

    return { buscar, buscarContextoCiclo };
}

export { criarDiaryDetailService };
