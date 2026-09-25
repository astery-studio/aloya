import { createHash } from 'node:crypto';
import { AppError } from '../errors/AppError.js';

function hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
}

function criarAutenticacao(prisma, relogio = () => new Date()) {
    return async function autenticar(requisicao, _resposta, proximo) {
        try {
            const cabecalho = requisicao.headers.authorization ?? '';
            const [esquema, token] = cabecalho.split(' ');
            if (esquema !== 'Bearer' || !token) {
                throw new AppError('Autenticação necessária.', 401, 'NAO_AUTENTICADO');
            }
            const sessao = await prisma.sessao.findUnique({
                where: { tokenSessaoHash: hashToken(token) },
                include: { usuario: true }
            });
            const invalida = !sessao || sessao.revogadaEm || sessao.validadeSessao <= relogio();
            const contaInativa = sessao?.usuario?.statusConta !== 'ativa';
            if (invalida || contaInativa) {
                throw new AppError('Sessão inválida ou expirada.', 401, 'SESSAO_INVALIDA');
            }
            requisicao.usuario = { id: sessao.usuarioId };
            proximo();
        } catch (erro) {
            proximo(erro);
        }
    };
}

export { criarAutenticacao, hashToken };
