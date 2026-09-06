function rotaNaoEncontrada(_req, res) {
    return res.status(404).json({
        erro: {
        codigo: 'ROTA_NAO_ENCONTRADA',
        mensagem: 'Recurso não encontrado.'
        }
    });
    }

    // Global de tratamento de erros da aplicação 
    function tratarErros(erro, _req, res, _next) {
        // Verifica se o objeto de erro possui um status HTTP customizado definido
    if (erro.status) {
        return res.status(erro.status).json({
        erro: {
            codigo: erro.codigo || 'ERRO_APLICACAO',
            mensagem: erro.message
        }
        });
    }

    // Caso seja um erro não tratado, registra os detalhes do erro no console para rastreio e monitoramento.
    console.error({
        evento: 'erro_interno',
        tipo: erro.name
    });

    // Retorna uma resposta HTTP 500 genérica
    return res.status(500).json({
        erro: {
        codigo: 'ERRO_INTERNO',
        mensagem: 'Ocorreu um erro ao criar sua conta. Tente novamente.'
        }
    });
}

module.exports = {
    rotaNaoEncontrada,
    tratarErros
};