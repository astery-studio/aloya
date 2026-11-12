import { AppError } from '../../../shared/errors/AppError.js';
import { paraDataCalendario } from '../../cycles/utils/calendar.js';
import { apresentarDetalheRegistro } from '../presenters/diaryEntry.presenter.js';
import { obterCategoriasAtivas } from './diaryActiveCategories.js';
import { montarCategorias, validarCategoriasAtivas } from './diaryEntry.data.js';

function dataHojeNoFuso(instante, fusoHorario) {
    const partes = new Intl.DateTimeFormat('en', {
        timeZone: fusoHorario,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(instante);
    const valores = Object.fromEntries(
        partes.filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value])
    );
    return `${valores.year}-${valores.month}-${valores.day}`;
}

function criarDiaryEntryService({
    prisma,
    bootstrap,
    phaseService,
    thermalRecalculation,
    agora = () => new Date()
} = {}) {
    if (
        typeof prisma?.$transaction !== 'function' ||
        !bootstrap?.garantir ||
        !phaseService?.resolver ||
        !thermalRecalculation?.recalcularPorDatas
    ) {
        throw new TypeError('Não foi possível configurar os registros do Diário.');
    }

    async function criar(usuarioId, dados) {
        if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
            throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');
        }
        if (dados.data > dataHojeNoFuso(agora(), dados.fusoHorario)) {
            throw new AppError(
                'A data do registro não pode ser no futuro.',
                422,
                'DATA_REGISTRO_FUTURA'
            );
        }

        await bootstrap.garantir();

        try {
            const registro = await prisma.$transaction(async (tx) => {
                const [preferenciasMacro, preferenciasCategoria] = await Promise.all([
                    tx.preferenciaMacrocategoriaDiario.findMany({ where: { usuarioId } }),
                    tx.preferenciaCategoriaDiario.findMany({ where: { usuarioId } })
                ]);
                validarCategoriasAtivas(dados.categorias, preferenciasMacro, preferenciasCategoria);
                const categoriasAtivas = obterCategoriasAtivas(
                    preferenciasMacro,
                    preferenciasCategoria
                );
                const dataRegistro = paraDataCalendario(dados.data);
                const existente = await tx.registroDiario.findFirst({
                    where: { usuarioId, dataRegistro },
                    include: {
                        categorias: { include: { opcoes: true, medicaoTemperatura: true } }
                    }
                });
                if (
                    existente?.categorias.some(({ categoriaId }) =>
                        categoriasAtivas.has(categoriaId)
                    )
                ) {
                    throw new AppError(
                        'Já existe um registro para esta data.',
                        409,
                        'REGISTRO_DIARIO_DUPLICADO'
                    );
                }
                const fase = await phaseService.resolver(usuarioId, dados.data, tx);

                const criado = existente
                    ? await tx.registroDiario.update({
                          where: { id: existente.id, usuarioId, versao: existente.versao },
                          data: {
                              faseCicloAssociada: fase,
                              versao: { increment: 1 },
                              categorias: { create: montarCategorias(dados.categorias) }
                          },
                          include: {
                              categorias: { include: { opcoes: true, medicaoTemperatura: true } }
                          }
                      })
                    : await tx.registroDiario.create({
                          data: {
                              usuarioId,
                              dataRegistro,
                              faseCicloAssociada: fase,
                              categorias: { create: montarCategorias(dados.categorias) }
                          },
                          include: {
                              categorias: { include: { opcoes: true, medicaoTemperatura: true } }
                          }
                      });
                await thermalRecalculation.recalcularPorDatas(usuarioId, [dados.data], tx);
                return { registro: criado, categoriasAtivas };
            });
            return apresentarDetalheRegistro(registro.registro, null, registro.categoriasAtivas);
        } catch (erro) {
            if (erro?.code === 'P2002') {
                throw new AppError(
                    'Já existe um registro para esta data.',
                    409,
                    'REGISTRO_DIARIO_DUPLICADO'
                );
            }
            if (erro?.code === 'P2034') {
                throw new AppError(
                    'O Diário foi alterado simultaneamente.',
                    409,
                    'CONFLITO_DIARIO'
                );
            }
            throw erro;
        }
    }

    return { criar };
}

export { criarDiaryEntryService, dataHojeNoFuso };
