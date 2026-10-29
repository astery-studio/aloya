import { CONFIG_PREVISAO } from '../../cycles/constants/prediction.config.js';

const SELECT_PARAMETROS = Object.freeze({
    duracaoCicloInformada: true,
    duracaoMenstruacaoInformada: true,
    duracaoLuteaInformada: true
});

function criarCycleParametersService({ prisma, recalcularPrevisoes } = {}) {
    function apresentar(parametros) {
        return {
            duracaoCicloInformada: parametros.duracaoCicloInformada ?? CONFIG_PREVISAO.cicloPadrao,
            duracaoMenstruacaoInformada:
                parametros.duracaoMenstruacaoInformada ?? CONFIG_PREVISAO.sangramentoPadrao,
            duracaoLuteaInformada: parametros.duracaoLuteaInformada ?? CONFIG_PREVISAO.luteaPadrao
        };
    }

    function erroNaoEncontrado() {
        const erro = new Error('Usuário não encontrado.');
        erro.status = 404;
        erro.codigo = 'USUARIO_NAO_ENCONTRADO';
        return erro;
    }

    async function buscar(usuarioId) {
        const parametros = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: SELECT_PARAMETROS
        });

        if (!parametros) throw erroNaoEncontrado();
        return apresentar(parametros);
    }

    async function atualizar(usuarioId, dados) {
        const atuais = await buscar(usuarioId);
        const houveAlteracao = Object.keys(SELECT_PARAMETROS).some(
            (campo) => atuais[campo] !== dados[campo]
        );

        if (!houveAlteracao) {
            const erro = new Error('Nenhuma alteração foi identificada.');
            erro.status = 422;
            erro.codigo = 'NENHUMA_ALTERACAO';
            throw erro;
        }

        const atualizados = await prisma.usuario.update({
            where: { id: usuarioId },
            data: dados,
            select: SELECT_PARAMETROS
        });

        await recalcularPrevisoes(usuarioId);
        return apresentar(atualizados);
    }

    return { buscar, atualizar };
}

export { criarCycleParametersService };
