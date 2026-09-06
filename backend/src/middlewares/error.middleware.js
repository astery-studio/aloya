function rotaNaoEncontrada(_req, res) {
    return res.status(404).json({
        erro: {
        codigo: 'ROTA_NAO_ENCONTRADA',
        mensagem: 'Recurso não encontrado.'
        }
    });
    }

module.exports = {
    rotaNaoEncontrada,
};