import { AppError } from '../../../shared/errors/AppError.js';
import { formatarData, paraDataCalendario } from '../../cycles/utils/calendar.js';
import { apresentarDetalheRegistro } from '../presenters/diaryEntry.presenter.js';
import { montarCategorias } from './diaryEntry.data.js';
import { dataHojeNoFuso } from './diaryEntry.service.js';
import { traduzirErroMutacao, validarDependenciasEdicao } from './diaryMutation.errors.js';
import {
    assinaturaAtual,
    assinaturaCategorias,
    assinaturaNova,
    validarEdicaoCategorias
} from './diaryEdit.rules.js';
function criarDiaryEditService({
    prisma,
    bootstrap,
    phaseService,
    thermalRecalculation,
    agora = () => new Date()
} = {}) {
    validarDependenciasEdicao({ prisma, bootstrap, phaseService, thermalRecalculation });
    async function editar(usuarioId, registroId, versao, dados) {
        if (dados.data > dataHojeNoFuso(agora(), dados.fusoHorario)) {
            throw new AppError(
                'A data do registro não pode ser no futuro.',
                422,
                'DATA_REGISTRO_FUTURA'
            );
        }
        await bootstrap.garantir();
        try {
            const resultado = await prisma.$transaction(async (tx) => {
                const atual = await tx.registroDiario.findFirst({
                    where: { id: registroId, usuarioId },
                    include: {
                        categorias: { include: { opcoes: true, medicaoTemperatura: true } }
                    }
                });
                if (!atual) {
                    throw new AppError(
                        'Registro não encontrado.',
                        404,
                        'REGISTRO_DIARIO_NAO_ENCONTRADO'
                    );
                }
                if (atual.versao !== versao) {
                    throw new AppError(
                        'O registro foi alterado em outro dispositivo.',
                        409,
                        'CONFLITO_DIARIO'
                    );
                }
                const [preferenciasMacro, preferenciasCategoria] = await Promise.all([
                    tx.preferenciaMacrocategoriaDiario.findMany({ where: { usuarioId } }),
                    tx.preferenciaCategoriaDiario.findMany({ where: { usuarioId } })
                ]);
                const categoriasAtivas = validarEdicaoCategorias(
                    dados.categorias,
                    atual.categorias,
                    preferenciasMacro,
                    preferenciasCategoria
                );
                const categoriasAtuaisVisiveis = atual.categorias.filter(({ categoriaId }) =>
                    categoriasAtivas.has(categoriaId)
                );
                const mudouData = formatarData(atual.dataRegistro) !== dados.data;
                const mudouConteudo =
                    assinaturaCategorias(dados.categorias, assinaturaNova) !==
                    assinaturaCategorias(categoriasAtuaisVisiveis, assinaturaAtual);
                if (!mudouData && !mudouConteudo) {
                    return { registro: atual, categoriasAtivas };
                }

                const fase = mudouData
                    ? await phaseService.resolver(usuarioId, dados.data, tx)
                    : atual.faseCicloAssociada;
                const editado = await tx.registroDiario.update({
                    where: { id: registroId, usuarioId, versao },
                    data: {
                        dataRegistro: paraDataCalendario(dados.data),
                        faseCicloAssociada: fase,
                        versao: { increment: 1 },
                        categorias: {
                            deleteMany: { categoriaId: { in: [...categoriasAtivas] } },
                            create: montarCategorias(dados.categorias)
                        }
                    },
                    include: {
                        categorias: { include: { opcoes: true, medicaoTemperatura: true } }
                    }
                });
                await thermalRecalculation.recalcularPorDatas(
                    usuarioId,
                    [formatarData(atual.dataRegistro), dados.data],
                    tx
                );
                return { registro: editado, categoriasAtivas };
            });
            return apresentarDetalheRegistro(resultado.registro, null, resultado.categoriasAtivas);
        } catch (erro) {
            throw traduzirErroMutacao(erro);
        }
    }
    return { editar };
}
export { criarDiaryEditService };
