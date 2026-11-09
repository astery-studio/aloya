import { AppError } from '../../../shared/errors/AppError.js';

function validarUsuarioPreferencias(usuarioId) {
    if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
        throw new AppError('Sessão inválida.', 401, 'SESSAO_INVALIDA');
    }
}

async function incrementarVersao(tx, usuarioId, versao) {
    await tx.configuracaoDiario.upsert({
        where: { usuarioId },
        create: { usuarioId, versao: 0 },
        update: {}
    });
    const alteracao = await tx.configuracaoDiario.updateMany({
        where: { usuarioId, versao },
        data: { versao: { increment: 1 } }
    });
    if (alteracao.count !== 1) {
        throw new AppError(
            'As preferências foram alteradas em outro dispositivo.',
            409,
            'CONFLITO_PREFERENCIAS'
        );
    }
}

function traduzirErroPreferencias(erro) {
    if (erro?.code !== 'P2034') return erro;
    return new AppError(
        'As preferências foram alteradas em outro dispositivo.',
        409,
        'CONFLITO_PREFERENCIAS'
    );
}

export { incrementarVersao, traduzirErroPreferencias, validarUsuarioPreferencias };
