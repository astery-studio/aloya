import { AppError } from '../../../shared/errors/AppError.js';
import { apresentarDetalheRegistro } from '../presenters/diaryEntry.presenter.js';

function criarDiaryDetailService({ prisma } = {}) {
    if (!prisma?.registroDiario?.findFirst) {
        throw new TypeError('Não foi possível configurar o detalhe do Diário.');
    }

    async function buscar(usuarioId, registroId) {
        const registro = await prisma.registroDiario.findFirst({
            where: { id: registroId, usuarioId },
            include: {
                categorias: { include: { opcoes: true, medicaoTemperatura: true } }
            }
        });
        if (!registro) {
            throw new AppError('Registro não encontrado.', 404, 'REGISTRO_DIARIO_NAO_ENCONTRADO');
        }
        return apresentarDetalheRegistro(registro);
    }

    return { buscar };
}

export { criarDiaryDetailService };
