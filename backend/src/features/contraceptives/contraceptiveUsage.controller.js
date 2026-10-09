import { AppError } from '../../shared/errors/AppError.js';

function criarContraceptiveUsageController(service) {
    async function definirConfirmacao(requisicao, resposta, proximo) {
        try {
            const uso = await service.definirConfirmacao(requisicao.usuario.id, requisicao.params.id, requisicao.body);
            resposta.status(200).json({ uso });
        } catch (erro) {
            if (erro instanceof AppError) return proximo(erro);
            const falha = new AppError('Não foi possível atualizar o uso do anticoncepcional no momento. Tente novamente.', 500, 'ERRO_CONFIRMAR_USO');
            falha.cause = erro;
            proximo(falha);
        }
    }
    return { definirConfirmacao };
}

export { criarContraceptiveUsageController };
