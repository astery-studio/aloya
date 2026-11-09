import { AppError } from '../../../shared/errors/AppError.js';
import { formatarData } from '../../cycles/utils/calendar.js';

function criarDiaryDeletionService({ prisma, thermalRecalculation } = {}) {
    if (typeof prisma?.$transaction !== 'function' || !thermalRecalculation?.recalcularPorDatas) {
        throw new TypeError('Não foi possível configurar a exclusão do Diário.');
    }

    async function excluir(usuarioId, registroId, versao) {
        try {
            await prisma.$transaction(async (tx) => {
                const registro = await tx.registroDiario.findFirst({
                    where: { id: registroId, usuarioId },
                    select: { id: true, versao: true, dataRegistro: true }
                });
                if (!registro) {
                    throw new AppError(
                        'Registro não encontrado.',
                        404,
                        'REGISTRO_DIARIO_NAO_ENCONTRADO'
                    );
                }
                if (registro.versao !== versao) {
                    throw new AppError(
                        'O registro foi alterado em outro dispositivo.',
                        409,
                        'CONFLITO_DIARIO'
                    );
                }
                await tx.registroDiario.delete({
                    where: { id: registroId, usuarioId, versao }
                });
                await thermalRecalculation.recalcularPorDatas(
                    usuarioId,
                    [formatarData(registro.dataRegistro)],
                    tx
                );
            });
        } catch (erro) {
            if (['P2025', 'P2034'].includes(erro?.code)) {
                throw new AppError(
                    'O registro foi alterado em outro dispositivo.',
                    409,
                    'CONFLITO_DIARIO'
                );
            }
            throw erro;
        }
    }

    return { excluir };
}

export { criarDiaryDeletionService };
