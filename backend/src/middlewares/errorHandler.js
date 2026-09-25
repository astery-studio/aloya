import { AppError } from '../errors/AppError.js';

function tratarErro(erro, _requisicao, resposta, _proximo) {
    if (erro instanceof AppError) {
        return resposta.status(erro.status).json({
            erro: { codigo: erro.codigo, mensagem: erro.message }
        });
    }
    console.error(erro);
    return resposta.status(500).json({
        erro: {
            codigo: 'ERRO_INTERNO',
            mensagem: 'Não foi possível cadastrar o anticoncepcional. Tente novamente.'
        }
    });
}

export { tratarErro };
